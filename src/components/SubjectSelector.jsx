import React from 'react';
import { subjects } from '../data/subjects';
import useStore from '../store/useStore';

const SubjectSelector = () => {
  const setSubject = useStore((state) => state.setSubject);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-2">Выберите предмет для подготовки</h1>
      <p className="text-center text-gray-500 mb-6">Персональный AI-репетитор адаптируется под ваш уровень</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((subj) => (
          <div
            key={subj.id}
            onClick={() => setSubject(subj)}
            className="border rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition bg-white hover:border-blue-400"
          >
            <div className="text-3xl mb-2">{subj.icon}</div>
            <h2 className="text-xl font-semibold">{subj.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{subj.description}</p>
            <div className="mt-3 text-sm text-blue-600">Начать подготовку →</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelector;
