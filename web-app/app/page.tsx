'use client';

import Classifier from '@/components/classifier';
import { Card } from '@/components/ui/card';
import { Github, Info, BookOpen, Play, Activity, ShieldCheck, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-emerald-100/20">
      {/* Navigasi / Header - Bagian atas halaman */}
      <nav className="w-full border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 z-50">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              H
            </div>
            <span className="font-bold text-xl tracking-tight text-emerald-900">HijaiyahAI</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-emerald-800">
            <Link href="/latihan" className="hover:text-primary transition-colors flex items-center">
              <Activity className="w-4 h-4 mr-1" /> Latihan
            </Link>
            <Link href="/panduan" className="hover:text-primary transition-colors flex items-center">
              <BookOpen className="w-4 h-4 mr-1" /> Panduan
            </Link>
            <Link href="/profil" className="hover:text-primary transition-colors flex items-center">
              <Activity className="w-4 h-4 mr-1" /> Profil
            </Link>
            <Link href="/tentang" className="hover:text-primary transition-colors flex items-center">
              <Info className="w-4 h-4 mr-1" /> Tentang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden z-50 p-2 text-emerald-800 hover:bg-emerald-50 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-16 left-0 w-full bg-white border-b border-emerald-100 shadow-xl z-40 md:hidden animate-in fade-in slide-in-from-top-5 duration-200">
              <div className="flex flex-col p-4 space-y-2 text-base font-medium text-emerald-900">
                <Link 
                  href="/latihan" 
                  className="flex items-center p-4 bg-emerald-50/50 hover:bg-emerald-100 rounded-xl transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center mr-4 text-emerald-800 shadow-sm">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold">Latihan</span>
                    <span className="text-xs text-emerald-600 font-normal">Uji kemampuan isyaratmu</span>
                  </div>
                </Link>
                <Link 
                  href="/panduan" 
                  className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 text-blue-600 shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">Panduan</span>
                    <span className="text-xs text-slate-500 font-normal">Kamus lengkap huruf Hijaiyah</span>
                  </div>
                </Link>
                <Link 
                  href="/profil" 
                  className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4 text-amber-600 shadow-sm">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">Profil Saya</span>
                    <span className="text-xs text-slate-500 font-normal">Lihat progres belajarmu</span>
                  </div>
                </Link>
                <Link 
                  href="/tentang" 
                  className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mr-4 text-slate-700 shadow-sm">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">Tentang</span>
                    <span className="text-xs text-slate-500 font-normal">Informasi aplikasi</span>
                  </div>
                </Link>
              </div>
              <div className="w-full py-4 bg-slate-50 border-t border-slate-100 text-center text-slate-400 text-xs font-medium">
                © 2025 HijaiyahAI • Versi 1.0.0
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
        {/* Hero Section - Judul dan deskripsi singkat aplikasi */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold tracking-wide uppercase animate-in fade-in slide-in-from-bottom-2 duration-700">
            Sistem Pembelajaran Cerdas
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]">
            Klasifikasi Huruf <span className="text-primary italic underline decoration-emerald-200 underline-offset-8">Hijaiyah</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed font-medium">
            Sistem pengenalan gestur tangan real-time berbasis <span className="text-emerald-700 font-bold">MobileNetV2</span>. 
            Belajar bahasa isyarat Arab dengan teknologi AI masa kini.
          </p>
        </section>

        {/* Classifier Container - Wadah utama untuk sistem deteksi kamera */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <Card className="relative bg-white/80 backdrop-blur-xl rounded-[1.8rem] shadow-2xl overflow-hidden border-emerald-100/50 p-2 md:p-4">
             <Classifier />
          </Card>
        </section>

        {/* Sorotan Fitur - Keunggulan sistem aplikasi */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Deteksi Real-time", desc: "Proses klasifikasi instan langsung di browser Anda menggunakan WebGL.", icon: <Play className="w-5 h-5" /> },
            { title: "Privasi Terjamin", desc: "Semua pemrosesan data kamera dilakukan secara lokal di perangkat Anda.", icon: <ShieldCheck className="w-5 h-5" /> },
            { title: "Arsitektur MobileNetV2", desc: "Menggunakan model yang ringan dan efisien untuk performa maksimal.", icon: <Activity className="w-5 h-5" /> }
          ].map((f, i) => (
            <Card key={i} className="p-6 border-emerald-50 bg-white/50 hover:bg-white transition-colors duration-300">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-lg text-emerald-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </section>

        {/* Footer - Hak cipta dan tautan eksternal */}
        <footer className="pt-12 border-t border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-slate-400 text-sm font-medium text-center md:text-left">
            © 2025 HijaiyahAI
          </div>
          <div className="flex space-x-6 text-slate-400">
            <a href="#" className="hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
          </div>
        </footer>
      </div>
    </main>
  );
}