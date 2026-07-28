import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TAROT_CARDS } from '../js/tarot-data.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const exists = (path) => access(resolve(root, path), fsConstants.F_OK).then(() => true, () => false);

test('index.html contiene los elementos requeridos por app.js', async () => {
  const [html, app] = await Promise.all([read('index.html'), read('js/app.js')]);
  const idsBlock = app.match(/const ids = \[([\s\S]*?)\];/);
  assert.ok(idsBlock, 'No se encontró la lista de identificadores de interfaz.');
  const ids = [...idsBlock[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  assert.ok(ids.length > 20);
  for (const id of ids) assert.match(html, new RegExp(`id=["']${id}["']`), `Falta #${id} en index.html`);
});

test('todos los recursos visuales declarados existen', async () => {
  for (const card of TAROT_CARDS) assert.equal(await exists(card.visual), true, card.visual);
  assert.equal(await exists('assets/cards/card-back.svg'), true);
});

test('manifest tiene configuración PWA e iconos existentes', async () => {
  const manifest = JSON.parse(await read('manifest.webmanifest'));
  assert.equal(manifest.name, 'Oráculo Tarot Laura — Lectura y Cartas');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512'));
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'));
  for (const icon of manifest.icons) assert.equal(await exists(icon.src.replace(/^\.\//, '')), true, icon.src);
});

test('service worker precarga el núcleo y las 22 cartas', async () => {
  const sw = await read('service-worker.js');
  assert.match(sw, /oraculo-tarot-laura-v1\.0\.2/);
  for (const path of ['./index.html','./styles.css','./js/app.js','./manifest.webmanifest','./offline.html','./assets/cards/card-back.svg']) {
    assert.ok(sw.includes(path), `Falta ${path} en la caché esencial`);
  }
  for (const card of TAROT_CARDS) assert.ok(sw.includes(`./${card.visual}`), `Falta ${card.visual} en caché`);
  assert.match(sw, /install/);
  assert.match(sw, /activate/);
  assert.match(sw, /fetch/);
});

test('la aplicación no carga scripts, estilos ni imágenes desde terceros', async () => {
  const files = ['index.html','styles.css','js/app.js','js/tarot-data.js','js/tarot-engine.js','js/storage.js','manifest.webmanifest','service-worker.js'];
  for (const file of files) {
    const content = await read(file);
    assert.doesNotMatch(content, /(?:src|href)=["']https?:\/\//i, `${file} carga un recurso externo`);
    assert.doesNotMatch(content, /@import\s+url\(["']?https?:\/\//i, `${file} importa un recurso externo`);
  }
});

test('todas las pantallas comparten un encabezado fijo y estable', async () => {
  const [html, css] = await Promise.all([read('index.html'), read('styles.css')]);
  assert.equal((html.match(/<header class="topbar">/g) || []).length, 1);
  assert.match(html, /class="icon-button header-slot-empty" id="back-button"/);
  assert.match(css, /grid-template-columns:\s*56px minmax\(0, 1fr\) 56px/);
  assert.match(css, /\.header-slot-empty\s*\{[^}]*visibility:\s*hidden/s);
  assert.match(css, /\.brand-button strong[^}]*white-space:\s*nowrap/s);
  assert.match(css, /text-overflow:\s*ellipsis/);
  assert.match(html, />Borrar historial</);
});

test('áreas seguras, desplazamiento y objetivos táctiles están definidos', async () => {
  const css = await read('styles.css');
  for (const side of ['top','right','bottom','left']) assert.match(css, new RegExp(`--safe-area-inset-${side}`));
  assert.match(css, /overflow-x:\s*hidden/);
  assert.match(css, /main\s*\{[^}]*padding-bottom:\s*calc\(32px \+ var\(--safe-area-inset-bottom\)\)/s);
  assert.match(css, /\.button\s*\{[^}]*min-width:\s*48px[^}]*min-height:\s*50px/s);
  assert.match(css, /\.icon-button\s*\{[^}]*width:\s*48px;\s*height:\s*48px/s);
  assert.match(css, /\.history-summary\s*\{[^}]*white-space:\s*nowrap/s);
});

test('modales y compartir/copiar tienen las rutas accesibles requeridas', async () => {
  const [html, app] = await Promise.all([read('index.html'), read('js/app.js')]);
  assert.equal((html.match(/aria-modal="true"/g) || []).length, 2);
  assert.match(app, /dialogReturnFocus/);
  assert.match(app, /showManagedDialog/);
  assert.match(app, /restoreDialogFocus/);
  assert.match(app, /navigator\.share/);
  assert.match(app, /navigator\.clipboard\?\.writeText/);
  assert.match(app, /document\.execCommand\('copy'\)/);
  assert.match(html, /id="share-reading-button"/);
  assert.match(html, /id="detail-share-button"/);
});
