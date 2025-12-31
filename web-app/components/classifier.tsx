import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useModel } from '@/hooks/use-model';
import { useWebcam } from '@/hooks/use-webcam';
import { HIJAIYAH_CLASSES, HIJAIYAH_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { log } from '@/lib/logger';
import { Camera, AlertCircle, Activity, Play, Square, Hand, CheckCircle2, Scan, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ClassifierProps {
  onPrediction?: (label: string, confidence: number) => void;
}

export default function Classifier({ onPrediction }: ClassifierProps) {
  const { model: classificationModel, isLoading: isModelLoading, error: modelError } = useModel();
  const { videoRef, startWebcam, isVideoReady, onVideoLoaded, error: camError } = useWebcam();
  
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [prediction, setPrediction] = useState<{ label: string, confidence: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Menunggu gestur...");
  const [handBox, setHandBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [isInferencing, setIsInferencing] = useState(false);
  const [isDetectorLoading, setIsDetectorLoading] = useState(true);
  const requestRef = useRef<number>(null);

  // Inisialisasi MediaPipe Hand Landmarker (Sistem Deteksi Tangan)
  useEffect(() => {
    async function initDetector() {
      try {
        setIsDetectorLoading(true);
        log.system("Membangun FilesetResolver MediaPipe...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        log.system("Memuat model hand_landmarker.task...");
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        setHandLandmarker(landmarker);
        log.system("Sistem Pelacakan Tangan Siap");
      } catch (err) {
        log.error("Gagal menginisialisasi deteksi tangan", err);
      } finally {
        setIsDetectorLoading(false);
      }
    }
    initDetector();
  }, []);

  // Fungsi utama untuk memproses frame video dan melakukan klasifikasi
  const predict = useCallback(async () => {
    if (!classificationModel || !handLandmarker || !videoRef.current || !isVideoReady) return;

    // Pastikan video sedang berjalan dan memiliki dimensi yang valid
    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
       if (isInferencing) {
          requestRef.current = requestAnimationFrame(predict);
       }
       return;
    }

    try {
      const startTimeMs = performance.now();
      
      // 1. Deteksi posisi tangan menggunakan landmark
      const results = handLandmarker.detectForVideo(video, startTimeMs);
      
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // Hitung Bounding Box (kotak pembatas) dari titik-titik landmark tangan
        let xMin = 1, yMin = 1, xMax = 0, yMax = 0;
        landmarks.forEach(lm => {
          xMin = Math.min(xMin, lm.x);
          yMin = Math.min(yMin, lm.y);
          xMax = Math.max(xMax, lm.x);
          yMax = Math.max(yMax, lm.y);
        });

        // Konversi koordinat normalisasi (0-1) ke koordinat piksel
        const width = (xMax - xMin) * video.videoWidth;
        const height = (yMax - yMin) * video.videoHeight;
        const xMinPx = xMin * video.videoWidth;
        const yMinPx = yMin * video.videoHeight;
        
        setHandBox({ x: xMinPx, y: yMinPx, width, height });

        // 2. Preprocessing Gambar & Klasifikasi Huruf Hijaiyah
        tf.tidy(() => {
          const pixels = tf.browser.fromPixels(video);
          
          // Tambahkan margin/padding agar area tangan terpotong lebih luas (20%)
          const padX = width * 0.2;
          const padY = height * 0.2;
          
          const startY = Math.max(0, yMinPx - padY);
          const startX = Math.max(0, xMinPx - padX);
          const endY = Math.min(video.videoHeight, (yMinPx + height) + padY);
          const endX = Math.min(video.videoWidth, (xMinPx + width) + padX);
          
          // Potong area tangan dan resize ke ukuran input model (224x224)
          const boxes: [number, number, number, number][] = [[
            startY / video.videoHeight, 
            startX / video.videoWidth, 
            endY / video.videoHeight, 
            endX / video.videoWidth
          ]];
          
          let img: tf.Tensor = tf.image.cropAndResize(
              pixels.expandDims(0) as tf.Tensor4D, 
              tf.tensor2d(boxes), 
              [0], 
              [224, 224]
          );
          
          // Normalisasi piksel ke rentang [0, 1]
          img = img.div(255.0);
          
          // Jalankan inferensi menggunakan model MobileNetV2 yang sudah dilatih
          const predictions = classificationModel.predict(img) as tf.Tensor;
          const data = predictions.dataSync();
          
          // Cari skor probabilitas tertinggi
          let maxScore = -1;
          let maxIdx = -1;
          
          for (let i = 0; i < data.length; i++) {
            if (data[i] > maxScore) {
              maxScore = data[i];
              maxIdx = i;
            }
          }
          
          const threshold = 0.7; // Batas kepercayaan minimum 70% sesuai skripsi
          
          if (maxScore >= threshold) {
            const classKey = HIJAIYAH_CLASSES[maxIdx];
            const label = HIJAIYAH_LABELS[classKey] || classKey;
            setPrediction({
              label: label,
              confidence: maxScore
            });
            setStatusMessage("Tangan Terdeteksi");
            log.detection(label, maxScore);

            // Kirim hasil ke komponen induk jika ada callback
            if (onPrediction) {
              onPrediction(label, maxScore);
            }
          } else {
            setPrediction(null);
            setStatusMessage("Confidence Rendah");
          }
        });
      } else {
        // Jika tidak ada tangan yang terdeteksi
        setHandBox(null);
        setPrediction(null);
        setStatusMessage("Objek Tidak Terdeteksi");
      }
      
      // Ulangi proses pada frame berikutnya (Loop Real-time) hanya jika tidak ada error
      if (isInferencing) {
        requestRef.current = requestAnimationFrame(predict);
      }

    } catch (err) {
      log.error("Kesalahan pada loop prediksi", err);
      setIsInferencing(false); // Hentikan loop jika terjadi error fatal
      setStatusMessage("Error Sistem: Deteksi Dihentikan");
    }
  }, [classificationModel, handLandmarker, isVideoReady, isInferencing, videoRef]);

  // Manajemen siklus hidup loop deteksi
  useEffect(() => {
    if (isInferencing && classificationModel && handLandmarker && isVideoReady) {
      log.system("Loop inferensi dimulai");
      requestRef.current = requestAnimationFrame(predict);
    } else {
      if (requestRef.current) {
        log.system("Loop inferensi dihentikan");
        cancelAnimationFrame(requestRef.current);
      }
      setPrediction(null);
      setHandBox(null);
      setStatusMessage("Menunggu gestur...");
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isInferencing, classificationModel, handLandmarker, isVideoReady, predict]);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-4 space-y-8">
        {/* Bagian Kartu Status */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-emerald-100 bg-emerald-50/30">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center justify-between">
                        Status Sistem
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <div className={cn("w-2.5 h-2.5 rounded-full", (isModelLoading || isDetectorLoading) ? "bg-amber-400 animate-pulse" : "bg-emerald-500")} />
                        <span className="font-bold text-emerald-950">
                            {isDetectorLoading ? "Memuat Pelacak..." : isModelLoading ? "Memuat Model..." : "Sistem Siap"}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2 border-emerald-100 shadow-sm overflow-hidden relative transition-all duration-300">
                {prediction && (
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <CheckCircle2 className="w-24 h-24 text-emerald-600" />
                    </div>
                )}
                <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                        Hasil Klasifikasi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {prediction ? (
                        <div className="flex flex-col animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center space-x-4">
                                <span className="text-5xl font-black text-emerald-950 tracking-tighter">{prediction.label}</span>
                                <Badge className="bg-emerald-600 text-white border-none px-3 py-1 text-sm font-bold shadow-md">
                                    {(prediction.confidence * 100).toFixed(1)}%
                                </Badge>
                            </div>
                            <p className="text-xs text-emerald-600 mt-2 font-semibold flex items-center">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Prediksi Akurasi Tinggi
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-center h-15">
                            <span className={cn("text-lg font-bold tracking-tight", isInferencing ? (statusMessage.includes("Tidak") ? "text-rose-500" : "text-amber-600") : "text-slate-400")}>
                                {isInferencing ? statusMessage : "Kamera belum aktif"}
                            </span>
                            {isInferencing && !handBox && (
                                <p className="text-xs text-slate-500 mt-1 font-medium flex items-center">
                                    <Scan className="w-3 h-3 mr-1 animate-pulse" /> Mencari posisi tangan...
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Jendela Pratinjau Video */}
        <div className="relative w-full aspect-video bg-slate-950 rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(16,185,129,0.2)] border-8 border-white group transition-all duration-500 hover:scale-[1.01]">
            <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                onLoadedMetadata={onVideoLoaded}
                className="w-full h-full object-cover transform scale-x-[-1]" // Efek cermin
            />
            
            {/* Overlay saat kamera mati */}
            {!isVideoReady && !camError && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/90 backdrop-blur-xl">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                        {isDetectorLoading ? <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" /> : <Camera className="w-10 h-10 text-emerald-400 animate-pulse" />}
                    </div>
                    <span className="text-xl font-black tracking-tight uppercase">
                        {isDetectorLoading ? "Memuat Sistem AI..." : "Kamera Tidak Aktif"}
                    </span>
                    <p className="text-slate-400 text-sm mt-2">Aktifkan kamera untuk mulai deteksi</p>
                 </div>
            )}

            {/* Overlay saat ada error kamera */}
            {camError && (
                 <div className="absolute inset-0 flex items-center justify-center bg-rose-950/95 text-white p-8 text-center backdrop-blur-md">
                    <div className="max-w-md">
                        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-rose-400" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter mb-3 uppercase">Akses Ditolak</h3>
                        <p className="text-rose-200/70 font-medium leading-relaxed">{camError.message}</p>
                    </div>
                 </div>
            )}

            {/* Kotak ROI Dinamis yang mengikuti tangan */}
            {isInferencing && handBox && (
                <div 
                    className="absolute border-4 border-emerald-400 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.5)] transition-all duration-75 pointer-events-none"
                    style={{
                        // Transform koordinat agar sesuai dengan efek cermin (scale-x-[-1])
                        left: `${(1 - (handBox.x + handBox.width) / videoRef.current!.videoWidth) * 100}%`,
                        top: `${(handBox.y / videoRef.current!.videoHeight) * 100}%`,
                        width: `${(handBox.width / videoRef.current!.videoWidth) * 100}%`,
                        height: `${(handBox.height / videoRef.current!.videoHeight) * 100}%`
                    }}
                >
                    <div className="absolute -top-8 left-0 bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase whitespace-nowrap">
                        Tangan Terdeteksi
                    </div>
                </div>
            )}

            {/* Overlay animasi pemindaian saat tidak ada tangan */}
            {isInferencing && !handBox && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Hand className="w-24 h-24 text-emerald-400/10 animate-pulse absolute" />
                </div>
            )}
        </div>

        {/* Tombol Kontrol */}
        <div className="flex items-center justify-center gap-6 w-full">
            {!isVideoReady ? (
                <Button 
                    size="lg" 
                    onClick={startWebcam} 
                    disabled={isDetectorLoading}
                    className="h-16 px-10 text-lg font-black rounded-full shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)] hover:shadow-none hover:translate-y-1 transition-all uppercase tracking-tighter"
                >
                    {isDetectorLoading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Camera className="mr-3 h-6 w-6" />}
                    Aktifkan Kamera
                </Button>
            ) : (
                 <Button 
                    size="lg" 
                    variant={isInferencing ? "destructive" : "default"}
                    onClick={() => setIsInferencing(!isInferencing)}
                    disabled={!classificationModel || !handLandmarker}
                    className={cn(
                        "h-16 px-10 text-lg font-black rounded-full transition-all uppercase tracking-tighter",
                        isInferencing 
                            ? "bg-rose-600 hover:bg-rose-700 shadow-[0_20px_40px_-12px_rgba(225,29,72,0.4)]" 
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)]"
                    )}
                >
                    {isInferencing ? (
                        <>
                            <Square className="mr-3 h-6 w-6 fill-current" />
                            Hentikan Sesi
                        </>
                    ) : (
                        <>
                            <Play className="mr-3 h-6 w-6 fill-current" />
                            Mulai Deteksi
                        </>
                    )}
                </Button>
            )}
        </div>
        
        {/* Penanganan Error Memuat Model */}
        {modelError && (
            <Alert variant="destructive" className="max-w-2xl border-rose-200 bg-rose-50 rounded-2xl">
                <AlertCircle className="h-5 w-5 text-rose-600" />
                <AlertTitle className="font-black uppercase tracking-tight text-rose-950">Error Sistem</AlertTitle>
                <AlertDescription className="text-rose-800 font-medium">
                    Gagal memuat model klasifikasi AI: {modelError.message}
                </AlertDescription>
            </Alert>
        )}
    </div>
  );
}