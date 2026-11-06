/* =========================================================
   script.js — Logika aplikasi Rak Kata
   Data diambil dari data.js (dataPengguna, dataKatalogBuku, dataTracking, ...)
   Setiap halaman punya atribut <body data-page="..."> dan
   fungsi init masing-masing dipanggil oleh "router" di bagian bawah.
   ========================================================= */

/* ---------- 1. Utilitas umum ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const formatRupiah = (n) => "Rp" + Number(n).toLocaleString("id-ID");
const formatTanggal = (str) => {
  if (!str || str === "-") return "Belum dikirim";
  return new Date(str).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};
const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Penyimpanan lokal (agar data tambahan tetap ada saat pindah halaman)
function ambil(kunci, bawaan) {
  try {
    const isi = localStorage.getItem(kunci);
    return isi ? JSON.parse(isi) : bawaan;
  } catch (e) {
    return bawaan;
  }
}
function simpan(kunci, nilai) {
  try { localStorage.setItem(kunci, JSON.stringify(nilai)); } catch (e) { /* abaikan */ }
}

// Gabungan data dummy + data yang ditambahkan pengguna
const semuaPengguna = () => [...dataPengguna, ...ambil("penggunaBaru", [])];
const semuaKatalog = () => [...dataKatalogBuku, ...ambil("stokTambahan", [])];
const semuaPesanan = () => [...dataTracking, ...ambil("pesananBaru", [])];
const cariBuku = (kode) => semuaKatalog().find((b) => b.kodeBarang === kode);

/* ---------- 2. Modal, alert, toast ---------- */
function bukaModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.add("tampil");
  m.setAttribute("aria-hidden", "false");
  const input = $("input, select, button", m);
  if (input) setTimeout(() => input.focus(), 50);
}
function tutupModal(id) {
  const m = typeof id === "string" ? document.getElementById(id) : id;
  if (!m) return;
  m.classList.remove("tampil");
  m.setAttribute("aria-hidden", "true");
}

