/* =========================================================
   data.js — Data dummy aplikasi (pengganti server/database)
   Semua data berbentuk Array JSON dan diakses oleh script.js
   ========================================================= */

// Akun yang boleh login
const dataPengguna = [
  { id: 1, nama: "Guruh Khaerullah", email: "guruh@rakkata.id", password: "guruh123", role: "Admin" },
  { id: 2, nama: "Rina Wulandari", email: "rina@rakkata.id", password: "rina123", role: "Staff Gudang" },
  { id: 3, nama: "Agus Pratama", email: "agus@rakkata.id", password: "agus123", role: "Staff Penjualan" }
];

// Katalog buku (wajib: konstanta dataKatalogBuku)
const dataKatalogBuku = [
  { kodeLokasi: "0TMP01", kodeBarang: "ASIP4301", namaBarang: "Pengantar Ilmu Komunikasi", jenisBarang: "Buku Ajar", edisi: "2", stok: 548, harga: 180000, cover: "img/buku1.png" },
  { kodeLokasi: "0JKT01", kodeBarang: "EKMA4216", namaBarang: "Manajemen Keuangan", jenisBarang: "Buku Ajar", edisi: "3", stok: 392, harga: 220000, cover: "img/buku2.png" },
  { kodeLokasi: "0SMG01", kodeBarang: "EKMA4310", namaBarang: "Kepemimpinan dan Berpikir Strategis", jenisBarang: "Buku Ajar", edisi: "1", stok: 278, harga: 175000, cover: "img/buku3.png" },
  { kodeLokasi: "0JKT01", kodeBarang: "MSIM4206", namaBarang: "Pemrograman Web Dasar", jenisBarang: "Buku Praktikum", edisi: "4", stok: 165, harga: 195000, cover: "img/buku4.png" },
  { kodeLokasi: "0BDG01", kodeBarang: "ISIP4214", namaBarang: "Metodologi Penelitian", jenisBarang: "Buku Ajar", edisi: "2", stok: 12, harga: 160000, cover: "img/buku5.png" },
  { kodeLokasi: "0SBY01", kodeBarang: "ESPA4123", namaBarang: "Statistika Bisnis", jenisBarang: "Modul", edisi: "5", stok: 0, harga: 150000, cover: "img/buku6.png" }
];

// Pilihan ekspedisi & paket untuk checkout
const dataEkspedisi = [
  { kode: "JNE", nama: "JNE Express" },
  { kode: "JNT", nama: "J&T Express" },
  { kode: "SICEPAT", nama: "SiCepat" },
  { kode: "POS", nama: "Pos Indonesia" }
];

const dataPaket = [
  { kode: "REG", nama: "Reguler (3–5 hari)", ongkir: 15000 },
  { kode: "YES", nama: "Kilat (1–2 hari)", ongkir: 30000 },
  { kode: "SDS", nama: "Same Day", ongkir: 45000 }
];

// Tahapan status pengiriman (dipakai untuk progress bar)
const tahapanPengiriman = ["Pesanan Diterima", "Dikemas", "Dikirim", "Dalam Perjalanan", "Sampai Tujuan"];

// Data Delivery Order (untuk tracking & history)
const dataTracking = [
  {
    nomorDO: "DO2026-0001",
    nama: "Siti Nurhaliza",
    status: "Dalam Perjalanan",
    ekspedisi: "JNE Express",
    tanggalKirim: "2026-10-28",
    paket: "Reguler (3–5 hari)",
    total: 375000,
    items: [{ kodeBarang: "ASIP4301", namaBarang: "Pengantar Ilmu Komunikasi", qty: 2, harga: 180000 }],
    perjalanan: [
      { waktu: "2026-10-27 09:12", keterangan: "Pesanan diterima sistem" },
      { waktu: "2026-10-27 15:40", keterangan: "Pesanan dikemas di gudang Jakarta" },
      { waktu: "2026-10-28 08:05", keterangan: "Diserahkan ke JNE Jakarta" },
      { waktu: "2026-10-29 21:30", keterangan: "Tiba di hub Bandung" }
    ]
  },
  {
    nomorDO: "DO2026-0002",
    nama: "Budi Santoso",
    status: "Sampai Tujuan",
    ekspedisi: "SiCepat",
    tanggalKirim: "2026-10-20",
    paket: "Kilat (1–2 hari)",
    total: 250000,
    items: [{ kodeBarang: "EKMA4216", namaBarang: "Manajemen Keuangan", qty: 1, harga: 220000 }],
    perjalanan: [
      { waktu: "2026-10-19 10:00", keterangan: "Pesanan diterima sistem" },
      { waktu: "2026-10-19 14:20", keterangan: "Pesanan dikemas" },
      { waktu: "2026-10-20 07:45", keterangan: "Diserahkan ke SiCepat" },
      { waktu: "2026-10-21 11:10", keterangan: "Kurir menuju alamat" },
      { waktu: "2026-10-21 13:02", keterangan: "Diterima oleh Budi (yang bersangkutan)" }
    ]
  },
  {
    nomorDO: "DO2026-0003",
    nama: "Dewi Lestari",
    status: "Dikemas",
    ekspedisi: "J&T Express",
    tanggalKirim: "-",
    paket: "Same Day",
    total: 240000,
    items: [{ kodeBarang: "MSIM4206", namaBarang: "Pemrograman Web Dasar", qty: 1, harga: 195000 }],
    perjalanan: [
      { waktu: "2026-11-04 16:30", keterangan: "Pesanan diterima sistem" },
      { waktu: "2026-11-05 08:00", keterangan: "Pesanan sedang dikemas" }
    ]
  }
];
