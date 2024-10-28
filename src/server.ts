import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { readFile } from 'node:fs/promises';
import { api } from './api';
import type { CheckModel } from './features/checks/CheckModel';

const isProd = process.env['NODE_ENV'] === 'production';
let html = await readFile(isProd ? 'build/index.html' : 'index.html', 'utf8');

if (!isProd) {
  html = injectClientScript(html);
}

const app = new Hono()
  .use('/assets/*', serveStatic({ root: isProd ? 'build/' : './' }))
  .route('/api', api)
  .get('/*', (c) => c.html(html));

export default app;

if (isProd) {
  serve({ ...app, port: 4000 }, (info) => {
    console.log(`Listening on http://localhost:${info.port}`);
  });
}

function getChecks(): CheckModel[] {
  return [
    {
      id: 'aaa',
      priority: 10,
      description: 'Face on the picture matches face on the document',
    },
    {
      id: 'bbb',
      priority: 5,
      description: 'Veriff supports presented document',
    },
    {
      id: 'ccc',
      priority: 7,
      description: 'Face is clearly visible',
    },
    {
      id: 'ddd',
      priority: 3,
      description: 'Document data is clearly visible',
    },
  ];
}

function injectClientScript(html: string) {
  // Inject Vite client code to the HTML
  return html.replace(
    '<head>',
    `
    <script type="module">
    import RefreshRuntime from "/@react-refresh"
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
    </script>
    <script type="module" src="/@vite/client"></script>
    `
  );
}
