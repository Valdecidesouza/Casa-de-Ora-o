import { migrateLegacyData } from './_lib/database.js';
import { readJsonBody, sendJson, sendMethodNotAllowed, setCorsHeaders } from './_lib/http.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method !== 'POST') {
      sendMethodNotAllowed(res, ['POST', 'OPTIONS']);
      return;
    }

    const body = await readJsonBody(req);
    const data = await migrateLegacyData(body || {});
    sendJson(res, 200, data);
  } catch (error) {
    sendJson(res, 500, { error: error.message || 'Erro ao migrar dados antigos.' });
  }
}
