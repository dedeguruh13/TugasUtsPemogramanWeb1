# Tugas UTS Pemrograman Web 1 — Rak Kata (Toko Buku Online)

Buka `index.html` di browser. Akun demo: **guruh@rakkata.id / guruh123** (juga rina@rakkata.id / rina123).

## Struktur
- `index.html` — Login (validasi, alert salah email/password, modal Lupa Password & Daftar)
- `dashboard.html` — Menu utama + greeting pagi/siang/sore/malam + jam real-time
- `stok.html` — Katalog dari `dataKatalogBuku`, cari/filter, tambah baris stok via DOM
- `checkout.html` — Pemesanan: tambah/ubah/hapus item, data pemesan, pembayaran, ongkir
- `tracking.html` — Cari nomor DO, progress bar status, detail ekspedisi, timeline
- `history.html` — (tambahan) riwayat transaksi + link lacak
- `css/style.css` — CSS external; CSS internal ada di `dashboard.html`; CSS inline di `index.html`
- `js/data.js` — data dummy Array JSON; `js/script.js` — semua logika (router per halaman via `data-page`)

Data tambahan (akun baru, stok baru, pesanan) disimpan di localStorage agar tetap ada saat pindah halaman.
Nomor DO contoh: DO2026-0001, DO2026-0002, DO2026-0003.
