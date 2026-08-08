import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { generateQuestion, checkAnswer } from '../services/aiService';

const ChatInterface = () => {
  const { currentSubject, currentTopic, messages, addMessage, clearMessages, updateProgress } =
    useStore((state) => ({
      currentSubject: state.currentSubject,
      currentTopic: state.currentTopic,
      messages: state.messages,
      addMessage: state.addMessage,
      clearMessages: state.clearMessages,
      updateProgress: state.updateProgress,
    }));

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null); // храним текущее задание
  const [selectedOption, setSelectedOption] = useState(null); // индекс выбранного ответа
  const [answered, setAnswered] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const messagesEndRef = useRef(null);

  // При загрузке темы генерируем первое задание
  useEffect(() => {
    if (currentSubject && currentTopic && messages.length === 0) {
      generateNewQuestion();
    }
  }, [currentSubject, currentTopic]);

  // Скролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateNewQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setAnswered(false);
    setExplanation(null);
    try {
      const q = await generateQuestion(currentSubject.name, currentTopic);
      setCurrentQuestion(q);
      // Добавляем сообщение от репетитора с вопросом
      addMessage({
        role: 'assistant',
        content: q.question,
        type: 'question',
        options: q.options,
      });
    } catch (error) {
      console.error(error);
      addMessage({
        role: 'assistant',
        content: 'Не удалось сгенерировать задание. Попробуйте ещё раз.',
        type: 'error',
      });
    }
    setLoading(false);
  };

  const handleOptionSelect = (index) => {
    if (answered || loading) return;
    setSelectedOption(index);
    // Проверяем ответ
    const isCorrect = checkAnswer(currentQuestion, index);
    // Обновляем прогресс
    updateProgress(currentSubject.id, currentTopic, isCorrect ? 1 : 0, 1);

    // Добавляем сообщение пользователя (выбранный ответ)
    const userAnswer = currentQuestion.options[index];
    addMessage({
      role: 'user',
      content: userAnswer,
    });

    // Добавляем сообщение репетитора с результатом
    const correctAnswer = currentQuestion.options[currentQuestion.correct];
    const explanationText = isCorrect
      ? `✅ Правильно! ${currentQuestion.explanation}`
      : `❌ Неправильно. Правильный ответ: ${correctAnswer}. ${currentQuestion.explanation}`;
    addMessage({
      role: 'assistant',
      content: explanationText,
      type: 'explanation',
    });
    setAnswered(true);
    setExplanation(explanationText);
  };

  const handleSend = () => {
    const msg = input.trim();
    if (!msg) return;
    addMessage({ role: 'user', content: msg });
    setInput('');
    // Если пользователь пишет "ещё" или "еще", генерируем новое задание
    if (msg.toLowerCase().includes('ещё') || msg.toLowerCase().includes('еще')) {
      generateNewQuestion();
    } else {
      // Иначе просто отвечаем шаблоном
      addMessage({
        role: 'assistant',
        content: 'Напишите "ещё", чтобы получить новое задание по этой теме.',
        type: 'info',
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!currentSubject || !currentTopic) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col h-[80vh]">
      {/* Заголовок */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <button
            onClick={() => {
              clearMessages();
              useStore.getState().setTopic(null);
            }}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Назад к темам
          </button>
          <h2 className="text-xl font-bold mt-1">{currentSubject.name} — {currentTopic}</h2>
        </div>
        <div className="text-sm text-gray-500">
          {loading && 'Генерация...'}
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto my-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : msg.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : msg.type === 'info'
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.type === 'question' && msg.options ? (
                <div>
                  <div className="mb-2 font-medium">{msg.content}</div>
                  <div className="space-y-2">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionSelect(i)}
                        disabled={answered || loading}
                        className={`block w-full text-left px-3 py-2 rounded border ${
                          selectedOption === i && answered
                            ? i === currentQuestion?.correct
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : answered && i === currentQuestion?.correct
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        } ${(answered || loading) ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-4 py-2 text-gray-500">
              Думаю...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="border-t pt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Напишите «ещё» для нового задания или задайте вопрос..."
          className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
