export function parsearComando({ input = '' }) {
  const raw = String(input);
  const normalized = raw.trim();

  if (!normalized) {
    return { type: 'UNKNOWN', value: '', raw };
  }

  if (normalized.startsWith('/')) {
    return {
      type: 'EXPLICIT_COMMAND_HINT',
      value: normalized.slice(1).trim(),
      raw,
    };
  }

  if (normalized.startsWith('@')) {
    return {
      type: 'ENTITY_HINT',
      value: normalized.slice(1).trim(),
      raw,
    };
  }

  return {
    type: 'NATURAL_LANGUAGE_OR_SEARCH',
    value: normalized,
    raw,
  };
}