// Alert box kustom (dibuat lewat DOM, tidak perlu ditulis di HTML)
function tampilAlert(judul, pesan, tipe = "error", aksi) {
  let m = document.getElementById("modalAlert");
  if (!m) {
    m = document.createElement("div");
    m.id = "modalAlert";
    m.className = "modal";
    m.setAttribute("role", "alertdialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML = `
      <div class="modal-box">
        <div class="modal-head"><h2 id="alertJudul"></h2><button class="tutup" data-tutup aria-label="Tutup">&times;</button></div>
        <p id="alertPesan"></p>
        <div class="modal-aksi" id="alertAksi"></div>
      </div>`;
    document.body.appendChild(m);
  }
  $(".modal-box", m).className = "modal-box " + (tipe === "error" ? "alert-error" : "alert-sukses");
  $("#alertJudul", m).textContent = judul;
  $("#alertPesan", m).textContent = pesan;
  const wadahAksi = $("#alertAksi", m);
  wadahAksi.innerHTML = "";
  if (aksi) {
    const a = document.createElement("a");
    a.className = "btn btn-garis";
    a.href = aksi.href;
    a.textContent = aksi.label;
    wadahAksi.appendChild(a);
  }
  const ok = document.createElement("button");
  ok.className = "btn btn-utama";
  ok.textContent = "Mengerti";
  ok.setAttribute("data-tutup", "");
  wadahAksi.appendChild(ok);
  bukaModal("modalAlert");
}

function toast(pesan) {
  let t = $(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.appendChild(t);
  }
  t.textContent = pesan;
  t.classList.add("tampil");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("tampil"), 2500);
}

// Tutup modal: tombol [data-tutup], klik latar, atau tombol Esc
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-tutup]")) tutupModal(e.target.closest(".modal"));
  else if (e.target.classList.contains("modal")) tutupModal(e.target);
  const pembuka = e.target.closest("[data-buka]");
  if (pembuka) { e.preventDefault(); bukaModal(pembuka.dataset.buka); }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") $$(".modal.tampil").forEach(tutupModal);
});

/* ---------- 3. Validasi form ---------- */
// Hapus tanda error begitu pengguna mulai memperbaiki isian
document.addEventListener("input", (e) => {
  if (e.target.closest(".field.error")) setError(e.target, "");
});

function setError(input, pesan) {
  const field = input.closest(".field");
  if (!field) return;
  field.classList.toggle("error", Boolean(pesan));
  input.setAttribute("aria-invalid", pesan ? "true" : "false");
  const el = $(".pesan-error", field);
  if (el) el.textContent = pesan || "";
}
function bersihkanError(form) {
  $$(".field", form).forEach((f) => {
    f.classList.remove("error");
    const el = $(".pesan-error", f);
    if (el) el.textContent = "";
  });
}
// Validasi sekumpulan aturan: [[input, fungsiCek -> pesan error atau ""], ...]
function validasi(aturan) {
  let valid = true;
  let pertama = null;
  aturan.forEach(([input, cek]) => {
    const pesan = cek(input.value.trim());
    setError(input, pesan);
    if (pesan) { valid = false; if (!pertama) pertama = input; }
  });
  if (pertama) pertama.focus();
  return valid;
}
const wajib = (label) => (v) => (v ? "" : `${label} wajib diisi.`);

/* ---------- 4. Sesi login ---------- */
const sesiAktif = () => ambil("sesiUser", null);

function cekLogin() {
  const sesi = sesiAktif();
  if (!sesi) {
    window.location.href = "index.html";
    return null;
  }
  const nama = $("#namaUser");
  if (nama) nama.textContent = sesi.nama;
  const keluar = $("#btnKeluar");
  if (keluar) keluar.addEventListener("click", () => {
    localStorage.removeItem("sesiUser");
    window.location.href = "index.html";
  });
  // Tandai menu navigasi yang sedang aktif
  const halaman = location.pathname.split("/").pop() || "dashboard.html";
  $$(".nav a").forEach((a) => {
    if (a.getAttribute("href") === halaman) { a.classList.add("aktif"); a.setAttribute("aria-current", "page"); }
  });
  return sesi;
}

/* ---------- 5. Halaman Login (index.html) ---------- */
function initLogin() {
  if (sesiAktif()) { window.location.href = "dashboard.html"; return; }

  const form = $("#formLogin");
  const email = $("#email");
  const password = $("#password");

  $("#lihatPassword").addEventListener("click", (e) => {
    const terlihat = password.type === "text";
    password.type = terlihat ? "password" : "text";
    e.currentTarget.textContent = terlihat ? "Lihat" : "Sembunyikan";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = validasi([
      [email, (v) => (!v ? "Email wajib diisi." : !polaEmail.test(v) ? "Format email tidak valid, contoh: nama@domain.com" : "")],
      [password, wajib("Password")]
    ]);
    if (!ok) return;

    const user = semuaPengguna().find(
      (u) => u.email.toLowerCase() === email.value.trim().toLowerCase() && u.password === password.value
    );
    if (!user) {
      tampilAlert("Login gagal", "Email/password yang anda masukkan salah.", "error");
      password.value = "";
      return;
    }
    simpan("sesiUser", { id: user.id, nama: user.nama, email: user.email, role: user.role });
    window.location.href = "dashboard.html";
  });

  // Modal Lupa Password
  $("#formLupa").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#emailLupa");
    const ok = validasi([[input, (v) => (!v ? "Email wajib diisi." : !polaEmail.test(v) ? "Format email tidak valid." : "")]]);
    if (!ok) return;
    const ada = semuaPengguna().some((u) => u.email.toLowerCase() === input.value.trim().toLowerCase());
    if (!ada) { setError(input, "Email ini belum terdaftar. Periksa kembali atau daftar akun baru."); return; }
    tutupModal("modalLupa");
    tampilAlert("Cek email Anda", `Tautan untuk mengatur ulang password sudah dikirim ke ${input.value.trim()} (simulasi).`, "sukses");
    e.target.reset();
  });

  // Modal Daftar
  $("#formDaftar").addEventListener("submit", (e) => {
    e.preventDefault();
    const nama = $("#namaDaftar"), mail = $("#emailDaftar"), pass = $("#passDaftar"), konf = $("#konfirmasiDaftar");
    const ok = validasi([
      [nama, (v) => (v.length < 3 ? "Nama minimal 3 karakter." : "")],
      [mail, (v) => {
        if (!polaEmail.test(v)) return "Format email tidak valid.";
        if (semuaPengguna().some((u) => u.email.toLowerCase() === v.toLowerCase())) return "Email ini sudah terdaftar.";
        return "";
      }],
      [pass, (v) => (v.length < 6 ? "Password minimal 6 karakter." : "")],
      [konf, (v) => (v !== pass.value.trim() ? "Konfirmasi password tidak sama." : "")]
    ]);
    if (!ok) return;
    const baru = ambil("penggunaBaru", []);
    baru.push({ id: Date.now(), nama: nama.value.trim(), email: mail.value.trim(), password: pass.value.trim(), role: "Pelanggan" });
    simpan("penggunaBaru", baru);
    tutupModal("modalDaftar");
    email.value = mail.value.trim();
    tampilAlert("Pendaftaran berhasil", "Akun Anda sudah dibuat. Silakan login dengan email dan password tadi.", "sukses");
    e.target.reset();
  });
}

/* ---------- 6. Dashboard (dashboard.html) ---------- */
function sapaanWaktu(jam) {
  if (jam >= 4 && jam < 11) return { teks: "Selamat pagi", kelas: "pagi" };
  if (jam >= 11 && jam < 15) return { teks: "Selamat siang", kelas: "siang" };
  if (jam >= 15 && jam < 18) return { teks: "Selamat sore", kelas: "sore" };
  return { teks: "Selamat malam", kelas: "malam" };
}

function initDashboard() {
  const sesi = cekLogin();
  if (!sesi) return;

  const sapa = sapaanWaktu(new Date().getHours());
  $("#greeting").textContent = `${sapa.teks}, ${sesi.nama.split(" ")[0]}`;
  document.body.classList.add("waktu-" + sapa.kelas);
  $("#peran").textContent = sesi.role;

  const perbaruiJam = () => {
    const now = new Date();
    $("#jam").textContent = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    $("#tanggal").textContent = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };
  perbaruiJam();
  setInterval(perbaruiJam, 1000);

  const katalog = semuaKatalog();
  const pesanan = semuaPesanan();
  $("#jmlJudul").textContent = katalog.length;
  $("#jmlStok").textContent = katalog.reduce((t, b) => t + Number(b.stok), 0).toLocaleString("id-ID");
  $("#jmlMenipis").textContent = katalog.filter((b) => b.stok < 20).length;
  $("#jmlPesanan").textContent = pesanan.length;
}

/* ---------- 7. Katalog / Stok (stok.html) ---------- */
function badgeStok(stok) {
  const span = document.createElement("span");
  span.className = "badge " + (stok == 0 ? "badge-habis" : stok < 20 ? "badge-tipis" : "badge-aman");
  span.textContent = stok == 0 ? "Habis" : `${stok} pcs`;
  return span;
}

// Membuat satu baris <tr> stok memakai DOM (createElement)
function buatBarisStok(buku, bisaDihapus) {
  const tr = document.createElement("tr");
  tr.dataset.kode = buku.kodeBarang;

  const tdCover = document.createElement("td");
  const img = document.createElement("img");
  img.src = buku.cover || "assets/logo.png";
  img.alt = "Sampul " + buku.namaBarang;
  img.className = "cover-kecil";
  tdCover.appendChild(img);
  tr.appendChild(tdCover);

  [buku.kodeBarang, buku.namaBarang, buku.jenisBarang, buku.edisi, buku.kodeLokasi].forEach((isi) => {
    const td = document.createElement("td");
    td.textContent = isi;
    tr.appendChild(td);
  });

  const tdStok = document.createElement("td");
  tdStok.appendChild(badgeStok(buku.stok));
  tr.appendChild(tdStok);

  const tdHarga = document.createElement("td");
  tdHarga.className = "angka";
  tdHarga.textContent = formatRupiah(buku.harga);
  tr.appendChild(tdHarga);

  const tdAksi = document.createElement("td");
  const btnPesan = document.createElement("button");
  btnPesan.className = "btn btn-utama btn-kecil";
  btnPesan.textContent = "Pesan";
  btnPesan.disabled = buku.stok == 0;
  btnPesan.addEventListener("click", () => tambahKeKeranjang(buku.kodeBarang, 1));
  tdAksi.appendChild(btnPesan);

  if (bisaDihapus) {
    const btnHapus = document.createElement("button");
    btnHapus.className = "btn btn-bahaya btn-kecil";
    btnHapus.textContent = "Hapus";
    btnHapus.style.marginLeft = "6px";
    btnHapus.addEventListener("click", () => {
      if (!confirm(`Hapus "${buku.namaBarang}" dari katalog?`)) return;
      simpan("stokTambahan", ambil("stokTambahan", []).filter((b) => b.kodeBarang !== buku.kodeBarang));
      tr.remove();
      perbaruiInfoJumlah();
      toast("Buku dihapus dari katalog.");
    });
    tdAksi.appendChild(btnHapus);
  }
  tr.appendChild(tdAksi);
  return tr;
}

function perbaruiInfoJumlah() {
  const el = $("#infoJumlah");
  if (el) el.textContent = `${$$("#tabelStok tbody tr[data-kode]").length} judul ditampilkan`;
}

function renderStok() {
  const tbody = $("#tabelStok tbody");
  const kata = $("#cariBuku").value.trim().toLowerCase();
  const jenis = $("#filterJenis").value;
  const kodeTambahan = ambil("stokTambahan", []).map((b) => b.kodeBarang);

  tbody.innerHTML = "";
  const hasil = semuaKatalog().filter((b) =>
    (!kata || b.namaBarang.toLowerCase().includes(kata) || b.kodeBarang.toLowerCase().includes(kata)) &&
    (!jenis || b.jenisBarang === jenis)
  );

  if (hasil.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 9;
    td.className = "kosong";
    td.textContent = "Tidak ada buku yang cocok. Ubah kata kunci atau filter jenis.";
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  hasil.forEach((b) => tbody.appendChild(buatBarisStok(b, kodeTambahan.includes(b.kodeBarang))));
  perbaruiInfoJumlah();
}

function isiFilterJenis() {
  const select = $("#filterJenis");
  const nilai = select.value;
  select.length = 1;
  [...new Set(semuaKatalog().map((b) => b.jenisBarang))].forEach((j) => {
    const opt = document.createElement("option");
    opt.value = j;
    opt.textContent = j;
    select.appendChild(opt);
  });
  select.value = nilai;
}

function initStok() {
  if (!cekLogin()) return;
  isiFilterJenis();
  renderStok();
  $("#cariBuku").addEventListener("input", renderStok);
  $("#filterJenis").addEventListener("change", renderStok);

  $("#formStok").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const kode = f.kodeBarang, nama = f.namaBarang, jenisB = f.jenisBarang, edisi = f.edisi, lokasi = f.kodeLokasi, stok = f.stok, harga = f.harga;
    const ok = validasi([
      [kode, (v) => {
        if (!/^[A-Za-z]{4}\d{4}$/.test(v)) return "Format kode: 4 huruf + 4 angka, contoh EKMA4100.";
        if (cariBuku(v.toUpperCase())) return "Kode barang sudah dipakai.";
        return "";
      }],
      [nama, (v) => (v.length < 3 ? "Nama buku minimal 3 karakter." : "")],
      [jenisB, wajib("Jenis barang")],
      [edisi, (v) => (!/^\d+$/.test(v) ? "Edisi berupa angka." : "")],
      [lokasi, (v) => (!/^[A-Za-z0-9]{6}$/.test(v) ? "Kode lokasi 6 karakter, contoh 0JKT01." : "")],
      [stok, (v) => (v === "" || !/^\d+$/.test(v) ? "Stok berupa angka 0 atau lebih." : "")],
      [harga, (v) => (!/^\d+$/.test(v) || Number(v) < 1000 ? "Harga minimal Rp1.000." : "")]
    ]);
    if (!ok) return;

    const buku = {
      kodeLokasi: lokasi.value.trim().toUpperCase(),
      kodeBarang: kode.value.trim().toUpperCase(),
      namaBarang: nama.value.trim(),
      jenisBarang: jenisB.value,
      edisi: edisi.value.trim(),
      stok: Number(stok.value),
      harga: Number(harga.value),
      cover: f.cover.value
    };
    const tambahan = ambil("stokTambahan", []);
    tambahan.push(buku);
    simpan("stokTambahan", tambahan);

    // Tambah baris baru langsung ke tabel lewat DOM
    $("#cariBuku").value = "";
    $("#filterJenis").value = "";
    renderStok();
    isiFilterJenis();
    const baris = $(`#tabelStok tr[data-kode="${buku.kodeBarang}"]`);
    if (baris) { baris.classList.add("baru"); baris.scrollIntoView({ behavior: "smooth", block: "center" }); }

    f.reset();
    bersihkanError(f);
    tutupModal("modalStok");
    toast(`"${buku.namaBarang}" ditambahkan ke katalog.`);
  });
}

