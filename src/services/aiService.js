import axios from 'axios';

// Если у вас есть ключ OpenAI, добавьте его в .env
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// --- Fallback задания (если нет ключа или ошибка) ---
const fallbackQuestions = {
  'Математика:Интегралы': [
    {
      question: '∫ 2x dx = ?',
      options: ['A) x² + C', 'B) 2x² + C', 'C) x + C', 'D) 2 + C'],
      correct: 0,
      explanation: '∫ x^n dx = x^(n+1)/(n+1) + C, поэтому ∫ 2x dx = x² + C.',
    },
    {
      question: '∫ e^x dx = ?',
      options: ['A) e^x + C', 'B) e^(x+1) + C', 'C) ln(x) + C', 'D) x e^x + C'],
      correct: 0,
      explanation: 'Интеграл от e^x равен e^x + C.',
    },
  ],
  'Математика:Квадратные уравнения': [
    {
      question: 'Решите уравнение x² - 5x + 6 = 0',
      options: ['A) x=2, x=3', 'B) x=-2, x=-3', 'C) x=1, x=6', 'D) x=-1, x=-6'],
      correct: 0,
      explanation: 'Дискриминант D = 25 - 24 = 1, корни (5 ± 1)/2 = 2 и 3.',
    },
  ],
  'Физика:Кинематика': [
    {
      question: 'Тело движется со скоростью v = 2t. Какой путь оно пройдёт за 3 секунды?',
      options: ['A) 9 м', 'B) 6 м', 'C) 3 м', 'D) 18 м'],
      correct: 0,
      explanation: 'Путь s = ∫ v dt = ∫ 2t dt = t², при t=3 s=9 м.',
    },
  ],
  // можно добавить другие
};

// Генерация промпта для OpenAI
function buildPrompt(subject, topic) {
  return `Ты — AI репетитор по предмету "${subject}". Сгенерируй задание по теме "${topic}" в формате JSON:
{
  "question": "текст вопроса",
  "options": ["A) вариант1", "B) вариант2", "C) вариант3", "D) вариант4"],
  "correct": 0, // индекс правильного ответа (0..3)
  "explanation": "подробное объяснение решения"
}
Убедись, что задание соответствует уровню ЕНТ, варианты правдоподобны, а объяснение понятно.`;
}

// Основная функция генерации задания
export async function generateQuestion(subject, topic) {
  const key = `${subject}:${topic}`;
  // Если есть ключ, пробуем OpenAI
  if (OPENAI_API_KEY) {
    try {
      const response = await axios.post(
        OPENAI_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Ты генерируешь учебные задания в формате JSON.' },
            { role: 'user', content: buildPrompt(subject, topic) },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
      const content = response.data.choices[0].message.content;
      // Парсим JSON, который вернула модель
      const parsed = JSON.parse(content);
      if (parsed.question && parsed.options && parsed.correct !== undefined) {
        return parsed;
      } else {
        throw new Error('Неверный формат ответа от AI');
      }
    } catch (error) {
      console.warn('OpenAI API error, using fallback:', error);
      return getFallbackQuestion(key);
    }
  } else {
    // Нет ключа – используем fallback
    return getFallbackQuestion(key);
  }
}

function getFallbackQuestion(key) {
  const questions = fallbackQuestions[key];
  if (!questions || questions.length === 0) {
    // Если для данной темы нет fallback, создаём общее
    return {
      question: `Сгенерируйте задание по теме "${key.split(':')[1]}" (временно, добавьте свою базу)`,
      options: ['A) Пока нет данных', 'B) Используйте OpenAI', 'C) Добавьте ключ', 'D) Обратитесь к разработчику'],
      correct: 0,
      explanation: 'Для получения заданий настройте OpenAI API или добавьте свои примеры в fallbackQuestions.',
    };
  }
  // Берём случайное задание из массива
  const idx = Math.floor(Math.random() * questions.length);
  return questions[idx];
}

// Проверка ответа (сравниваем с правильным)
export function checkAnswer(question, userOptionIndex) {
  return userOptionIndex === question.correct;
}