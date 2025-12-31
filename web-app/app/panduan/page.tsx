'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HIJAIYAH_CLASSES, HIJAIYAH_LABELS } from "@/lib/constants";
import { ArrowLeft, Hand } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function GestureCard({ itemKey }: { itemKey: string }) {
  const [imgSrc, setImgSrc] = useState(`/gestures/${itemKey.split('_')[1].toLowerCase()}.jpg`);
  const [hasError, setHasError] = useState(false);
  const [triedPng, setTriedPng] = useState(false);

  const handleError = () => {
    if (!triedPng) {
      setImgSrc(imgSrc.replace('.jpg', '.png'));
      setTriedPng(true);
    } else {
      setHasError(true);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-emerald-100/50 bg-white/80 backdrop-blur-sm">
      <div className="aspect-square bg-slate-100 relative flex items-center justify-center overflow-hidden">
        {!hasError ? (
          <Image
            src={imgSrc}
            alt={itemKey}
            fill
            className="object-cover"
            onError={handleError}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-emerald-50/50 flex flex-col items-center justify-center text-emerald-300">
             <Hand className="w-16 h-16 mb-2 opacity-50" />
             <span className="text-xs font-medium uppercase tracking-widest opacity-70">No Image</span>
          </div>
        )}
        
        {/* Arabic Letter Overlay */}
        <div className="absolute bottom-2 right-3 text-6xl font-black text-emerald-900/10 pointer-events-none select-none font-serif">
            {HIJAIYAH_LABELS[itemKey]?.split('(')[1]?.replace(')', '')}
        </div>
      </div>
      
      <CardHeader className="p-4 bg-white border-t border-emerald-50">
        <CardTitle className="text-center">
          <span className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
            {HIJAIYAH_LABELS[itemKey]}
          </span>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function GuidePage() {
  // Sort classes based on their index number to ensure correct order (0, 1, 2...)
  const sortedClasses = [...HIJAIYAH_CLASSES].sort((a, b) => {
    const numA = parseInt(a.split('_')[0]);
    const numB = parseInt(b.split('_')[0]);
    return numA - numB;
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-emerald-100/20">
      {/* Header */}
      <nav className="w-full border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-emerald-100/50">
                <ArrowLeft className="w-5 h-5 text-emerald-800" />
              </Button>
            </Link>
            <span className="font-bold text-xl tracking-tight text-emerald-900">Kamus Isyarat Hijaiyah</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-12 px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Panduan Gestur Tangan
          </h1>
          <p className="text-lg text-slate-600">
            Daftar lengkap referensi bentuk tangan untuk setiap huruf Hijaiyah dalam sistem ini.
            Gunakan panduan ini untuk berlatih sebelum melakukan tes deteksi.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedClasses.map((key) => (
            <GestureCard key={key} itemKey={key} />
          ))}
        </div>
      </div>
    </main>
  );
}
