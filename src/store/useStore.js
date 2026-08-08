import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // текущий выбор
      currentSubject: null,
      currentTopic: null,
      // история чата: массив сообщений { role: 'user'|'assistant', content: string, type?: 'question'|'explanation'|'option' }
      messages: [],
      // прогресс по темам: { 'math:Квадратные уравнения': { correct: 0, total: 0 } }
      progress: {},

      setSubject: (subject) => set({ currentSubject: subject, currentTopic: null, messages: [] }),
      setTopic: (topic) => set({ currentTopic: topic, messages: [] }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      clearMessages: () => set({ messages: [] }),

      updateProgress: (subjectId, topic, correct, total) => {
        const key = `${subjectId}:${topic}`;
        set((state) => ({
          progress: {
            ...state.progress,
            [key]: {
              correct: (state.progress[key]?.correct || 0) + correct,
              total: (state.progress[key]?.total || 0) + total,
            },
          },
        }));
      },

      getProgress: (subjectId, topic) => {
        const key = `${subjectId}:${topic}`;
        return get().progress[key] || { correct: 0, total: 0 };
      },
    }),
    {
      name: 'qazaq-tutor-storage', // имя для localStorage
    }
  )
);

export default useStore;