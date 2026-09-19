import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {spawn, type ChildProcess} from 'node:child_process';
import path from 'path';
import {defineConfig, type Plugin, type ViteDevServer} from 'vite';

const API_PORT = Number(process.env.BUILDERS_API_PORT || 3010);

async function waitForApi(port: number, timeoutMs = 25_000): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (res.ok) return true;
    } catch {
      /* still booting */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

/** When `npx vite` is the frontend, boot Express APIs so chat / live build work. */
function buildersApiPlugin(): Plugin {
  let child: ChildProcess | null = null;

  const stop = () => {
    if (!child || child.killed) return;
    child.kill();
    child = null;
  };

  return {
    name: 'builders-api',
    async configureServer(server: ViteDevServer) {
      if (server.config.server.middlewareMode) return;
      if (process.env.BUILDERS_API_ONLY === '1') return;
      if (await waitForApi(API_PORT, 800)) return;

      const tsxBin = path.resolve(process.cwd(), 'node_modules/tsx/dist/cli.mjs');
      child = spawn(process.execPath, [tsxBin, 'server.ts'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PORT: String(API_PORT),
          BUILDERS_API_ONLY: '1',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      child.stdout?.on('data', (buf) => {
        const line = String(buf).trim();
        if (line) console.log(`[api] ${line}`);
      });
      child.stderr?.on('data', (buf) => {
        const line = String(buf).trim();
        if (line) console.warn(`[api] ${line}`);
      });
      child.on('exit', (code) => {
        if (code && code !== 0) {
          console.warn(`[api] exited with code ${code}`);
        }
        child = null;
      });

      const ready = await waitForApi(API_PORT);
      if (!ready) {
        console.warn(`[api] live build API did not start on :${API_PORT}`);
      }

      const close = () => stop();
      server.httpServer?.once('close', close);
    },
    closeBundle: stop,
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), buildersApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        buffer: 'buffer',
      },
    },
    define: {
      'process.env': {},
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['buffer'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${API_PORT}`,
          changeOrigin: true,
        },
      },
    },
  };
});