/* ---------- 8. Keranjang & Checkout (checkout.html) ---------- */
const ambilKeranjang = () => ambil("keranjang", []);
const simpanKeranjang = (k) => simpan("keranjang", k);

function tambahKeKeranjang(kode, qty) {
  const buku = cariBuku(kode);
  if (!buku) return false;
  const keranjang = ambilKeranjang();
  const item = keranjang.find((i) => i.kodeBarang === kode);
  const total = (item ? item.qty : 0) + qty;
  if (total > buku.stok) {
    tampilAlert("Stok tidak cukup", `Stok "${buku.namaBarang}" tersisa ${buku.stok} pcs.`, "error");
    return false;
  }
  if (item) item.qty = total; else keranjang.push({ kodeBarang: kode, qty });
  simpanKeranjang(keranjang);
  toast(`${buku.namaBarang} masuk ke pesanan (${total} pcs).`);
  return true;
}

function hitungRingkasan() {
  const keranjang = ambilKeranjang();
  const subtotal = keranjang.reduce((t, i) => t + (cariBuku(i.kodeBarang)?.harga || 0) * i.qty, 0);
  const paket = dataPaket.find((p) => p.kode === $("#paket")?.value);
  const ongkir = keranjang.length && paket ? paket.ongkir : 0;
  return { subtotal, ongkir, total: subtotal + ongkir, jumlahItem: keranjang.reduce((t, i) => t + i.qty, 0) };
}

