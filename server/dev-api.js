import http from 'node:http';
import relatoriosHandler from '../api/relatorios.js';
import lideresHandler from '../api/lideres.js';
import migrateHandler from '../api/migrate.js';
import { sendJson } from '../api/_lib/http.js';

const PORT = Number(process.env.API_PORT || 3001);

const routes = {
  '/api/relatorios': relatoriosHandler,
  '/api/lideres': lideresHandler,
  '/api/migrate': migrateHandler,
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const handler = routes[url.pathname];

  if (!handler) {
    sendJson(res, 404, { error: 'Rota não encontrada.' });
    return;
  }

  try {
    await handler(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Erro interno na API local.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API local rodando em http://0.0.0.0:${PORT}`);
});
