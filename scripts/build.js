import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

mkdirSync(publicDir, { recursive: true });

await esbuild.build({
  entryPoints: [join(root, 'src/client/audience/main.js')],
  outfile: join(publicDir, 'audience.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020']
});

await esbuild.build({
  entryPoints: [join(root, 'src/client/operator/main.js')],
  outfile: join(publicDir, 'operator.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2020']
});

cpSync(join(root, 'src/client/audience/index.html'), join(publicDir, 'index.html'));
cpSync(join(root, 'src/client/operator/operator.html'), join(publicDir, 'operator.html'));
cpSync(join(root, 'src/client/styles/audience.css'), join(publicDir, 'audience.css'));
cpSync(join(root, 'src/client/styles/operator.css'), join(publicDir, 'operator.css'));

if (existsSync(join(root, 'src/client/assets'))) {
  cpSync(join(root, 'src/client/assets'), join(publicDir, 'assets'), { recursive: true });
}

if (existsSync(join(root, 'src/client/manifest.json'))) {
  cpSync(join(root, 'src/client/manifest.json'), join(publicDir, 'manifest.json'));
}

console.log('Build complete → public/');
