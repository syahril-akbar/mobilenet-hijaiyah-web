import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

export function useModel() {
  const [model, setModel] = useState<tf.GraphModel | tf.LayersModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadModel() {
      try {
        setIsLoading(true);
        // Mencoba memuat model dari folder public
        // Catatan: GraphModel untuk model SavedModel/TFHub yang dikonversi, 
        // LayersModel untuk model H5 yang dikonversi (menggunakan model.json)
        const loadedModel = await tf.loadLayersModel('/model/model.json');
        setModel(loadedModel);
        console.log("Model berhasil dimuat");
      } catch (err) {
        console.error("Gagal memuat model", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadModel();
  }, []);

  return { model, isLoading, error };
}