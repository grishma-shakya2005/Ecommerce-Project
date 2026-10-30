import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { request as httpRequest, type IncomingMessage, type ServerResponse } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import selfsigned from 'selfsigned';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const PORT = 5001;
const CLIENT_DEV_PORT = 5173;
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const clientRoot = join(projectRoot, 'client');
const clientDist = join(clientRoot, 'dist');

const certificate = await selfsigned.generate(
  [{ name: 'commonName', value: 'localhost' }],
  {
    keySize: 2048,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
        ],
      },
    ],
  },
);

const proxy = (targetPort: number, req: IncomingMessage, res: ServerResponse) => {
  const request = httpRequest({
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${targetPort}` },
  }, (targetResponse) => {
    res.writeHead(targetResponse.statusCode ?? 502, targetResponse.headers);
    targetResponse.pipe(res);
  });

  request.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
    }
    res.end('The demo target is unavailable.');
  });
  req.pipe(request);
};

const app = express();
let clientProcess: ChildProcess | undefined;

if (existsSync(clientDist)) {
  app.use('/api', (req, res) => proxy(5000, req, res));
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(join(clientDist, 'index.html')));
} else {
  clientProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
    'run',
    'dev',
    '--',
    '--host',
    '127.0.0.1',
  ], {
    cwd: clientRoot,
    stdio: 'inherit',
  });
  app.use((req, res) => proxy(CLIENT_DEV_PORT, req, res));
}

const server = createHttpsServer(
  { key: certificate.private, cert: certificate.cert },
  app,
);

const shutdown = () => {
  clientProcess?.kill();
  server.close();
};

server.listen(PORT, '127.0.0.1', () => {
  console.log(`HTTPS checkout demo running at https://localhost:${PORT}/checkout`);
  console.log('A self-signed certificate warning is expected for this local demo.');
});

// Production deployments should use a certificate from a trusted CA such as
// Let's Encrypt instead of a self-signed certificate to avoid browser warnings.
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
