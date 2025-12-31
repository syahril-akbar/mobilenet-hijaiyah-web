import { useState, useEffect } from 'react';

export interface LearningSession {
  id: string;
  date: string;
  score: number; // 1 = Benar
  label: string; // Huruf yang dipelajari
}

const STORAGE_KEY = 'hijaiyah_learning_history';

export function useHistory() {
  const [history, setHistory] = useState<LearningSession[]>([]);

  // Load history on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch (e) {
          console.error("Gagal memuat riwayat", e);
        }
      }
    }
  }, []);

  const addEntry = (label: string) => {
    const newEntry: LearningSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      score: 1,
      label: label
    };

    setHistory(prev => {
      const updated = [newEntry, ...prev]; // Data terbaru di atas
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getStats = () => {
    const total = history.length;
    // Kelompokkan berdasarkan tanggal (YYYY-MM-DD)
    const byDate: Record<string, number> = {};
    
    history.forEach(item => {
        const dateKey = new Date(item.date).toLocaleDateString('id-ID');
        byDate[dateKey] = (byDate[dateKey] || 0) + 1;
    });

    return { total, byDate };
  };

  return { history, addEntry, clearHistory, getStats };
}
