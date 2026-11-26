// Bundles the coordination scene (scene/coordination.tsx, built with the
// Stageshow kit in third_party/stageshow) into static files under assets/,
// React included. Needs `npm ci` first; the output is committed, so a page
// needs nothing at run time beyond these files:
//   assets/scene-coordination.js    the scene, the kit's components and React
//   assets/scene-coordination.css   the scene's own styles
//   assets/kit/stageshow.css        the kit's own styles, only the parts the scene imports
// The kit's styles are kept in their own file under a kit/ path so that
// Stageshow's film checks can tell the kit's rules from the scene's.
//   node tools/build-scene.mjs
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';
import { statSync, readFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KIT = join(ROOT, 'third_party/stageshow/kit');
const kitCss = [];
const splitKitCss = {
  name: 'split-kit-css',
  setup(b) {
    b.onResolve({ filter: /\.css$/ }, (args) => {
      const path = join(args.resolveDir, args.path);
      if (!path.startsWith(KIT)) return undefined;
      if (!kitCss.includes(path)) kitCss.push(path);
      return { path, namespace: 'kit-css' };
    });
    b.onLoad({ filter: /.*/, namespace: 'kit-css' }, () => ({ contents: '', loader: 'css' }));
  },
};
const common = { bundle: true, minify: true, legalComments: 'eof', logLevel: 'warning' };
await build({
  ...common,
  entryPoints: { 'scene-coordination': join(ROOT, 'scene/coordination.tsx') },
  outdir: join(ROOT, 'assets'),
  format: 'iife',
  target: ['es2020', 'safari15'],
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [splitKitCss],
});
mkdirSync(join(ROOT, 'assets/kit'), { recursive: true });
await build({
  ...common,
  stdin: { contents: [...kitCss].sort().map((p) => `@import "./${relative(KIT, p)}";`).join('\n'), resolveDir: KIT, loader: 'css' },
  outfile: join(ROOT, 'assets/kit/stageshow.css'),
});
for (const f of ['scene-coordination.js', 'scene-coordination.css', 'kit/stageshow.css']) {
  const p = join(ROOT, 'assets', f);
  console.log(`assets/${f}: ${statSync(p).size} bytes, ${gzipSync(readFileSync(p)).length} gzipped`);
}
