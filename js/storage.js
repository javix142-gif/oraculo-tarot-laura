export const HISTORY_KEY = 'oraculo-tarot-laura:history:v1';
export const MAX_HISTORY = 20;

function resolveStorage(storage) {
  const target = storage ?? globalThis.localStorage;
  if (!target || typeof target.getItem !== 'function' || typeof target.setItem !== 'function') {
    throw new TypeError('No existe un almacenamiento compatible.');
  }
  return target;
}

function isStoredCard(value) {
  return Boolean(
    value && typeof value === 'object' && typeof value.position === 'string' &&
    typeof value.cardId === 'string' && Number.isInteger(value.number) &&
    typeof value.name === 'string' && Array.isArray(value.keywords) &&
    value.keywords.every((word) => typeof word === 'string') &&
    typeof value.visual === 'string' && typeof value.interpretation === 'string'
  );
}

function isReading(value) {
  return Boolean(
    value && typeof value === 'object' && typeof value.id === 'string' && value.id.trim() &&
    typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt)) &&
    typeof value.spreadType === 'string' && typeof value.spreadLabel === 'string' &&
    typeof value.question === 'string' && Array.isArray(value.cards) &&
    value.cards.length >= 1 && value.cards.length <= 3 && value.cards.every(isStoredCard)
  );
}

export function getHistory(storage) {
  const target = resolveStorage(storage);
  try {
    const parsed = JSON.parse(target.getItem(HISTORY_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isReading).slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

export function saveReading(reading, storage) {
  if (!isReading(reading)) throw new TypeError('La lectura no tiene un formato válido.');
  const target = resolveStorage(storage);
  const current = getHistory(target).filter((item) => item.id !== reading.id);
  const updated = [reading, ...current].slice(0, MAX_HISTORY);
  target.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteReading(readingId, storage) {
  if (typeof readingId !== 'string' || !readingId.trim()) return getHistory(storage);
  const target = resolveStorage(storage);
  const updated = getHistory(target).filter((item) => item.id !== readingId);
  target.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(storage) {
  const target = resolveStorage(storage);
  target.removeItem(HISTORY_KEY);
}
