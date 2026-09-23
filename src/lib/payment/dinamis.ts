import QRCode from 'qrcode';

/**
 * [D01] toCRC16 - Hitung checksum CRC16 untuk string QRIS
 */
export function toCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  let hex = (crc & 0xFFFF).toString(16).toUpperCase();
  return hex.padStart(4, '0');
}

/**
 * [D02] generateDynamicQrisString - Mengonversi string QRIS statis ke dinamis (hanya string)
 * Fungsi murni manipulasi string yang 100% aman digunakan di Client Components maupun Server.
 */
export function generateDynamicQrisString(nominal: string, qrisBase: string): string {
  if (!qrisBase || typeof qrisBase !== 'string') {
    throw new Error('Base QRIS string is missing or invalid.');
  }

  // 1. Ambil qrisBase tanpa 4 digit terakhir (CRC lama)
  const qrisWithoutCRC = qrisBase.slice(0, -4);

  // 2. Ubah indikator tipe (010211 -> statis, 010212 -> dinamis) jika ada
  const replaceQris = qrisWithoutCRC.replace('010211', '010212');

  // 3. Pecah berdasarkan tag identitas (biasanya sebelum informasi merchant)
  const pecahQris = replaceQris.split('5802ID');
  
  if (pecahQris.length < 2) return qrisBase;

  // 4. Buat string nominal (Tag 54)
  // Format: 54 + [panjang nominal 2 digit] + [nominal] + 5802ID (penutup tag negara)
  const nominalTag = '54' + ('0' + nominal.length).slice(-2) + nominal + '5802ID';

  // 5. Gabungkan kembali dan hitung CRC16 baru
  const finalStringWithoutCRC = pecahQris[0] + nominalTag + pecahQris[1];
  return finalStringWithoutCRC + toCRC16(finalStringWithoutCRC);
}
