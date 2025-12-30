/**
 * Utility Logger untuk menampilkan log sistem AI di Browser Console
 * dan mengirimkannya ke Terminal (via API Route)
 */

const styles = {
  system: "color: #ffffff; background: #10b981; font-weight: bold; padding: 2px 8px; border-radius: 4px;",
  model: "color: #ffffff; background: #3b82f6; font-weight: bold; padding: 2px 8px; border-radius: 4px;",
  detect: "color: #ffffff; background: #f59e0b; font-weight: bold; padding: 2px 8px; border-radius: 4px;",
  info: "color: #10b981; font-weight: bold;",
  error: "color: #ef4444; font-weight: bold; background: #fee2e2; padding: 2px 8px; border-radius: 4px;"
};

// Fungsi internal untuk mengirim log ke Server/Terminal
async function sendToServer(type: string, message: string, data?: any) {
  try {
    // Hanya kirim log jika di lingkungan development
    if (process.env.NODE_ENV === 'development') {
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, data })
      });
    }
  } catch (e) {
    // Abaikan jika gagal kirim ke server
  }
}

export const log = {
  system: (msg: string, data?: any) => {
    console.log(`%cSYSTEM%c ${msg}`, styles.system, styles.info, data || "");
    sendToServer('system', msg, data);
  },
  model: (msg: string, data?: any) => {
    console.log(`%cMODEL%c ${msg}`, styles.model, styles.info, data || "");
    sendToServer('model', msg, data);
  },
  detection: (label: string, confidence: number) => {
    const msg = `Terdeteksi: ${label} (${(confidence * 100).toFixed(1)}%)`;
    console.log(
      `%cDETECT%c %c${label}%c (${(confidence * 100).toFixed(1)}%)`,
      styles.detect,
      "color: #64748b;",
      "color: #10b981; font-weight: bold; font-size: 12px;",
      "color: #94a3b8;"
    );
    sendToServer('detection', msg);
  },
  error: (msg: string, err?: any) => {
    console.error(`%cERROR%c ${msg}`, styles.error, "color: #ef4444;", err || "");
    sendToServer('error', msg, err);
  }
};