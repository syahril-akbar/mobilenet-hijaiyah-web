'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Classifier from '@/components/classifier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HIJAIYAH_CLASSES, HIJAIYAH_LABELS } from '@/lib/constants';
import { ArrowLeft, RefreshCw, CheckCircle2, Star, Trophy, History } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useHistory } from '@/hooks/use-history';
import confetti from 'canvas-confetti';
import Image from 'next/image';

export default function LatihanPage() {
  const [targetChar, setTargetChar] = useState<string>('');
  const [targetKey, setTargetKey] = useState<string>(''); // Key untuk pencocokan yang akurat
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  // Image state
  const [imgSrc, setImgSrc] = useState<string>('');
  const [imgError, setImgError] = useState(false);
  
  const { addEntry } = useHistory();
  const mounted = useRef(false);

  // Pilih huruf acak untuk tantangan
  const generateChallenge = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * HIJAIYAH_CLASSES.length);
    const charKey = HIJAIYAH_CLASSES[randomIndex];
    setTargetChar(HIJAIYAH_LABELS[charKey]);
    setTargetKey(charKey);
    setIsCorrect(false);
    
    // Reset image state for new challenge
    const newImgSrc = `/gestures/${charKey.split('_')[1]?.toLowerCase()}.jpg`;
    setImgSrc(newImgSrc);
    setImgError(false);
  }, []);

  // Inisialisasi tantangan pertama
  useEffect(() => {
    if (!mounted.current) {
        generateChallenge();
        mounted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fungsi untuk suara narasi huruf
  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fungsi untuk suara efek "Ding"
  const playSuccessSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => console.log("Audio play blocked by browser"));
  };

  // Handle image load error
  const handleImageError = () => {
    if (imgSrc.endsWith('.jpg')) {
      setImgSrc(imgSrc.replace('.jpg', '.png'));
    } else {
      setImgError(true);
    }
  };

  // Handle hasil deteksi dari kamera
  const handlePrediction = (label: string, confidence: number, predictedKey: string) => {
    if (isCorrect) return; // Jangan proses jika sudah benar

    // Logika pencocokan menggunakan key yang unik (jauh lebih akurat daripada string label)
    if (predictedKey === targetKey && confidence > 0.1) {
      setIsCorrect(true);
      setScore(prev => prev + 1);
      addEntry(targetChar); 
      
      playSuccessSound();
      speak(`Benar, ini adalah huruf ${targetChar.split(' (')[0]}`);
      
      // Efek Kembang Api (Confetti)
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24']
      });
      
      setTimeout(() => {
        generateChallenge();
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-emerald-100/20">
      {/* Header */}
      <nav className="w-full border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-emerald-100/50 rounded-full">
                <ArrowLeft className="w-5 h-5 text-emerald-800" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs">
                H
              </div>
              <span className="font-bold text-xl tracking-tight text-emerald-900 hidden md:block">HijaiyahAI</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <Link href="/profil">
                <Button variant="ghost" size="sm" className="text-emerald-700 hover:bg-emerald-50 mr-2">
                   <History className="w-4 h-4 mr-2" /> Riwayat
                </Button>
             </Link>
             <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                <Trophy className="w-4 h-4 text-emerald-500 mr-2" />
                <span className="font-bold text-emerald-950 text-sm">Skor: {score}</span>
             </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Tantangan */}
        <div className="space-y-6">
          <Card className="border-emerald-100 shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="bg-emerald-600 text-white p-6">
              <CardTitle className="text-sm font-black uppercase tracking-widest opacity-80">Tantangan Saat Ini</CardTitle>
            </CardHeader>
            <CardContent className="p-10 flex flex-col items-center justify-center space-y-6">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-tighter">Peragakan Huruf:</p>
              <div className={cn(
                "text-7xl font-black transition-all duration-500 transform",
                isCorrect ? "text-emerald-500 scale-110" : "text-slate-900"
              )}>
                {targetChar}
              </div>
              
              {isCorrect && (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                  <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl flex items-center font-bold shadow-sm border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Luar Biasa!
                  </div>
                  <p className="text-xs text-slate-400 mt-3 font-medium italic">Menyiapkan huruf selanjutnya...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-emerald-50 bg-emerald-50/30 p-6">
             <h3 className="font-bold text-emerald-900 mb-2 flex items-center">
                <Star className="w-4 h-4 mr-2 fill-emerald-500 text-emerald-500" />
                Petunjuk
             </h3>
             <p className="text-sm text-emerald-800/70 leading-relaxed">
                Posisikan tangan Anda di depan kamera. Pastikan pencahayaan cukup dan tangan terlihat jelas dalam kotak deteksi. 
                Sistem akan memverifikasi otomatis jika posisi tangan Anda sudah benar.
             </p>
             <Button 
                variant="outline" 
                className="w-full mt-6 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                onClick={generateChallenge}
                disabled={isCorrect}
             >
                <RefreshCw className="w-4 h-4 mr-2" /> Lewati Huruf
             </Button>
          </Card>
        </div>

        {/* Kolom Kanan: Kamera (Classifier) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-emerald-400 to-teal-400 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <Card className="relative bg-white/80 backdrop-blur-xl rounded-[1.8rem] shadow-2xl overflow-hidden border-emerald-100/50 p-2 md:p-4">
               {/* Instruksi Visual Overlay */}
               <div className="absolute top-6 right-6 z-20 w-24 h-24 md:w-32 md:h-32 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-emerald-500 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
                  <div className="bg-emerald-500 text-[10px] text-white font-black uppercase text-center py-1 tracking-widest">
                    Contoh
                  </div>
                  <div className="flex items-center justify-center h-full -mt-2 relative">
                    {/* Mencoba memuat gambar jika ada, jika tidak munculkan inisial besar */}
                    {!imgError && imgSrc ? (
                        <div className="relative w-full h-full">
                            <Image 
                                src={imgSrc}
                                alt={targetChar}
                                fill
                                className="object-cover"
                                onError={handleImageError}
                                sizes="(max-width: 768px) 96px, 128px"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                            <span className="text-4xl font-black text-emerald-600">
                                {targetChar ? targetChar.split('(')[1]?.replace(')', '') : '?'}
                            </span>
                            <span className="text-[8px] text-slate-400 font-bold mt-1 uppercase">
                                {imgError ? "Gambar Belum Ada" : "Memuat..."}
                            </span>
                        </div>
                    )}
                  </div>
               </div>

               <Classifier onPrediction={handlePrediction} />
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
