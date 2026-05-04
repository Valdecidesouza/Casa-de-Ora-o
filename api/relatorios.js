import {
  createRelatorio,
  deleteRelatorio,
  listRelatorios,
  updateRelatorio,
  deleteAllRelatorios // 🔥 NOVO
} from './_lib/database.js';

import {
  getRequestUrl,
  readJsonBody,
  sendJson,
  sendMethodNotAllowed,
  setCorsHeaders
} from './_lib/http.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {

    // 🔍 LISTAR
    if (req.method === 'GET') {
      const relatorios = await listRelatorios();
      sendJson(res, 200, { relatorios });
      return;
    }

    // ✏️ CRIAR OU EDITAR
    if (req.method === 'POST') {
      const body = await readJsonBody(req);

      let relatorio;

      if (body.id) {
        // 🔥 EDITAR
        relatorio = await updateRelatorio(body.id, body);
      } else {
        // 🔥 CRIAR
        relatorio = await createRelatorio(body);
      }

      sendJson(res, 200, { relatorio });
      return;
    }

    // 🗑 APAGAR (1 OU TODOS)
    if (req.method === 'DELETE') {
      const url = getRequestUrl(req);
      const id = url.searchParams.get('id');

      // 🔥 SEM ID = APAGA TUDO
      if (!id) {
        await deleteAllRelatorios();
        sendJson(res, 200, { ok: true, all: true });
        return;
      }

      // 🔥 COM ID = APAGA UM
      await deleteRelatorio(id);
      sendJson(res, 200, { ok: true });
      return;
    }

    sendMethodNotAllowed(res, ['GET', 'POST', 'DELETE', 'OPTIONS']);

  } catch (error) {
    const statusCode = /não permitido|informe|selecione|apenas/i.test(String(error.message))
      ? 400
      : 500;

    sendJson(res, statusCode, {
      error: error.message || 'Erro interno ao processar relatórios.'
    });
  }
}