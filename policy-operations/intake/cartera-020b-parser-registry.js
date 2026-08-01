import {
  INTAKE_DOCUMENT_TYPES,
  INTAKE_PARSER_RESOLUTION_STATES,
  createParserDescriptor,
} from './cartera-020b-intake-contracts.js';

const normalize = (value) => value === null || value === undefined
  ? null
  : String(value).trim().toUpperCase();

function matchDimension(expected, actual) {
  if (expected === '*') return 1;
  return normalize(expected) === normalize(actual) ? 4 : -Infinity;
}

function descriptorScore(descriptor, request) {
  if (descriptor.documentType !== request.documentType) return -Infinity;
  const carrierScore = matchDimension(descriptor.carrier, request.carrier);
  const productScore = matchDimension(descriptor.product, request.product);
  if (!Number.isFinite(carrierScore) || !Number.isFinite(productScore)) return -Infinity;
  return descriptor.priority * 100 + carrierScore * 10 + productScore;
}

export function createPolicyParserRegistry(descriptors = []) {
  const byIdentity = new Map();

  for (const input of descriptors) {
    const descriptor = createParserDescriptor(input);
    const identity = `${descriptor.parserId}@${descriptor.parserVersion}`;
    if (byIdentity.has(identity)) throw new TypeError(`duplicate_parser_identity:${identity}`);
    byIdentity.set(identity, descriptor);
  }

  const entries = Object.freeze([...byIdentity.values()]);

  function resolve({ carrier = null, documentType, product = null, filename = undefined } = {}) {
    if (filename !== undefined) {
      throw new TypeError('filename_cannot_select_parser');
    }
    if (!Object.values(INTAKE_DOCUMENT_TYPES).includes(documentType)) {
      throw new TypeError('unsupported_document_type');
    }
    if (!carrier) {
      return Object.freeze({
        state: INTAKE_PARSER_RESOLUTION_STATES.UNKNOWN_CARRIER,
        parser: null,
        candidates: Object.freeze([]),
        createsTruth: false,
      });
    }
    if (!product) {
      const carrierCandidates = entries.filter((entry) => (
        entry.documentType === documentType && (entry.carrier === '*' || normalize(entry.carrier) === normalize(carrier))
      ));
      if (carrierCandidates.every((entry) => entry.product !== '*')) {
        return Object.freeze({
          state: INTAKE_PARSER_RESOLUTION_STATES.UNKNOWN_PRODUCT,
          parser: null,
          candidates: Object.freeze(carrierCandidates),
          createsTruth: false,
        });
      }
    }

    const ranked = entries
      .map((entry) => ({ entry, score: descriptorScore(entry, { carrier, documentType, product }) }))
      .filter(({ score }) => Number.isFinite(score))
      .sort((left, right) => right.score - left.score || left.entry.parserId.localeCompare(right.entry.parserId));

    if (ranked.length === 0) {
      return Object.freeze({
        state: INTAKE_PARSER_RESOLUTION_STATES.UNSUPPORTED,
        parser: null,
        candidates: Object.freeze([]),
        createsTruth: false,
      });
    }

    const bestScore = ranked[0].score;
    const best = ranked.filter(({ score }) => score === bestScore).map(({ entry }) => entry);
    if (best.length > 1) {
      return Object.freeze({
        state: INTAKE_PARSER_RESOLUTION_STATES.AMBIGUOUS,
        parser: null,
        candidates: Object.freeze(best),
        createsTruth: false,
      });
    }

    return Object.freeze({
      state: INTAKE_PARSER_RESOLUTION_STATES.MATCHED,
      parser: best[0],
      candidates: Object.freeze(best),
      createsTruth: false,
    });
  }

  async function parse(request = {}) {
    const resolution = resolve(request);
    if (resolution.state !== INTAKE_PARSER_RESOLUTION_STATES.MATCHED) return resolution;
    if (typeof resolution.parser.parse !== 'function') {
      return Object.freeze({
        state: INTAKE_PARSER_RESOLUTION_STATES.UNSUPPORTED,
        parser: resolution.parser,
        candidates: resolution.candidates,
        reason: 'parser_runtime_not_registered',
        createsTruth: false,
      });
    }
    const candidate = await resolution.parser.parse(request);
    return Object.freeze({
      ...resolution,
      candidate,
      createsTruth: false,
    });
  }

  return Object.freeze({ entries, resolve, parse });
}
