// API de sincronização do Precificador Shopee — Vercel Postgres (Neon)
// Salva/carrega os dados do programa em uma tabela PostgreSQL criada na Vercel.
// A "chave de acesso" funciona como senha: só quem tem ela lê/grava aqueles dados.

let pool = null;

function getPool() {
  if (pool) return pool;
  const CONN =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!CONN) return null;
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: CONN,
    ssl: { rejectUnauthorized: false },
    max: 1
  });
  return pool;
}

module.exports = async (req, res) => {
  const p = getPool();
  if (!p) {
    return res.status(503).json({ erro: 'nuvem_off' });
  }

  const chaveValida = (c) => /^[A-Z0-9-]{6,32}$/.test(String(c || ''));

  // Garante a existência da tabela (criada automaticamente no 1º uso)
  try {
    await p.query(
      'CREATE TABLE IF NOT EXISTS precificador (' +
      'chave text PRIMARY KEY, ' +
      'dados jsonb NOT NULL, ' +
      'atualizado_em timestamptz NOT NULL DEFAULT now())'
    );
  } catch (e) {
    return res.status(500).json({ erro: 'falha_tabela' });
  }

  if (req.method === 'GET') {
    const chave = String(
      (req.query && req.query.chave) ||
      new URL(req.url, 'http://localhost').searchParams.get('chave') ||
      ''
    );
    if (!chaveValida(chave)) return res.status(400).json({ erro: 'chave_invalida' });
    try {
      const q = await p.query('SELECT dados FROM precificador WHERE chave = $1', [chave]);
      return res.status(200).json({ dados: q.rows.length ? q.rows[0].dados : null });
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
      await p.query(
        'INSERT INTO precificador (chave, dados) VALUES ($1, $2::jsonb) ' +
        'ON CONFLICT (chave) DO UPDATE SET dados = EXCLUDED.dados, atualizado_em = now()',
        [chave, texto]
      );
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ erro: 'falha_set' });
    }
  }

  return res.status(405).json({ erro: 'metodo' });
};
