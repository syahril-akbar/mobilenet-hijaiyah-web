import { NextResponse } from 'next/server';

/**
 * API Route untuk menerima log dari browser dan menampilkannya di Terminal
 */
export async function POST(request: Request) {
  try {
    const { type, message, data } = await request.json();
    
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    
    // Warna untuk terminal (ANSI escape codes)
    const colors = {
      reset: "\x1b[0m",
      system: "\x1b[32m", // Hijau
      model: "\x1b[34m",  // Biru
      detect: "\x1b[33m", // Kuning
      error: "\x1b[31m",  // Merah
    };

    let color = colors.reset;
    if (type === 'system') color = colors.system;
    if (type === 'model') color = colors.model;
    if (type === 'detection') color = colors.detect;
    if (type === 'error') color = colors.error;

    console.log(`${color}${prefix}${colors.reset} ${message}`, data || "");

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
