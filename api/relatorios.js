import { createRelatorio, deleteRelatorio, listRelatorios } from './_lib/database.js';
import { getRequestUrl, readJsonBody, sendJson, sendMethodNotAllowed, setCorsHeaders } from './_lib/http.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const relatorios = await listRelatorios();
      sendJson(res, 200, { relatorios });
      return;
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      const relatorio = await createRelatorio(body);
      sendJson(res, 201, { relatorio });
      return;
    }

    if (req.method === 'DELETE') {
      const url = getRequestUrl(req);
      const id = url.searchParams.get('id');
      if (!id) {
        sendJson(res, 400, { error: 'Informe o id do relatório.' });
        return;
      }

      await deleteRelatorio(id);
      sendJson(res, 200, { ok: true });
      return;
    }

    sendMethodNotAllowed(res, ['GET', 'POST', 'DELETE', 'OPTIONS']);
  } catch (error) {
    const statusCode = /não permitido|informe|selecione|apenas/i.test(String(error.message)) ? 400 : 500;
    sendJson(res, statusCode, { error: error.message || 'Erro interno ao processar relatórios.' });
  }
}
