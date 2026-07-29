import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

async function listFiles(directory) {
  const base = resolve(root, directory);
  const output = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = resolve(current, entry.name);
      if (entry.isDirectory()) await walk(path);
      else output.push(relative(base, path).replaceAll('\\', '/'));
    }
  }
  await walk(base);
  return output.sort();
}

test('contenedor Android usa versión 1.0.3, WindowInsets CSS y ningún permiso de Internet', async () => {
  const [gradle, activity, manifest] = await Promise.all([
    read('app/build.gradle'),
    read('app/src/main/java/cl/oraculotarotlaura/app/MainActivity.java'),
    read('app/src/main/AndroidManifest.xml'),
  ]);
  assert.match(gradle, /applicationId 'cl\.oraculotarotlaura\.app'/);
  assert.match(gradle, /versionCode 4/);
  assert.match(gradle, /versionName '1\.0\.3'/);
  assert.match(activity, /setOnApplyWindowInsetsListener/);
  assert.match(activity, /WindowInsets\.Type\.systemBars\(\)/);
  assert.match(activity, /getDisplayMetrics\(\)\.density/);
  assert.match(activity, /physicalPixels \/ density/);
  assert.match(activity, /String\.format\(Locale\.US, "%.2fpx", cssPixels\)/);
  for (const side of ['top','right','bottom','left']) assert.match(activity, new RegExp(`--android-safe-${side}`));
  assert.match(activity, /onPageFinished/);
  assert.doesNotMatch(manifest, /android\.permission\.INTERNET/);
});

test('la aplicación web y android-web están sincronizadas', async () => {
  const files = ['index.html','styles.css','service-worker.js','manifest.webmanifest','offline.html'];
  const directories = ['js','assets','icons'];
  for (const directory of directories) {
    for (const file of await listFiles(directory)) files.push(`${directory}/${file}`);
  }
  for (const file of files) {
    const [web, android] = await Promise.all([read(file), read(`android-web/${file}`)]);
    assert.equal(android, web, `Diferencia accidental en ${file}`);
  }
});
