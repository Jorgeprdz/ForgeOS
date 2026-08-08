import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const FUNCTION_VERSION = "cartera-pdf-intake-v2-recovery-review";
const MODEL_VERSION = "gemini-3.1-flash-lite";
const MAX_BYTES = 8 * 1024 * 1024;
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

function sanitizeRows(rows: unknown) {
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, 500).map((row: any, index) => ({
    id: `candidate_${String(index + 1).padStart(3, "0")}`,
    person: typeof row?.person === "string" ? row.person.trim().slice(0, 180) : "",
    insured: typeof row?.insured === "string" ? row.insured.trim().slice(0, 180) : "",
    contractor: typeof row?.contractor === "string" ? row.contractor.trim().slice(0, 180) : "",
    policyNumber: typeof row?.policyNumber === "string" ? row.policyNumber.trim().slice(0, 120) : "",
    product: typeof row?.product === "string" ? row.product.trim().slice(0, 180) : "",
    status: typeof row?.status === "string" ? row.status.trim().slice(0, 100) : "",
    premium: typeof row?.premium === "string" ? row.premium.trim().slice(0, 100) : "",
    effectiveDate: typeof row?.effectiveDate === "string" ? row.effectiveDate.trim().slice(0, 80) : "",
    expirationDate: typeof row?.expirationDate === "string" ? row.expirationDate.trim().slice(0, 80) : "",
    confidence: Number.isFinite(Number(row?.confidence)) ? Math.max(0, Math.min(1, Number(row.confidence))) : 0,
    requiresHumanReview: true,
  })).filter((row) =>
    row.person || row.insured || row.contractor || row.policyNumber || row.product ||
    row.status || row.premium || row.effectiveDate || row.expirationDate
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
    status: "",
    premium: "",
    effectiveDate: "",
    expirationDate: "",
    confidence: 0,
    requiresHumanReview: true,
  };
}

async function extractCandidates(model: any, base64: string, recovery = false) {
  const prompt = recovery
    ? `Segunda pasada de recuperación. Revisa cuidadosamente el PDF como documento de seguro. Busca etiquetas y variantes como: contratante, titular, propietario, asegurado, nombre del asegurado, número de póliza, póliza, certificado, plan, producto, cobertura principal, prima, prima anual/mensual, vigencia, fecha de inicio, fecha de término, vencimiento, estatus.\n\nNo inventes ni completes datos ausentes. Si sólo encuentras uno de esos datos, devuelve de todos modos un candidato con ese único dato y deja los demás campos vacíos. Devuelve JSON válido con {"candidates":[{"person":"","insured":"","contractor":"","policyNumber":"","product":"","status":"","premium":"","effectiveDate":"","expirationDate":"","confidence":0.0}]}. Todo resultado es staging y requiere revisión humana.`
    : `Extrae únicamente datos visibles de pólizas de este PDF. No inventes ni completes datos ausentes.\n\nMapeo: person = titular/propietario/contratante principal cuando sea visible; insured = asegurado cuando sea visible; contractor = contratante cuando sea visible. policyNumber = número de póliza/certificado; product = plan/producto; premium = prima; effectiveDate/expirationDate = vigencia.\n\nSi sólo puedes identificar uno de esos campos, devuelve de todos modos un candidato con ese dato y deja los demás campos vacíos. Devuelve JSON válido con {"candidates":[{"person":"","insured":"","contractor":"","policyNumber":"","product":"","status":"","premium":"","effectiveDate":"","expirationDate":"","confidence":0.0}]}. Todo resultado es staging y requiere revisión humana.`;

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
    });
  } catch (error) {
    return response({
      error: "pdf_intake_unavailable",
      message: error instanceof Error ? error.message : String(error),
      persisted: false,
    }, 503);
  }
});