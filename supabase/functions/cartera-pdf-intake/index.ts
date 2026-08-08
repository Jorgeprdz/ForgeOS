import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const FUNCTION_VERSION = "cartera-pdf-intake-v3-semantic-review-012";
const MODEL_VERSION = "gemini-3.1-flash-lite";
const MAX_BYTES = 8 * 1024 * 1024;
const MONTHS: Record<string, string> = {
  ENE: "01", FEB: "02", MAR: "03", ABR: "04", MAY: "05", JUN: "06",
  JUL: "07", AGO: "08", SEP: "09", OCT: "10", NOV: "11", DIC: "12",
};
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function text(value: unknown, max = 240) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function ascii(value: unknown) {
  return text(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function numberValue(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number"
    ? value
    : Number(String(value).replace(/,/g, "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function validCivilDate(year: number, month: number, day: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

function civilDate(value: unknown) {
  const source = ascii(value);
  if (!source) return null;
  let year = 0, month = 0, day = 0;
  let match = source.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    year = Number(match[1]); month = Number(match[2]); day = Number(match[3]);
  } else {
    match = source.match(/^(\d{1,2})[\/-]([A-Z]{3,})[\/-](\d{4})$/);
    if (match) {
      day = Number(match[1]);
      month = Number(MONTHS[match[2].slice(0, 3)] || 0);
      year = Number(match[3]);
    } else {
      match = source.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
      if (match) {
        day = Number(match[1]); month = Number(match[2]); year = Number(match[3]);
      }
    }
  }
  if (!validCivilDate(year, month, day)) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function currency(value: unknown) {
  const normalized = ascii(value);
  return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
}

function paymentFrequency(value: unknown) {
  const normalized = ascii(value);
  if (/MENSUAL|MONTHLY/.test(normalized)) return "MONTHLY";
  if (/TRIMESTRAL|QUARTERLY/.test(normalized)) return "QUARTERLY";
  if (/SEMESTRAL|SEMIANNUAL|SEMI-ANNUAL/.test(normalized)) return "SEMIANNUAL";
  if (/ANUAL|ANNUAL|YEARLY/.test(normalized)) return "ANNUAL";
  if (/UNICO|UNICA|SINGLE/.test(normalized)) return "SINGLE";
  return null;
}

function policyStatus(value: unknown) {
  const normalized = ascii(value);
  if (!normalized || normalized === "NORMAL") return null;
  if (/ACTIVA|ACTIVE/.test(normalized)) return "ACTIVE";
  if (/EMITIDA|ISSUED/.test(normalized)) return "ISSUED";
  if (/PENDIENTE|PENDING/.test(normalized)) return "PENDING";
  if (/SUSPENDIDA|SUSPENDED/.test(normalized)) return "SUSPENDED";
  if (/VENCIDA|LAPSED|CAIDA/.test(normalized)) return "LAPSED";
  if (/CANCELADA|CANCELLED/.test(normalized)) return "CANCELLED";
  return null;
}

function period(value: any) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const amount = numberValue(value.value);
  const unit = ascii(value.unit);
  return amount === null && !unit ? null : { value: amount, unit: unit || null };
}

function sanitizeCoverageCandidates(rows: unknown) {
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, 100).map((row: any, index) => {
    const confidence = Number(row?.confidence);
    return {
      candidateReference: text(row?.candidateReference) || `PDF_COVERAGE_CANDIDATE:${index + 1}`,
      coverageLabel: text(row?.coverageLabel || row?.label) || null,
      coverageCode: text(row?.coverageCode || row?.code, 120) || null,
      annexReference: text(row?.annexReference || row?.annex, 120) || null,
      sumInsured: numberValue(row?.sumInsured),
      currency: currency(row?.currency),
      effectiveFrom: civilDate(row?.effectiveFrom),
      coveragePeriod: period(row?.coveragePeriod),
      paymentPeriod: period(row?.paymentPeriod),
      premiumAmount: numberValue(row?.premiumAmount),
      source: text(row?.source) || "PDF_DOCUMENT",
      sourceSection: text(row?.sourceSection) || "COBERTURAS",
      sourceLocation: row?.sourceLocation ?? null,
      confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : null,
      createsTruth: false,
      requiresHumanReview: true,
    };
  }).filter((row) =>
    row.coverageLabel || row.coverageCode || row.annexReference ||
    row.sumInsured !== null || row.premiumAmount !== null
  );
}

function sanitizeRows(rows: unknown) {
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, 500).map((row: any, index) => {
    const rawStatus = text(row?.status, 100);
    let policyType = text(row?.policyType, 100).toUpperCase() || null;
    let status = policyStatus(rawStatus);
    if (!policyType && ascii(rawStatus) === "NORMAL") {
      policyType = "NORMAL";
      status = null;
    }
    return {
      id: `candidate_${String(index + 1).padStart(3, "0")}`,
      person: text(row?.person, 180),
      insured: text(row?.insured, 180),
      contractor: text(row?.contractor, 180),
      policyNumber: text(row?.policyNumber, 120),
      product: text(row?.product, 180),
      policyType,
      status,
      issueDate: civilDate(row?.issueDate),
      effectiveDate: civilDate(row?.effectiveDate),
      expirationDate: civilDate(row?.expirationDate),
      currency: currency(row?.currency),
      paymentFrequency: paymentFrequency(row?.paymentFrequency),
      basicPremiumTotal: numberValue(row?.basicPremiumTotal),
      plannedPremium: numberValue(row?.plannedPremium),
      annualTotal: numberValue(row?.annualTotal),
      beneficiariesDetected: row?.beneficiariesDetected === true,
      coverageCandidates: sanitizeCoverageCandidates(row?.coverageCandidates),
      confidence: Number.isFinite(Number(row?.confidence)) ? Math.max(0, Math.min(1, Number(row.confidence))) : 0,
      requiresHumanReview: true,
      createsTruth: false,
    };
  }).filter((row) =>
    row.person || row.insured || row.contractor || row.policyNumber || row.product ||
    row.policyType || row.status || row.issueDate || row.effectiveDate || row.expirationDate ||
    row.currency || row.paymentFrequency || row.basicPremiumTotal !== null ||
    row.plannedPremium !== null || row.annualTotal !== null || row.coverageCandidates.length
  );
}

function emptyReviewCandidate() {
  return {
    id: "candidate_001",
    person: "",
    insured: "",
    contractor: "",
    policyNumber: "",
    product: "",
    policyType: null,
    status: null,
    issueDate: null,
    effectiveDate: null,
    expirationDate: null,
    currency: null,
    paymentFrequency: null,
    basicPremiumTotal: null,
    plannedPremium: null,
    annualTotal: null,
    beneficiariesDetected: false,
    coverageCandidates: [],
    confidence: 0,
    requiresHumanReview: true,
    createsTruth: false,
  };
}

const semanticContract = `Devuelve JSON válido con:
{"candidates":[{
"person":"","insured":"","contractor":"",
"policyNumber":"","product":"",
"policyType":"","status":"",
"issueDate":"","effectiveDate":"","expirationDate":"",
"currency":"","paymentFrequency":"",
"basicPremiumTotal":null,"plannedPremium":null,"annualTotal":null,
"beneficiariesDetected":false,
"coverageCandidates":[{
"coverageLabel":"","coverageCode":"","annexReference":"",
"sumInsured":null,"currency":"","effectiveFrom":"",
"coveragePeriod":{"value":null,"unit":""},
"paymentPeriod":{"value":null,"unit":""},
"premiumAmount":null,
"source":"PDF_DOCUMENT","sourceSection":"COBERTURAS","sourceLocation":null,
"confidence":0.0
}],
"confidence":0.0
}]}.`;

async function extractCandidates(model: any, base64: string, recovery = false) {
  const prefix = recovery
    ? "Segunda pasada de recuperación. Revisa cuidadosamente el PDF como documento de seguro."
    : "Extrae únicamente hechos visibles de pólizas de este PDF.";

  const prompt = `${prefix}

No inventes ni completes datos ausentes.
Separa estrictamente significado documental:
- TIPO DE PÓLIZA / TIPO DE POLIZA pertenece a policyType. NORMAL es policyType; NUNCA es status.
- status sólo contiene estado real como activa, emitida, pendiente, suspendida, vencida o cancelada. Si no hay evidencia de estado, déjalo vacío.
- FECHA DE EMISIÓN, FECHA DE EFECTIVIDAD y FECHA DE VENCIMIENTO son fechas civiles; conserva el día del documento.
- MONEDA UDI debe producir currency=UDI; nunca la conviertas a MXN.
- FORMA DE PAGO MENSUAL/TRIMESTRAL/SEMESTRAL/ANUAL pertenece a paymentFrequency.
- PRIMA BÁSICA TOTAL / PRIMA BASICA TOTAL, PRIMA PLANEADA y TOTAL ANUAL son tres hechos distintos. No los colapses en premium.
- Si existe tabla de coberturas, extrae una fila por beneficio con suma asegurada, moneda, anexo, fecha de efectividad, periodo de cobertura, periodo de pago y prima cuando existan.
- beneficiariesDetected sólo indica presencia documental; no devuelvas nombres ni porcentajes de beneficiarios.
- Todo resultado es evidencia/candidato, requiresHumanReview=true y crea cero verdad canónica.

${semanticContract}`;

  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "application/pdf", data: base64 } },
      ],
    }],
    generationConfig: { responseMimeType: "application/json", temperature: recovery ? 0.1 : 0.05 },
  });

  const parsed = JSON.parse(result.response.text());
  return sanitizeRows(parsed?.candidates);
}

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "method_not_allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization") || "";
    const client = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } },
    );
    const { data: { user } } = await client.auth.getUser();
    if (!user) return response({ error: "auth_required" }, 401);

    const body = await request.json();
    if (body?.mimeType !== "application/pdf") return response({ error: "pdf_required" }, 400);
    const base64 = typeof body?.base64 === "string" ? body.base64 : "";
    if (!base64) return response({ error: "file_required" }, 400);
    const bytes = decodeBase64(base64);
    if (bytes.byteLength > MAX_BYTES) return response({ error: "file_too_large", maxBytes: MAX_BYTES }, 413);
    if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
      return response({ error: "invalid_pdf_signature" }, 400);
    }

    const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");
    const model = genAI.getGenerativeModel({ model: MODEL_VERSION });

    let candidates = await extractCandidates(model, base64, false);
    let recoveryUsed = false;
    const warnings: string[] = [];

    if (candidates.length === 0) {
      recoveryUsed = true;
      candidates = await extractCandidates(model, base64, true);
    }

    let extractionState = "FIELDS_EXTRACTED";
    if (candidates.length === 0) {
      extractionState = "NO_FIELDS_REVIEW_REQUIRED";
      warnings.push("PDF_EXTRACTION_NO_FIELDS");
      candidates = [emptyReviewCandidate()];
    }

    return response({
      ok: true,
      intakeId: crypto.randomUUID(),
      fileName: typeof body?.fileName === "string" ? body.fileName.slice(0, 240) : "cartera.pdf",
      functionVersion: FUNCTION_VERSION,
      modelVersion: MODEL_VERSION,
      state: "review",
      extractionState,
      recoveryUsed,
      warnings,
      candidates,
      requiresHumanReview: true,
      persisted: false,
      automaticPolicyCreation: false,
      automaticCoverageCreation: false,
    });
  } catch (error) {
    return response({
      error: "pdf_intake_unavailable",
      message: error instanceof Error ? error.message : String(error),
      persisted: false,
    }, 503);
  }
});
