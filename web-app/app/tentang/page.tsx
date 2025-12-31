'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Code2, ShieldCheck, Cpu, Camera, Hand, Brain, Sparkles, Globe } from 'lucide-react';
import Link from 'next/link';

export default function TentangPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-emerald-100/20">
      {/* Header */}
      <nav className="w-full border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-emerald-100/50 rounded-full">
                <ArrowLeft className="w-5 h-5 text-emerald-800" />
              </Button>
            </Link>
            <span className="font-bold text-xl tracking-tight text-emerald-900">Tentang HijaiyahAI</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-4 space-y-16">
        
        {/* Visi & Misi Aplikasi */}
        <section className="text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-emerald-50 shadow-xl mb-8">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Mengenal HijaiyahAI</h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-medium">
            Sebuah platform edukasi cerdas yang menggabungkan kecerdasan buatan (AI) dengan pembelajaran bahasa Arab untuk menciptakan pengalaman belajar yang interaktif dan inklusif.
          </p>
        </section>

        {/* Fitur Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "Klasifikasi Real-time", 
              desc: "Mendeteksi gestur tangan secara instan menggunakan kamera perangkat tanpa delay yang berarti.",
              icon: <Camera className="w-6 h-6" />,
              color: "bg-emerald-100 text-emerald-600"
            },
            { 
              title: "Auto Hand Tracking", 
              desc: "Menggunakan teknologi Computer Vision tercanggih untuk melacak posisi tangan secara otomatis di layar.",
              icon: <Hand className="w-6 h-6" />,
              color: "bg-blue-100 text-blue-600"
            },
            { 
              title: "Privasi Total", 
              desc: "Seluruh pemrosesan video dilakukan secara lokal di perangkat Anda. Tidak ada data kamera yang dikirim ke server.",
              icon: <ShieldCheck className="w-6 h-6" />,
              color: "bg-amber-100 text-amber-600"
            }
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-sm bg-white/60 backdrop-blur-sm p-2">
              <CardHeader>
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-2`}>
                  {item.icon}
                </div>
                <CardTitle className="text-lg font-bold text-slate-800">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cara Kerja Sistem */}
        <section className="bg-emerald-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Brain className="w-64 h-64" />
          </div>
          <div className="relative z-10 space-y-8">
            <div className="inline-block px-4 py-1 rounded-full bg-emerald-800/50 border border-emerald-700 text-emerald-200 text-xs font-bold uppercase tracking-widest">
              Teknologi di Balik Layar
            </div>
            <h2 className="text-3xl font-black tracking-tight">Bagaimana AI Mengenali Gestur Anda?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-emerald-950">1</div>
                  <p className="text-emerald-100/80 text-sm leading-relaxed">
                    <strong className="text-white">MediaPipe Tracking:</strong> Sistem mendeteksi 21 titik kunci (landmarks) pada tangan Anda untuk mengunci posisi ROI secara dinamis.
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-emerald-950">2</div>
                  <p className="text-emerald-100/80 text-sm leading-relaxed">
                    <strong className="text-white">Preprocessing:</strong> Gambar tangan dipotong, diubah ukurannya menjadi 224x224 piksel, dan dinormalisasi agar siap diproses oleh otak AI.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-emerald-950">3</div>
                  <p className="text-emerald-100/80 text-sm leading-relaxed">
                    <strong className="text-white">MobileNetV2:</strong> Arsitektur saraf tiruan (CNN) yang ringan menganalisis pola jari untuk menentukan huruf Hijaiyah yang sesuai.
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-emerald-950">4</div>
                  <p className="text-emerald-100/80 text-sm leading-relaxed">
                    <strong className="text-white">TensorFlow.js:</strong> Seluruh proses inferensi berjalan langsung di browser Anda menggunakan akselerasi GPU (WebGL).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stack Teknologi */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">Teknologi Modern</h2>
            <p className="text-slate-500 text-sm">Dibangun dengan ekosistem teknologi terbaik</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "Next.js", icon: <Globe className="w-4 h-4" /> },
              { name: "TensorFlow.js", icon: <Code2 className="w-4 h-4" /> },
              { name: "MobileNetV2", icon: <Cpu className="w-4 h-4" /> },
              { name: "MediaPipe", icon: <Hand className="w-4 h-4" /> },
              { name: "Tailwind CSS", icon: <Sparkles className="w-4 h-4" /> },
              { name: "TypeScript", icon: <Code2 className="w-4 h-4" /> }
            ].map((tech, i) => (
              <div key={i} className="flex items-center space-x-2 bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-emerald-600">{tech.icon}</div>
                <span className="text-sm font-bold text-slate-700">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center pt-8 border-t border-slate-200">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            HijaiyahAI • 2025
          </p>
        </div>

      </div>
    </main>
  );
}