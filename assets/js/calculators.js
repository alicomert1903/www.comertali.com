/**
 * ALİ CÖMERT — Tapu & Vergi Hesaplayıcıları (araclar.html)
 * Tapu harcı, değer artış kazancı vergisi ve hisseli tapu pay hesaplamaları.
 * Değer artış kazancı vergisi hesaplaması basitleştirilmiştir (Yİ-ÜFE endekslemesi
 * içermez) — bilinçli olarak muhafazakar/yüksek tahmin verir, tam tersi değil.
 */

function fmtTL(n) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL";
}

document.addEventListener("DOMContentLoaded", () => {
  initTapuHarciCalc();
  initDegerArtisCalc();
  initHisseliTapuCalc();
});

/* ---------- 1. Tapu Harcı ---------- */
function initTapuHarciCalc() {
  const form = document.getElementById("tapuHarciForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const bedel = parseFloat(document.getElementById("tapuBedel").value);
    if (!bedel || bedel <= 0) return;

    const toplam = bedel * 0.04;
    const pay = bedel * 0.02;

    document.getElementById("tapuSonucToplam").textContent = fmtTL(toplam);
    document.getElementById("tapuSonucAlici").textContent = fmtTL(pay);
    document.getElementById("tapuSonucSatici").textContent = fmtTL(pay);
    document.getElementById("tapuSonuc").classList.remove("hidden");
  });
}

/* ---------- 2. Değer Artış Kazancı Vergisi ---------- */

// 2026 Gelir Vergisi Tarifesi (GİB resmi, "diğer gelirler" sütunu — gayrimenkul
// değer artış kazancına uygulanan tarife). Kaynak: cdn.gib.gov.tr güncel tarife.
const GELIR_VERGISI_DILIMLERI_2026 = [
  { sinirAlt: 0, sinirUst: 190000, oran: 0.15, oncekiVergi: 0 },
  { sinirAlt: 190000, sinirUst: 400000, oran: 0.20, oncekiVergi: 28500 },
  { sinirAlt: 400000, sinirUst: 1000000, oran: 0.27, oncekiVergi: 70500 },
  { sinirAlt: 1000000, sinirUst: 5300000, oran: 0.35, oncekiVergi: 232500 },
  { sinirAlt: 5300000, sinirUst: Infinity, oran: 0.40, oncekiVergi: 1737500 }
];
const DEGER_ARTIS_ISTISNA_2026 = 150000;

function gelirVergisiHesapla(matrah) {
  if (matrah <= 0) return 0;
  const dilim = GELIR_VERGISI_DILIMLERI_2026.find(d => matrah <= d.sinirUst);
  return dilim.oncekiVergi + (matrah - dilim.sinirAlt) * dilim.oran;
}

function initDegerArtisCalc() {
  const form = document.getElementById("degerArtisForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const alisTarihi = new Date(document.getElementById("alisTarihi").value);
    const satisTarihi = new Date(document.getElementById("satisTarihi").value);
    const alisBedeli = parseFloat(document.getElementById("alisBedeli").value);
    const satisBedeli = parseFloat(document.getElementById("satisBedeli").value);

    if (!alisBedeli || !satisBedeli || isNaN(alisTarihi) || isNaN(satisTarihi)) return;

    const istisnaSonuc = document.getElementById("degerArtisIstisna");
    const hesapSonuc = document.getElementById("degerArtisSonuc");

    const besYilSonra = new Date(alisTarihi);
    besYilSonra.setFullYear(besYilSonra.getFullYear() + 5);

    if (satisTarihi >= besYilSonra) {
      istisnaSonuc.classList.remove("hidden");
      hesapSonuc.classList.add("hidden");
      return;
    }

    istisnaSonuc.classList.add("hidden");

    const safiKazanc = Math.max(0, satisBedeli - alisBedeli);
    const matrah = Math.max(0, safiKazanc - DEGER_ARTIS_ISTISNA_2026);
    const vergi = gelirVergisiHesapla(matrah);

    document.getElementById("degerArtisSafiKazanc").textContent = fmtTL(safiKazanc);
    document.getElementById("degerArtisMatrah").textContent = fmtTL(matrah);
    document.getElementById("degerArtisVergi").textContent = fmtTL(vergi);
    hesapSonuc.classList.remove("hidden");
  });
}

/* ---------- 3. Hisseli Tapu Pay Hesaplama ---------- */
function initHisseliTapuCalc() {
  const form = document.getElementById("hisseliTapuForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const satisBedeli = parseFloat(document.getElementById("hisseSatisBedeli").value);
    const toplamHisse = parseFloat(document.getElementById("hisseToplam").value);
    const kisininHissesi = parseFloat(document.getElementById("hisseKisi").value);

    if (!satisBedeli || !toplamHisse || toplamHisse <= 0 || isNaN(kisininHissesi)) return;

    const tutar = (kisininHissesi / toplamHisse) * satisBedeli;

    document.getElementById("hisseliSonucTutar").textContent = fmtTL(tutar);
    document.getElementById("hisseliSonuc").classList.remove("hidden");
  });
}
