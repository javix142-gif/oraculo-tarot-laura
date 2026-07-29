import test from 'node:test';
import assert from 'node:assert/strict';
import { TAROT_CARDS } from '../js/tarot-data.js';
import {
  SPREADS,
  buildReading,
  claimReadingCompletion,
  createSelectionAttempt,
  drawCards,
  getSelectionProgress,
  getSpread,
  normalizeQuestion,
  shuffleDeck,
  validateDeck,
} from '../js/tarot-engine.js';
import { MAX_HISTORY, clearHistory, deleteReading, getHistory, saveReading } from '../js/storage.js';

class MemoryStorage {
  #items = new Map();
  getItem(key) { return this.#items.has(key) ? this.#items.get(key) : null; }
  setItem(key, value) { this.#items.set(key, String(value)); }
  removeItem(key) { this.#items.delete(key); }
}

const deterministicRandom = (() => {
  let value = 0;
  return () => (value = (value + 0.173) % 1);
})();

test('existen exactamente 22 Arcanos Mayores', () => {
  assert.equal(TAROT_CARDS.length, 22);
  assert.deepEqual(TAROT_CARDS.map((card) => card.number), [...Array(22).keys()]);
});

test('todos los identificadores son únicos', () => {
  assert.equal(new Set(TAROT_CARDS.map((card) => card.id)).size, 22);
});

test('todas las cartas tienen campos obligatorios y palabras clave válidas', () => {
  assert.equal(validateDeck(TAROT_CARDS), true);
  const required = ['id','number','name','keywords','meaning','past','present','future','visual'];
  for (const card of TAROT_CARDS) {
    for (const field of required) assert.ok(card[field] !== undefined, `${card.name}: falta ${field}`);
    assert.ok(card.keywords.length >= 3 && card.keywords.length <= 5);
  }
});

test('el barajado devuelve una copia con las mismas 22 cartas', () => {
  const shuffled = shuffleDeck(TAROT_CARDS, deterministicRandom);
  assert.equal(shuffled.length, 22);
  assert.notEqual(shuffled, TAROT_CARDS);
  assert.deepEqual(new Set(shuffled.map((card) => card.id)), new Set(TAROT_CARDS.map((card) => card.id)));
});

test('Carta del día devuelve exactamente una carta', () => {
  assert.equal(drawCards(TAROT_CARDS, 'daily', deterministicRandom).length, 1);
});

test('Pasado, presente y futuro devuelve exactamente tres cartas sin repetición', () => {
  const cards = drawCards(TAROT_CARDS, 'timeline', deterministicRandom);
  assert.equal(cards.length, 3);
  assert.equal(new Set(cards.map((item) => item.card.id)).size, 3);
});

test('las posiciones se asignan en orden correcto', () => {
  const cards = drawCards(TAROT_CARDS, 'timeline', deterministicRandom);
  assert.deepEqual(cards.map((item) => item.position), ['Pasado','Presente','Futuro']);
  assert.deepEqual(SPREADS.timeline.positions, ['Pasado','Presente','Futuro']);
});

test('el progreso de tres cartas deriva 1 de 3, 2 de 3 y 3 de 3 desde las selecciones', () => {
  assert.deepEqual(getSelectionProgress('timeline', 0), {
    complete: false, position: 'Pasado', current: 1, total: 3, instruction: 'Elige la carta del Pasado',
  });
  assert.deepEqual(getSelectionProgress('timeline', 1), {
    complete: false, position: 'Presente', current: 2, total: 3, instruction: 'Elige la carta del Presente',
  });
  assert.deepEqual(getSelectionProgress('timeline', 2), {
    complete: false, position: 'Futuro', current: 3, total: 3, instruction: 'Elige la carta del Futuro',
  });
  assert.deepEqual(getSelectionProgress('timeline', 3), {
    complete: true, position: null, current: 3, total: 3, instruction: 'Lectura completa',
  });
});

test('Carta del día conserva un flujo de una carta sin progreso 1 de 3', () => {
  const initial = getSelectionProgress('daily', 0);
  const complete = getSelectionProgress('daily', 1);
  assert.equal(initial.position, 'General');
  assert.equal(initial.current, 1);
  assert.equal(initial.total, 1);
  assert.equal(initial.instruction, 'Elige una carta');
  assert.equal(complete.complete, true);
  assert.equal(complete.total, 1);
});

test('la selección protegida asigna Pasado, Presente y Futuro sin duplicados ni una cuarta carta', () => {
  let selections = [];
  const first = createSelectionAttempt({ spreadType: 'timeline', selections, card: TAROT_CARDS[0] });
  assert.equal(first.accepted, true);
  assert.equal(first.position, 'Pasado');
  selections = first.selections;

  const duplicate = createSelectionAttempt({ spreadType: 'timeline', selections, card: TAROT_CARDS[0] });
  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.selections, selections);

  const second = createSelectionAttempt({ spreadType: 'timeline', selections, card: TAROT_CARDS[1] });
  assert.equal(second.position, 'Presente');
  selections = second.selections;

  const third = createSelectionAttempt({ spreadType: 'timeline', selections, card: TAROT_CARDS[2] });
  assert.equal(third.position, 'Futuro');
  assert.equal(third.complete, true);
  selections = third.selections;

  const fourth = createSelectionAttempt({ spreadType: 'timeline', selections, card: TAROT_CARDS[3] });
  assert.equal(fourth.accepted, false);
  assert.equal(fourth.complete, true);
  assert.equal(selections.length, 3);
});

test('la selección se rechaza mientras existe bloqueo o finalización programada', () => {
  const locked = createSelectionAttempt({
    spreadType: 'timeline', selections: [], card: TAROT_CARDS[0], locked: true,
  });
  const completed = createSelectionAttempt({
    spreadType: 'timeline', selections: [], card: TAROT_CARDS[0], completed: true,
  });
  assert.equal(locked.accepted, false);
  assert.equal(completed.accepted, false);
});

test('la finalización de una sesión solo puede reclamarse una vez', () => {
  const session = { readingCompleted: false, completionScheduled: true };
  assert.equal(claimReadingCompletion(session), true);
  assert.equal(session.readingCompleted, true);
  assert.equal(session.completionScheduled, false);
  assert.equal(claimReadingCompletion(session), false);
});

test('buildReading conserva pregunta saneada y la interpretación de cada posición', () => {
  const selections = TAROT_CARDS.slice(0, 3).map((card) => ({ card }));
  const reading = buildReading({
    spreadType: 'timeline', question: '  ¿Qué   debo observar?  ', selections,
    now: new Date('2026-07-27T12:00:00.000Z'), idFactory: () => 'lectura-prueba',
  });
  assert.equal(reading.question, '¿Qué debo observar?');
  assert.deepEqual(reading.cards.map((item) => item.position), ['Pasado','Presente','Futuro']);
  assert.equal(reading.cards[0].interpretation, TAROT_CARDS[0].past);
  assert.equal(reading.cards[1].interpretation, TAROT_CARDS[1].present);
  assert.equal(reading.cards[2].interpretation, TAROT_CARDS[2].future);
});

test('el historial no supera 20 registros', () => {
  const storage = new MemoryStorage();
  for (let index = 0; index < 25; index += 1) {
    saveReading({
      id: `id-${index}`, createdAt: new Date(2026, 0, index + 1).toISOString(),
      spreadType: 'daily', spreadLabel: 'Carta del día', question: '',
      cards: [{ position: 'General', cardId: 'arcano-00', number: 0, name: 'El Loco', keywords: ['a','b','c'], visual: 'x.svg', interpretation: 'Texto' }],
    }, storage);
  }
  assert.equal(getHistory(storage).length, MAX_HISTORY);
  assert.equal(getHistory(storage)[0].id, 'id-24');
});

test('el historial permite eliminar una lectura y eliminar todo', () => {
  const storage = new MemoryStorage();
  const storedCard = { position: 'General', cardId: 'arcano-00', number: 0, name: 'El Loco', keywords: ['inicio','libertad','curiosidad'], visual: 'assets/cards/00-el-loco.svg', interpretation: 'Texto' };
  const base = { createdAt: new Date().toISOString(), spreadType: 'daily', spreadLabel: 'Carta del día', question: '', cards: [storedCard] };
  saveReading({ ...base, id: 'a' }, storage);
  saveReading({ ...base, id: 'b' }, storage);
  deleteReading('a', storage);
  assert.deepEqual(getHistory(storage).map((item) => item.id), ['b']);
  clearHistory(storage);
  assert.deepEqual(getHistory(storage), []);
});

test('entradas inválidas se rechazan o saneen sin romper la lógica', () => {
  assert.equal(normalizeQuestion(null), '');
  assert.equal(normalizeQuestion('   '), '');
  assert.equal(normalizeQuestion('x'.repeat(250)).length, 200);
  assert.throws(() => getSpread('inexistente'), RangeError);
  assert.throws(() => shuffleDeck([]), TypeError);
  assert.throws(() => buildReading({ spreadType: 'daily', selections: [] }), RangeError);
  assert.throws(() => createSelectionAttempt({ spreadType: 'daily', selections: null, card: TAROT_CARDS[0] }), TypeError);
  const storage = new MemoryStorage();
  storage.setItem('oraculo-tarot-laura:history:v1', '{no-json');
  assert.deepEqual(getHistory(storage), []);
  storage.setItem('oraculo-tarot-laura:history:v1', JSON.stringify([{ id: 'alterada', createdAt: 'x', cards: [{}] }]));
  assert.deepEqual(getHistory(storage), []);
});
