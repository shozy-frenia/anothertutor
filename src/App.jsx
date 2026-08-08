import React from 'react';
import useStore from './store/useStore';
import SubjectSelector from './components/SubjectSelector';
import TopicSelector from './components/TopicSelector';
import ChatInterface from './components/ChatInterface';

function App() {
  const currentSubject = useStore((state) => state.currentSubject);
  const currentTopic = useStore((state) => state.currentTopic);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <h1 className="text-2xl font-bold text-blue-600">Qazaq Tutor</h1>
          <span className="ml-2 text-sm text-gray-500">AI-репетитор для ЕНТ</span>
        </div>
      </header>
      <main className="py-6">
        {!currentSubject && <SubjectSelector />}
        {currentSubject && !currentTopic && <TopicSelector />}
        {currentSubject && currentTopic && <ChatInterface />}
      </main>
    </div>
  );
}

export default App;
