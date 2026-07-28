import { TAROT_CARDS } from './tarot-data.js';
import { SPREADS, buildReading, getSpread, normalizeQuestion, shuffleDeck, validateDeck } from './tarot-engine.js';
import { clearHistory, deleteReading, getHistory, saveReading } from './storage.js';

const state = {
  screen: 'home',
  previousScreen: 'home',
  spreadType: 'daily',
  question: '',
  shuffledDeck: [],
  selections: [],
  currentReading: null,
  deferredInstallPrompt: null,
};

const elements = {};
const dialogReturnFocus = new WeakMap();
let toastTimer;

function queryElements() {
  const ids = [
    'back-button', 'home-brand', 'about-button', 'start-button', 'history-button', 'install-button',
    'reading-form', 'question-input', 'question-count', 'remaining-count', 'draw-instruction',
    'reading-context', 'shuffle-status', 'deck-grid', 'selection-progress', 'result-date',
    'result-question', 'result-cards', 'new-reading-button', 'share-reading-button', 'result-home-button', 'clear-history-button',
    'history-empty', 'history-list', 'empty-start-button', 'detail-date', 'detail-question', 'detail-cards', 'detail-share-button',
    'about-dialog', 'close-about-button', 'dialog-ok-button', 'confirm-dialog', 'confirm-message', 'toast',
  ];
  ids.forEach((id) => { elements[toCamel(id)] = document.getElementById(id); });
  elements.screens = [...document.querySelectorAll('[data-screen]')];
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function init() {
  queryElements();
  if (!validateDeck(TAROT_CARDS)) {
    document.body.innerHTML = '<main><p>No fue posible cargar el mazo de tarot.</p></main>';
    return;
  }
  bindEvents();
  renderHistory();
  updateShareButtonLabels();
  registerServiceWorker();
  showScreen('home', { replaceHistory: true, focus: false });
}

function bindEvents() {
  elements.startButton.addEventListener('click', () => showScreen('setup'));
  elements.emptyStartButton.addEventListener('click', () => showScreen('setup'));
  elements.historyButton.addEventListener('click', () => { renderHistory(); showScreen('history'); });
  elements.homeBrand.addEventListener('click', goHome);
  elements.backButton.addEventListener('click', goBack);
  elements.aboutButton.addEventListener('click', () => showManagedDialog(elements.aboutDialog, elements.aboutButton, elements.closeAboutButton));
  elements.closeAboutButton.addEventListener('click', () => elements.aboutDialog.close());
  elements.dialogOkButton.addEventListener('click', () => elements.aboutDialog.close());
  elements.aboutDialog.addEventListener('click', closeDialogFromBackdrop);
  elements.confirmDialog.addEventListener('click', closeDialogFromBackdrop);
  elements.readingForm.addEventListener('submit', startDraw);
  elements.questionInput.addEventListener('input', updateQuestionCount);
  elements.newReadingButton.addEventListener('click', () => showScreen('setup'));
  elements.shareReadingButton.addEventListener('click', shareCurrentReading);
  elements.detailShareButton.addEventListener('click', shareCurrentReading);
  elements.resultHomeButton.addEventListener('click', goHome);
  elements.clearHistoryButton.addEventListener('click', confirmClearHistory);
  elements.installButton.addEventListener('click', installApp);
  [elements.aboutDialog, elements.confirmDialog].forEach((dialog) => dialog.addEventListener('close', () => restoreDialogFocus(dialog)));
  window.addEventListener('popstate', handlePopState);
  window.addEventListener('beforeinstallprompt', handleInstallPrompt);
  window.addEventListener('appinstalled', () => {
    state.deferredInstallPrompt = null;
    elements.installButton.classList.add('hidden');
    showToast('Aplicación instalada.');
  });
}

function showScreen(screen, { replaceHistory = false, focus = true } = {}) {
  const target = document.querySelector(`[data-screen="${screen}"]`);
  if (!target) return;
  state.previousScreen = state.screen;
  state.screen = screen;
  elements.screens.forEach((item) => {
    const active = item === target;
    item.hidden = !active;
    item.classList.toggle('active', active);
  });
  const isHome = screen === 'home';
  elements.backButton.classList.toggle('header-slot-empty', isHome);
  elements.backButton.setAttribute('aria-hidden', String(isHome));
  elements.backButton.tabIndex = isHome ? -1 : 0;
  const historyState = { screen };
  if (replaceHistory) window.history.replaceState(historyState, '', `#${screen}`);
  else if (window.history.state?.screen !== screen) window.history.pushState(historyState, '', `#${screen}`);
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (focus) requestAnimationFrame(() => document.getElementById('main-content')?.focus({ preventScroll: true }));
}

function goHome() {
  resetTransientReading();
  showScreen('home');
}

function goBack() {
  if (state.screen === 'draw' && state.selections.length) {
    if (!window.confirm('La lectura actual se perderá. ¿Deseas volver?')) return;
    resetTransientReading();
  }
  if (state.screen === 'detail') { renderHistory(); showScreen('history'); return; }
  if (state.screen === 'history' || state.screen === 'setup') { showScreen('home'); return; }
  if (state.screen === 'result') { showScreen('home'); return; }
  showScreen(state.previousScreen || 'home');
}

function handlePopState(event) {
  const target = event.state?.screen ?? 'home';
  const screen = document.querySelector(`[data-screen="${target}"]`) ? target : 'home';
  showScreen(screen, { replaceHistory: true });
}

function updateQuestionCount() {
  elements.questionCount.textContent = `${elements.questionInput.value.length} / 200`;
}

function startDraw(event) {
  event.preventDefault();
  const formData = new FormData(elements.readingForm);
  state.spreadType = formData.get('spread') === 'timeline' ? 'timeline' : 'daily';
  state.question = normalizeQuestion(elements.questionInput.value);
  elements.questionInput.value = state.question;
  updateQuestionCount();
  state.shuffledDeck = shuffleDeck(TAROT_CARDS);
  state.selections = [];
  state.currentReading = null;
  renderDeck();
  showScreen('draw');
  beginShuffleAnimation();
}

function beginShuffleAnimation() {
  const spread = getSpread(state.spreadType);
  const count = spread.positions.length;
  elements.remainingCount.textContent = count === 1 ? 'una carta' : 'tres cartas';
  elements.drawInstruction.textContent = count === 1
    ? 'Toca una carta boca abajo para revelarla.'
    : 'Elige una carta para cada posición: Pasado, Presente y Futuro.';
  elements.readingContext.hidden = !state.question;
  elements.readingContext.textContent = state.question ? `Tu pregunta: “${state.question}”` : '';
  elements.shuffleStatus.hidden = false;
  elements.deckGrid.classList.add('shuffling');
  elements.selectionProgress.textContent = '';
  window.setTimeout(() => {
    elements.shuffleStatus.hidden = true;
    elements.deckGrid.classList.remove('shuffling');
    announceNextPosition();
    elements.deckGrid.querySelector('.deck-card')?.focus();
  }, prefersReducedMotion() ? 20 : 720);
}

function renderDeck() {
  elements.deckGrid.replaceChildren(...state.shuffledDeck.map((card, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'deck-card';
    button.dataset.index = String(index);
    button.setAttribute('aria-label', `Carta boca abajo ${index + 1} de 22`);
    button.innerHTML = `
      <span class="deck-card-inner">
        <span class="deck-face deck-back"><img src="./assets/cards/card-back.svg" alt=""></span>
        <span class="deck-face deck-front"><img src="./${card.visual}" alt="${escapeHtml(card.name)}"></span>
      </span>`;
    button.addEventListener('click', () => selectCard(button, card));
    return button;
  }));
}

function selectCard(button, card) {
  const spread = getSpread(state.spreadType);
  if (button.disabled || state.selections.length >= spread.positions.length) return;
  const position = spread.positions[state.selections.length];
  state.selections.push({ card, position });
  button.disabled = true;
  button.classList.add('revealed', 'selected');
  button.setAttribute('aria-label', `${position}: ${card.name}, revelada`);
  button.setAttribute('aria-pressed', 'true');
  elements.selectionProgress.textContent = `${position}: ${card.name}`;

  if (state.selections.length >= spread.positions.length) {
    elements.deckGrid.querySelectorAll('.deck-card').forEach((item) => { item.disabled = true; });
    elements.drawInstruction.textContent = 'Lectura completa.';
    window.setTimeout(completeReading, prefersReducedMotion() ? 30 : 650);
  } else {
    announceNextPosition();
  }
}

function announceNextPosition() {
  const spread = getSpread(state.spreadType);
  const nextPosition = spread.positions[state.selections.length];
  const remaining = spread.positions.length - state.selections.length;
  elements.selectionProgress.textContent = nextPosition === 'General'
    ? 'Elige una carta.'
    : `Ahora elige: ${nextPosition}. Quedan ${remaining} carta${remaining === 1 ? '' : 's'}.`;
}

function completeReading() {
  try {
    const reading = buildReading({
      spreadType: state.spreadType,
      question: state.question,
      selections: state.selections,
    });
    saveReading(reading);
    state.currentReading = reading;
    renderReading(reading, elements.resultCards, elements.resultDate, elements.resultQuestion);
    showScreen('result');
  } catch (error) {
    console.error(error);
    showToast('No fue posible completar la lectura. Inténtalo nuevamente.');
    showScreen('setup');
  }
}

function renderReading(reading, container, dateElement, questionElement) {
  dateElement.textContent = `${reading.spreadLabel} · ${formatDate(reading.createdAt)}`;
  questionElement.hidden = !reading.question;
  questionElement.textContent = reading.question ? `Pregunta: “${reading.question}”` : '';
  container.classList.toggle('timeline', reading.cards.length === 3);
  container.replaceChildren(...reading.cards.map(createResultCard));
}

function createResultCard(item) {
  const article = document.createElement('article');
  article.className = 'result-card';
  article.innerHTML = `
    <img class="result-card-image" src="./${item.visual}" alt="Carta ${escapeHtml(item.name)}">
    <div>
      <span class="position-label">${escapeHtml(item.position)}</span>
      <h3>${escapeHtml(item.name)} <span class="card-number">· ${toRoman(item.number)}</span></h3>
      <ul class="keyword-list">${item.keywords.map((word) => `<li>${escapeHtml(word)}</li>`).join('')}</ul>
      <p class="interpretation">${escapeHtml(item.interpretation)}</p>
    </div>`;
  return article;
}

function renderHistory() {
  const history = getHistory();
  elements.clearHistoryButton.classList.toggle('hidden', history.length === 0);
  elements.historyEmpty.hidden = history.length !== 0;
  elements.historyList.replaceChildren(...history.map((reading) => {
    const item = document.createElement('article');
    item.className = 'history-item';
    const names = reading.cards.map((card) => card.name).join(' · ');
    item.innerHTML = `
      <button class="history-open" type="button">
        <strong>${escapeHtml(reading.spreadLabel)}</strong>
        <small>${escapeHtml(formatDate(reading.createdAt))}</small>
        <span class="history-summary">${escapeHtml(reading.question || names)}</span>
      </button>
      <button class="history-delete" type="button" aria-label="Eliminar lectura del ${escapeHtml(formatDate(reading.createdAt))}">×</button>`;
    item.querySelector('.history-open').addEventListener('click', () => openHistoryReading(reading));
    item.querySelector('.history-delete').addEventListener('click', () => confirmDeleteReading(reading));
    return item;
  }));
}

function openHistoryReading(reading) {
  state.currentReading = reading;
  renderReading(reading, elements.detailCards, elements.detailDate, elements.detailQuestion);
  showScreen('detail');
}

async function confirmDeleteReading(reading) {
  const confirmed = await requestConfirmation(`Se eliminará la lectura del ${formatDate(reading.createdAt)}.`);
  if (!confirmed) return;
  deleteReading(reading.id);
  renderHistory();
  showToast('Lectura eliminada.');
}

async function confirmClearHistory() {
  const confirmed = await requestConfirmation('Se eliminarán todas las lecturas guardadas en este dispositivo.');
  if (!confirmed) return;
  clearHistory();
  renderHistory();
  showToast('Historial eliminado.');
}

function requestConfirmation(message) {
  elements.confirmMessage.textContent = message;
  showManagedDialog(elements.confirmDialog, document.activeElement, elements.confirmDialog.querySelector('[value="cancel"]'));
  return new Promise((resolve) => {
    elements.confirmDialog.addEventListener('close', () => resolve(elements.confirmDialog.returnValue === 'confirm'), { once: true });
  });
}

function showManagedDialog(dialog, trigger = document.activeElement, initialFocus = null) {
  if (!dialog || dialog.open) return;
  dialogReturnFocus.set(dialog, trigger instanceof HTMLElement ? trigger : null);
  dialog.showModal();
  requestAnimationFrame(() => {
    const target = initialFocus || dialog.querySelector('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    target?.focus({ preventScroll: true });
  });
}

function restoreDialogFocus(dialog) {
  const target = dialogReturnFocus.get(dialog);
  dialogReturnFocus.delete(dialog);
  if (target?.isConnected) requestAnimationFrame(() => target.focus({ preventScroll: true }));
}

function updateShareButtonLabels() {
  const label = typeof navigator.share === 'function' ? 'Compartir lectura' : 'Copiar lectura';
  elements.shareReadingButton.textContent = label;
  elements.detailShareButton.textContent = label;
}

async function shareCurrentReading() {
  const reading = state.currentReading;
  if (!reading) {
    showToast('No hay una lectura disponible para compartir.');
    return;
  }
  const text = formatReadingForSharing(reading);
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Oráculo Tarot Laura', text });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }
  try {
    await copyReadingText(text);
    showToast('Lectura copiada.');
  } catch (error) {
    console.warn('No fue posible copiar la lectura.', error);
    showToast('No fue posible compartir ni copiar la lectura.');
  }
}

function formatReadingForSharing(reading) {
  const lines = [
    'Oráculo Tarot Laura — Lectura y Cartas',
    `${reading.spreadLabel} · ${formatDate(reading.createdAt)}`,
  ];
  if (reading.question) lines.push(`Pregunta: “${reading.question}”`);
  for (const card of reading.cards) {
    lines.push('', `${card.position}: ${card.name}`, `Palabras clave: ${card.keywords.join(', ')}`, card.interpretation);
  }
  lines.push('', 'Lectura recreativa y de reflexión personal.');
  return lines.join('\n');
}

async function copyReadingText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn('Clipboard API no disponible; se usará la alternativa compatible.', error);
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('La copia compatible fue rechazada.');
}

function closeDialogFromBackdrop(event) {
  if (event.target === event.currentTarget) event.currentTarget.close('cancel');
}

function resetTransientReading() {
  state.shuffledDeck = [];
  state.selections = [];
  state.currentReading = null;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(date);
}

function toRoman(number) {
  if (number === 0) return '0';
  const map = [[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let remaining = number;
  return map.map(([value, symbol]) => {
    const count = Math.floor(remaining / value);
    remaining %= value;
    return symbol.repeat(count);
  }).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  toastTimer = window.setTimeout(() => elements.toast.classList.remove('visible'), 2600);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function handleInstallPrompt(event) {
  event.preventDefault();
  state.deferredInstallPrompt = event;
  elements.installButton.classList.remove('hidden');
}

async function installApp() {
  if (!state.deferredInstallPrompt) {
    showToast('Usa el menú del navegador para instalar la aplicación.');
    return;
  }
  state.deferredInstallPrompt.prompt();
  await state.deferredInstallPrompt.userChoice;
  state.deferredInstallPrompt = null;
  elements.installButton.classList.add('hidden');
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./service-worker.js', { scope: './', updateViaCache: 'none' });
    } catch (error) {
      console.warn('No se pudo registrar el modo sin conexión.', error);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
