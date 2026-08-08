// src/services/aiService.js
import axios from 'axios';

// Для локальной разработки с Vercel: /api/chat (прокси будет доступен по тому же хосту)
// Если запускаете отдельный сервер, укажите полный URL, например http://localhost:3000/api/chat
const PROXY_URL = import.meta.env.VITE_PROXY_URL || '/api/chat';

// Fallback-задания (оставляем для надёжности)
const fallbackQuestions = {
  'Математика:Интегралы': [
    {
      question: '∫ 2x dx = ?',
      options: ['A) x² + C', 'B) 2x² + C', 'C) x + C', 'D) 2 + C'],
      correct: 0,
      explanation: '∫ x^n dx = x^(n+1)/(n+1) + C, поэтому ∫ 2x dx = x² + C.',
    },
    // ... добавьте свои fallback-задания по другим темам
  ],
  // ... другие темы (можно взять из предыдущего кода)
};

function getFallbackQuestion(key) {
  const questions = fallbackQuestions[key];
  if (!questions || questions.length === 0) {
    return {
      question: `Временно нет задания по теме "${key.split(':')[1]}"`,
      options: ['A) Используйте AI', 'B) Настройте прокси', 'C) Добавьте fallback', 'D) Обратитесь к разработчику'],
      correct: 0,
      explanation: 'Для получения заданий настройте FreeTheAi прокси или добавьте свои примеры в fallbackQuestions.',
    };
  }
  const idx = Math.floor(Math.random() * questions.length);
  return questions[idx];
}

function buildPrompt(subject, topic) {
  return `Ты — AI репетитор по предмету "${subject}". Сгенерируй задание по теме "${topic}" в формате JSON:
{
  "question": "текст вопроса",
  "options": ["A) вариант1", "B) вариант2", "C) вариант3", "D) вариант4"],
  "correct": 0,
  "explanation": "подробное объяснение решения"
}
Убедись, что задание соответствует уровню ЕНТ.`;
}

export async function generateQuestion(subject, topic) {
  const key = `${subject}:${topic}`;

  try {
    const messages = [
      { role: 'system', content: 'Ты генерируешь учебные задания в формате JSON.' },
      { role: 'user', content: buildPrompt(subject, topic) },
    ];

    const response = await axios.post(PROXY_URL, {
      messages,
      model: 'gpt-4o-mini', // можно изменить на другую модель
    });

    // Прокси должен вернуть ответ в формате OpenAI
    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);
    if (parsed.question && parsed.options && parsed.correct !== undefined) {
      return parsed;
    } else {
      throw new Error('Неверный формат ответа от AI');
    }
  } catch (error) {
    console.warn('Ошибка прокси или AI, используем fallback:', error);
    return getFallbackQuestion(key);
  }
}

export function checkAnswer(question, userOptionIndex) {
  return userOptionIndex === question.correct;
}