function renderRingkasan() {
  const r = hitungRingkasan();
  $("#rSubtotal").textContent = formatRupiah(r.subtotal);
  $("#rOngkir").textContent = formatRupiah(r.ongkir);
  $("#rTotal").textContent = formatRupiah(r.total);
  $("#rItem").textContent = `${r.jumlahItem} buku`;
}

function renderKeranjang() {
  const tbody = $("#tabelKeranjang tbody");
  tbody.innerHTML = "";
  const keranjang = ambilKeranjang();

  if (keranjang.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" class="kosong">Belum ada buku di pesanan. Pilih buku di atas atau dari <a href="stok.html">katalog</a>.</td>`;
    tbody.appendChild(tr);
  }

  keranjang.forEach((item) => {
    const buku = cariBuku(item.kodeBarang);
    if (!buku) return;
    const tr = document.createElement("tr");

    const tdNama = document.createElement("td");
    const strong = document.createElement("strong");
    strong.textContent = buku.namaBarang;
    const kecil = document.createElement("div");
    kecil.style.cssText = "font-size:.82rem;color:var(--abu)";
    kecil.textContent = `${buku.kodeBarang} · stok ${buku.stok}`;
    tdNama.append(strong, kecil);

    const tdHarga = document.createElement("td");
    tdHarga.className = "angka";
    tdHarga.textContent = formatRupiah(buku.harga);

    // Kontrol jumlah (ubah data pemesanan)
    const tdQty = document.createElement("td");
    const wadah = document.createElement("div");
    wadah.className = "qty";
    const kurang = document.createElement("button");
    kurang.type = "button"; kurang.textContent = "−"; kurang.setAttribute("aria-label", "Kurangi");
    const input = document.createElement("input");
    input.type = "number"; input.min = 1; input.max = buku.stok; input.value = item.qty;
    input.setAttribute("aria-label", "Jumlah " + buku.namaBarang);
    const tambah = document.createElement("button");
    tambah.type = "button"; tambah.textContent = "+"; tambah.setAttribute("aria-label", "Tambah");
    wadah.append(kurang, input, tambah);
    tdQty.appendChild(wadah);

    const tdSub = document.createElement("td");
    tdSub.className = "angka";
    tdSub.textContent = formatRupiah(buku.harga * item.qty);

    const tdAksi = document.createElement("td");
    const hapus = document.createElement("button");
    hapus.type = "button";
    hapus.className = "btn btn-bahaya btn-kecil";
    hapus.textContent = "Hapus";
    tdAksi.appendChild(hapus);

    const ubahQty = (nilai) => {
      let q = parseInt(nilai, 10);
      if (isNaN(q) || q < 1) q = 1;
      if (q > buku.stok) { q = buku.stok; toast(`Maksimal ${buku.stok} pcs sesuai stok.`); }
      const k = ambilKeranjang();
      k.find((i) => i.kodeBarang === buku.kodeBarang).qty = q;
      simpanKeranjang(k);
      input.value = q;
      tdSub.textContent = formatRupiah(buku.harga * q);
      renderRingkasan();
    };
    kurang.addEventListener("click", () => ubahQty(Number(input.value) - 1));
    tambah.addEventListener("click", () => ubahQty(Number(input.value) + 1));
    input.addEventListener("change", () => ubahQty(input.value));
    hapus.addEventListener("click", () => {
      simpanKeranjang(ambilKeranjang().filter((i) => i.kodeBarang !== buku.kodeBarang));
      renderKeranjang();
      toast(`${buku.namaBarang} dihapus dari pesanan.`);
    });

    tr.append(tdNama, tdHarga, tdQty, tdSub, tdAksi);
    tbody.appendChild(tr);
  });
  renderRingkasan();
}

