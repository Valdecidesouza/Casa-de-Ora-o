import { listLideres } from './_lib/database.js';
import { sendJson, sendMethodNotAllowed, setCorsHeaders } from './_lib/http.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method !== 'GET') {
      sendMethodNotAllowed(res, ['GET', 'OPTIONS']);
      return;
    }

    const lideres = await listLideres();
    sendJson(res, 200, { lideres });
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Erro interno ao carregar líderes.' });
  }
}
