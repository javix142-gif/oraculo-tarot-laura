export const SPREADS = Object.freeze({
  daily: Object.freeze({ id: 'daily', label: 'Carta del día', positions: Object.freeze(['General']) }),
  timeline: Object.freeze({ id: 'timeline', label: 'Pasado, presente y futuro', positions: Object.freeze(['Pasado', 'Presente', 'Futuro']) }),
});

const INTERPRETATION_FIELD = Object.freeze({
  General: 'meaning',
  Pasado: 'past',
  Presente: 'present',
  Futuro: 'future',
});

export function normalizeQuestion(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function getSpread(spreadType) {
  const spread = SPREADS[spreadType];
  if (!spread) throw new RangeError(`Tipo de tirada no válido: ${String(spreadType)}`);
  return spread;
}

export function getSelectionProgress(spreadType, selectionCount) {
  const spread = getSpread(spreadType);
  const total = spread.positions.length;
  const numericCount = Number.isInteger(selectionCount) ? selectionCount : 0;
  const completedCount = Math.min(Math.max(numericCount, 0), total);

  if (completedCount >= total) {
    return Object.freeze({
      complete: true,
      position: null,
      current: total,
      total,
      instruction: 'Lectura completa',
    });
  }

  const position = spread.positions[completedCount];
  return Object.freeze({
    complete: false,
    position,
    current: completedCount + 1,
    total,
    instruction: position === 'General' ? 'Elige una carta' : `Elige la carta del ${position}`,
  });
}

export function createSelectionAttempt({
  spreadType,
  selections,
  card,
  locked = false,
  completed = false,
} = {}) {
  const spread = getSpread(spreadType);
  if (!Array.isArray(selections)) throw new TypeError('Las selecciones deben ser una lista.');
  const hasValidCard = card && typeof card.id === 'string' && card.id.trim();
  const duplicate = hasValidCard && selections.some((selection) => selection?.card?.id === card.id);
  const full = selections.length >= spread.positions.length;

  if (!hasValidCard || locked || completed || duplicate || full) {
    return Object.freeze({
      accepted: false,
      selections,
      position: null,
      complete: full,
    });
  }

  const position = spread.positions[selections.length];
  const nextSelections = [...selections, { card, position }];
  return Object.freeze({
    accepted: true,
    selections: nextSelections,
    position,
    complete: nextSelections.length === spread.positions.length,
  });
}

export function claimReadingCompletion(session) {
  if (!session || typeof session !== 'object') throw new TypeError('La sesión de lectura no es válida.');
  if (session.readingCompleted) return false;
  session.readingCompleted = true;
  session.completionScheduled = false;
  return true;
}

export function validateDeck(deck) {
  if (!Array.isArray(deck) || deck.length !== 22) return false;
  const required = ['id', 'number', 'name', 'keywords', 'meaning', 'past', 'present', 'future', 'visual'];
  const ids = new Set();
  for (const card of deck) {
    if (!card || required.some((field) => !(field in card))) return false;
    if (typeof card.id !== 'string' || ids.has(card.id)) return false;
    if (!Array.isArray(card.keywords) || card.keywords.length < 3 || card.keywords.length > 5) return false;
    ids.add(card.id);
  }
  return ids.size === 22;
}

export function shuffleDeck(deck, random = Math.random) {
  if (!validateDeck(deck)) throw new TypeError('El mazo debe contener 22 cartas válidas y únicas.');
  if (typeof random !== 'function') throw new TypeError('La fuente aleatoria debe ser una función.');

  const shuffled = [...deck];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const value = Number(random());
    const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.9999999999999999) : 0;
    const target = Math.floor(safeValue * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export function drawCards(deck, spreadType, random = Math.random) {
  const spread = getSpread(spreadType);
  const shuffled = shuffleDeck(deck, random);
  return spread.positions.map((position, index) => ({
    position,
    card: shuffled[index],
    interpretation: shuffled[index][INTERPRETATION_FIELD[position]],
  }));
}

export function buildReading({ spreadType, question = '', selections, now = new Date(), idFactory } = {}) {
  const spread = getSpread(spreadType);
  if (!Array.isArray(selections) || selections.length !== spread.positions.length) {
    throw new RangeError(`La tirada ${spread.label} requiere ${spread.positions.length} carta(s).`);
  }
  const cardIds = selections.map((selection) => selection?.card?.id);
  if (cardIds.some((id) => typeof id !== 'string') || new Set(cardIds).size !== cardIds.length) {
    throw new TypeError('Las cartas seleccionadas deben ser válidas y no repetirse.');
  }

  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(date.getTime())) throw new TypeError('La fecha de la lectura no es válida.');

  return {
    id: typeof idFactory === 'function' ? String(idFactory()) : createReadingId(date),
    createdAt: date.toISOString(),
    spreadType,
    spreadLabel: spread.label,
    question: normalizeQuestion(question),
    cards: selections.map((selection, index) => {
      const position = spread.positions[index];
      const card = selection.card;
      return {
        position,
        cardId: card.id,
        number: card.number,
        name: card.name,
        keywords: [...card.keywords],
        visual: card.visual,
        interpretation: card[INTERPRETATION_FIELD[position]],
      };
    }),
  };
}

function createReadingId(date) {
  const randomPart = Math.random().toString(36).slice(2, 9);
  return `lectura-${date.getTime()}-${randomPart}`;
}
