import test from 'node:test';
import assert from 'node:assert/strict';
import { TAROT_CARDS } from '../js/tarot-data.js';
import { SPREADS, buildReading, drawCards, getSpread, normalizeQuestion, shuffleDeck, validateDeck } from '../js/tarot-engine.js';
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
  const storage = new MemoryStorage();
  storage.setItem('oraculo-tarot-laura:history:v1', '{no-json');
  assert.deepEqual(getHistory(storage), []);
  storage.setItem('oraculo-tarot-laura:history:v1', JSON.stringify([{ id: 'alterada', createdAt: 'x', cards: [{}] }]));
  assert.deepEqual(getHistory(storage), []);
});