function isiSelect(select, data, nilaiFn, teksFn) {
  data.forEach((d) => {
    const opt = document.createElement("option");
    opt.value = nilaiFn(d);
    opt.textContent = teksFn(d);
    select.appendChild(opt);
  });
}

function initCheckout() {
  const sesi = cekLogin();
  if (!sesi) return;

  isiSelect($("#pilihBuku"), semuaKatalog().filter((b) => b.stok > 0), (b) => b.kodeBarang, (b) => `${b.namaBarang} — ${formatRupiah(b.harga)}`);
  isiSelect($("#ekspedisi"), dataEkspedisi, (e) => e.kode, (e) => e.nama);
  isiSelect($("#paket"), dataPaket, (p) => p.kode, (p) => `${p.nama} — ${formatRupiah(p.ongkir)}`);
  $("#emailPemesan").value = sesi.email;
  renderKeranjang();

  // Tambah item ke data pemesanan
  $("#btnTambahItem").addEventListener("click", () => {
    const pilih = $("#pilihBuku"), jml = $("#jumlahItem");
    const ok = validasi([
      [pilih, wajib("Buku")],
      [jml, (v) => (!/^\d+$/.test(v) || Number(v) < 1 ? "Jumlah minimal 1." : "")]
    ]);
    if (!ok) return;
    if (tambahKeKeranjang(pilih.value, Number(jml.value))) {
      pilih.value = ""; jml.value = 1;
      renderKeranjang();
    }
  });

  $("#paket").addEventListener("change", renderRingkasan);

  // Info pembayaran berubah sesuai metode
  const infoBayar = {
    transfer: "Transfer ke BCA 123-456-7890 a.n. PT Rak Kata Nusantara. Pesanan diproses setelah pembayaran terverifikasi.",
    ewallet: "Kode pembayaran e-wallet (GoPay/OVO/DANA) akan dikirim ke email setelah pesanan dibuat.",
    cod: "Bayar tunai ke kurir saat buku sampai. Siapkan uang pas."
  };
  $$("input[name=metode]").forEach((r) =>
    r.addEventListener("change", () => { $("#infoBayar").textContent = infoBayar[r.value]; setError(r, ""); })
  );

  $("#formCheckout").addEventListener("submit", (e) => {
    e.preventDefault();
    if (ambilKeranjang().length === 0) {
      tampilAlert("Pesanan masih kosong", "Tambahkan minimal satu buku sebelum membuat pesanan.", "error");
      return;
    }
    const f = e.target;
    const ok = validasi([
      [f.namaPemesan, (v) => (v.length < 3 ? "Nama minimal 3 karakter." : "")],
      [f.emailPemesan, (v) => (!polaEmail.test(v) ? "Format email tidak valid." : "")],
      [f.telepon, (v) => (!/^08\d{8,11}$/.test(v) ? "Nomor HP diawali 08, 10–13 digit." : "")],
      [f.alamat, (v) => (v.length < 10 ? "Tulis alamat lengkap (minimal 10 karakter)." : "")],
      [f.ekspedisi, wajib("Ekspedisi")],
      [f.paket, wajib("Jenis paket")]
    ]);
    const metode = $("input[name=metode]:checked");
    const radioPertama = $("input[name=metode]");
    setError(radioPertama, metode ? "" : "Pilih metode pembayaran.");
    if (!ok || !metode) {
      tampilAlert("Data belum lengkap", "Periksa kembali isian yang ditandai merah.", "error");
      return;
    }

    // Buat Delivery Order baru
    const r = hitungRingkasan();
    const nomor = "DO2026-" + String(semuaPesanan().length + 1).padStart(4, "0");
    const sekarang = new Date();
    const waktu = sekarang.toISOString().slice(0, 10) + " " + sekarang.toTimeString().slice(0, 5);
    const pesanan = {
      nomorDO: nomor,
      nama: f.namaPemesan.value.trim(),
      email: f.emailPemesan.value.trim(),
      telepon: f.telepon.value.trim(),
      alamat: f.alamat.value.trim(),
      status: "Pesanan Diterima",
      ekspedisi: dataEkspedisi.find((x) => x.kode === f.ekspedisi.value).nama,
      tanggalKirim: "-",
      paket: dataPaket.find((x) => x.kode === f.paket.value).nama,
      metode: metode.parentElement.textContent.trim(),
      total: r.total,
      items: ambilKeranjang().map((i) => {
        const b = cariBuku(i.kodeBarang);
        return { kodeBarang: b.kodeBarang, namaBarang: b.namaBarang, qty: i.qty, harga: b.harga };
      }),
      perjalanan: [{ waktu, keterangan: "Pesanan diterima sistem" }]
    };
    const daftar = ambil("pesananBaru", []);
    daftar.push(pesanan);
    simpan("pesananBaru", daftar);
    simpanKeranjang([]);

    f.reset();
    $("#emailPemesan").value = sesi.email;
    $("#infoBayar").textContent = "Pilih metode untuk melihat instruksi pembayaran.";
    renderKeranjang();
    tampilAlert(
      "Pesanan berhasil dibuat",
      `Nomor Delivery Order Anda: ${nomor}. Total pembayaran ${formatRupiah(r.total)}. Simpan nomor ini untuk melacak pengiriman.`,
      "sukses",
      { label: "Lacak pesanan", href: "tracking.html?do=" + nomor }
    );
  });
}

