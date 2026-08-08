import OpenAI from 'openai';

// === ВАРИАНТ 1: БЕЗОПАСНЫЙ (используем переменную окружения) ===
// Ключ будет браться из process.env.FREETHEAI_API_KEY
// Для локальной разработки создайте .env с FREETHEAI_API_KEY=ваш_ключ
// Для продакшена добавьте переменную в Vercel / Render и т.п.

// === ВАРИАНТ 2: УПРОЩЁННЫЙ (вставьте ключ прямо сюда, НО НЕ КОММИТЬТЕ!) ===
// const apiKey = 'sta_168e543e2288b6f38f2d47f8f9f162999b6f45c393c37430';

const client = new OpenAI({
  apiKey: process.env.FREETHEAI_API_KEY, // или apiKey: 'sta_...' (если без env)
  baseURL: 'https://api.freetheai.xyz/v1',
});

export default async function handler(req, res) {
  // CORS (для разработки)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, model = 'gpt-4o-mini' } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array' });
  }

  try {
    console.log('📤 Отправка запроса в FreeTheAi...');
    const completion = await client.chat.completions.create({
      model,
      messages,
      stream: false,
    });
    console.log('📥 Ответ получен');
    return res.status(200).json(completion);
  } catch (error) {
    console.error('❌ Ошибка FreeTheAi:', error);
    return res.status(500).json({ error: error.message });
  }
}
