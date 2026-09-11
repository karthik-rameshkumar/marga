import { copyFile, lstat, mkdir, mkdtemp, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const files = [
  'index.html',
  'src/game.js',
  'src/main.js',
  'src/style.css',
  'assets/entire-logo.svg',
  'assets/favicon.svg',
];

// Publish only this explicit manifest. Repository metadata, transcripts, test
// files, and the local development server are not deployment artifacts.
for (const file of files) {
  const info = await lstat(path.join(root, file));
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Expected a regular file: ${file}`);
}
const stage = await mkdtemp(path.join(root, '.marga-build-'));
try {
  for (const file of files) {
    const destination = path.join(stage, file);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(path.join(root, file), destination);
  }
  // dist is generated output owned by this build; replace it so stale files
  // cannot remain publicly accessible after a later deployment.
  await rm(output, { recursive: true, force: true });
  await rename(stage, output);
} finally {
  await rm(stage, { recursive: true, force: true });
}
console.log(`Built ${files.length} static files in dist/`);