/* ---------- 9. Tracking (tracking.html) ---------- */
function tampilkanTracking(data) {
  const wadah = $("#hasilTracking");
  wadah.hidden = false;

  $("#tNama").textContent = data.nama;
  $("#tNomor").textContent = data.nomorDO;
  $("#tStatus").textContent = data.status;

  // Progress bar berbasis tahapan
  const idx = tahapanPengiriman.indexOf(data.status);
  const ol = $("#progress");
  ol.innerHTML = "";
  tahapanPengiriman.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t;
    if (i <= idx) li.classList.add("selesai");
    if (i === idx) { li.classList.add("sekarang"); li.setAttribute("aria-current", "step"); }
    ol.appendChild(li);
  });

  $("#tEkspedisi").textContent = data.ekspedisi;
  $("#tTanggal").textContent = formatTanggal(data.tanggalKirim);
  $("#tPaket").textContent = data.paket;
  $("#tTotal").textContent = formatRupiah(data.total);

  const ul = $("#tItems");
  ul.innerHTML = "";
  (data.items || []).forEach((it) => {
    const li = document.createElement("li");
    li.textContent = `${it.namaBarang} × ${it.qty} — ${formatRupiah(it.harga * it.qty)}`;
    ul.appendChild(li);
  });

  const tl = $("#timeline");
  tl.innerHTML = "";
  [...data.perjalanan].reverse().forEach((p) => {
    const li = document.createElement("li");
    const time = document.createElement("time");
    time.textContent = p.waktu;
    li.append(time, document.createTextNode(p.keterangan));
    tl.appendChild(li);
  });
  wadah.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initTracking() {
  if (!cekLogin()) return;
  const form = $("#formTracking");
  const input = $("#nomorDO");

  // Contoh nomor DO yang bisa diklik
  const contoh = $("#contohDO");
  semuaPesanan().slice(0, 4).forEach((p) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn-teks";
    b.textContent = p.nomorDO;
    b.addEventListener("click", () => { input.value = p.nomorDO; form.requestSubmit(); });
    contoh.appendChild(b);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = validasi([[input, (v) => (!v ? "Masukkan nomor Delivery Order." : !/^DO\d{4}-\d{4}$/i.test(v) ? "Format nomor DO: DO2026-0001" : "")]]);
    if (!ok) return;
    const data = semuaPesanan().find((p) => p.nomorDO.toLowerCase() === input.value.trim().toLowerCase());
    if (!data) {
      $("#hasilTracking").hidden = true;
      tampilAlert("Nomor DO tidak ditemukan", `Tidak ada pengiriman dengan nomor ${input.value.trim()}. Periksa kembali nomor pada bukti pemesanan.`, "error");
      return;
    }
    tampilkanTracking(data);
  });

  // Jika datang dari checkout/history: tracking.html?do=DO2026-0004
  const dariUrl = new URLSearchParams(location.search).get("do");
  if (dariUrl) { input.value = dariUrl; form.requestSubmit(); }
}

