import React from 'react';
import useStore from '../store/useStore';
import ProgressItem from './ProgressItem';

const TopicSelector = () => {
  const currentSubject = useStore((state) => state.currentSubject);
  const setTopic = useStore((state) => state.setTopic);
  const progress = useStore((state) => state.progress);

  if (!currentSubject) return null;

  const { id, name, topics } = currentSubject;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => useStore.getState().setSubject(null)}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Назад к предметам
      </button>
      <h1 className="text-2xl font-bold mb-2">{name}</h1>
      <p className="text-gray-500 mb-6">Выберите тему для тренировки</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => {
          const prog = progress[`${id}:${topic}`] || { correct: 0, total: 0 };
          const percent = prog.total > 0 ? Math.round((prog.correct / prog.total) * 100) : 0;

          return (
            <div
              key={topic}
              onClick={() => setTopic(topic)}
              className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md cursor-pointer transition hover:border-green-400"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{topic}</span>
                <span className="text-sm text-gray-500">{percent}%</span>
              </div>
              <ProgressItem percent={percent} />
              <div className="text-xs text-gray-400 mt-1">
                {prog.total} заданий, {prog.correct} верно
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicSelector;
