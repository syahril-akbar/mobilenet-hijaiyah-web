import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { log } from '@/lib/logger';

export function useModel() {
  const [model, setModel] = useState<tf.GraphModel | tf.LayersModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadModel() {
      const startTime = performance.now();
      try {
        setIsLoading(true);
        log.model("Mulai mengunduh file model.json...");
        
        const loadedModel = await tf.loadLayersModel('/model/model.json');
        
        const endTime = performance.now();
        const loadTime = ((endTime - startTime) / 1000).toFixed(2);
        
        setModel(loadedModel);
        log.model(`Model MobileNetV2 berhasil dimuat dalam ${loadTime} detik`);
        log.system(`Backend TF.js: ${tf.getBackend()}`);
      } catch (err) {
        log.error("Gagal memuat model klasifikasi", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadModel();
  }, []);

  return { model, isLoading, error };
}