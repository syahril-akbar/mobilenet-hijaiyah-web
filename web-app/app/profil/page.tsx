'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHistory } from '@/hooks/use-history';
import { ArrowLeft, Trash2, Calendar, Award } from 'lucide-react';
import Link from 'next/link';

export default function ProfilPage() {
  const { history, clearHistory, getStats } = useHistory();
  const { total, byDate } = getStats();

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-emerald-100/20">
      {/* Header */}
      <nav className="w-full border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/latihan">
              <Button variant="ghost" size="icon" className="hover:bg-emerald-100/50 rounded-full">
                <ArrowLeft className="w-5 h-5 text-emerald-800" />
              </Button>
            </Link>
            <span className="font-bold text-xl tracking-tight text-emerald-900">Riwayat Belajar</span>
          </div>
          {history.length > 0 && (
            <Button variant="destructive" size="sm" onClick={clearHistory} className="shadow-sm">
              <Trash2 className="w-4 h-4 mr-2" /> Reset Data
            </Button>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
        
        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-emerald-600 text-white border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-widest">Total Huruf Dikuasai</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black">{total}</div>
              <p className="text-sm opacity-70 mt-2">Terus tingkatkan latihanmu!</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-emerald-800 uppercase tracking-widest flex items-center">
                <Calendar className="w-4 h-4 mr-2" /> Aktivitas Harian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(byDate).length === 0 ? (
                <p className="text-slate-400 italic text-sm">Belum ada aktivitas belajar.</p>
              ) : (
                Object.entries(byDate).slice(0, 3).map(([date, count]) => (
                  <div key={date} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-slate-600 font-medium">{date}</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+{count} Huruf</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabel Riwayat Detail */}
        <Card className="border-emerald-100/50 shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">Log Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <div className="max-h-[500px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-slate-300" />
                </div>
                <p>Belum ada data latihan yang terekam.</p>
                <Link href="/latihan" className="mt-4">
                  <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">Mulai Latihan Sekarang</Button>
                </Link>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                  <tr>
                    <th className="px-6 py-3 w-1/3">Waktu</th>
                    <th className="px-6 py-3">Huruf</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(item.date).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-lg">{item.label}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Selesai
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