/* ---------- 10. History transaksi (history.html) ---------- */
function initHistory() {
  if (!cekLogin()) return;
  const tbody = $("#tabelHistory tbody");
  const filter = $("#filterStatus");
  isiSelect(filter, tahapanPengiriman, (t) => t, (t) => t);

  const render = () => {
    const kata = $("#cariHistory").value.trim().toLowerCase();
    const data = semuaPesanan().filter((p) =>
      (!filter.value || p.status === filter.value) &&
      (!kata || p.nomorDO.toLowerCase().includes(kata) || p.nama.toLowerCase().includes(kata))
    ).reverse();

    tbody.innerHTML = "";
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="kosong">Tidak ada transaksi yang cocok dengan pencarian.</td></tr>`;
    }
    data.forEach((p) => {
      const tr = document.createElement("tr");
      const sel = [p.nomorDO, p.nama, p.ekspedisi, formatTanggal(p.tanggalKirim), p.status];
      sel.forEach((s) => { const td = document.createElement("td"); td.textContent = s; tr.appendChild(td); });
      const tdTotal = document.createElement("td");
      tdTotal.className = "angka";
      tdTotal.textContent = formatRupiah(p.total);
      const tdAksi = document.createElement("td");
      const a = document.createElement("a");
      a.className = "btn btn-garis btn-kecil";
      a.href = "tracking.html?do=" + encodeURIComponent(p.nomorDO);
      a.textContent = "Lacak";
      tdAksi.appendChild(a);
      tr.append(tdTotal, tdAksi);
      tbody.appendChild(tr);
    });

    $("#hJumlah").textContent = data.length;
    $("#hOmzet").textContent = formatRupiah(data.reduce((t, p) => t + p.total, 0));
    $("#hSelesai").textContent = data.filter((p) => p.status === "Sampai Tujuan").length;
  };
  $("#cariHistory").addEventListener("input", render);
  filter.addEventListener("change", render);
  render();
}

/* ---------- 11. Router: jalankan init sesuai halaman ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const halaman = {
    login: initLogin,
    dashboard: initDashboard,
    stok: initStok,
    checkout: initCheckout,
    tracking: initTracking,
    history: initHistory
  };
  const init = halaman[document.body.dataset.page];
  if (init) init();
});
