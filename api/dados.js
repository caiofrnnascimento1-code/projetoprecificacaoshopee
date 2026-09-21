// API de sincronização do Precificador Shopee
// Salva/carrega os dados no Upstash Redis (banco gratuito criado na Vercel).
// As variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN são criadas
// automaticamente quando o banco é conectado ao projeto no painel da Vercel.
// A "chave de acesso" funciona como senha: só quem tem ela lê/grava aquele dados.

module.exports = async (req, res) => {
  const URL = process.env.UPSTASH_REDIS_REST_URL;
  const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!URL || !TOKEN) {
    return res.status(503).json({ erro: 'nuvem_off' });
  }

  const cab = { Authorization: `Bearer ${TOKEN}` };
  const chaveValida = (c) => /^[A-Z0-9-]{6,32}$/.test(String(c || ''));

  if (req.method === 'GET') {
    const chave = String(
      (req.query && req.query.chave) ||
      new URL(req.url, 'http://localhost').searchParams.get('chave') ||
      ''
    );
    if (!chaveValida(chave)) return res.status(400).json({ erro: 'chave_invalida' });
    try {
      const r = await fetch(`${URL}/get/${encodeURIComponent('precificador:' + chave)}`, { headers: cab });
      const j = await r.json();
      let dados = null;
      if (j && j.result) { try { dados = JSON.parse(j.result); } catch (e) { dados = null; } }
      return res.status(200).json({ dados });
    } catch (e) {
      return res.status(500).json({ erro: 'falha_get' });
    }
  }

  if (req.method === 'POST') {
    let corpo = req.body;
    if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { corpo = null; } }
    const chave = String((corpo && corpo.chave) || '');
    const dados = corpo ? corpo.dados : null;
    if (!chaveValida(chave)) return res.status(400).json({ erro: 'chave_invalida' });
    const texto = JSON.stringify(dados ?? {});
    if (texto.length > 1000000) return res.status(413).json({ erro: 'muito_grande' });
    try {
      const r = await fetch(`${URL}/set/${encodeURIComponent('precificador:' + chave)}`, {
        method: 'POST',
        headers: { ...cab, 'Content-Type': 'text/plain' },
        body: texto
      });
      if (!r.ok) return res.status(500).json({ erro: 'falha_set' });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ erro: 'falha_set' });
    }
  }

  return res.status(405).json({ erro: 'metodo' });
};
