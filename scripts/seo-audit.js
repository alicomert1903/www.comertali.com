// Teknik SEO denetimi: sitemap.xml'deki her adresi tarar (durum, başlık, açıklama, canonical, hreflang, JSON-LD, H1, alt metin).
// Kullanım: node scripts/seo-audit.js   (canlı siteyi okur; yalnızca okuma yapar)
const SITE = "https://comertali.com";

(async () => {
  const xml = (await (await fetch(SITE + "/sitemap.xml")).text()).replace(/<!--[\s\S]*?-->/g, "");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log("Sitemap URL sayısı:", urls.length);

  const rows = [];
  const titles = {};
  for (const u of urls) {
    const r = await fetch(u, { redirect: "manual" });
    const html = r.status === 200 ? await r.text() : "";
    const g = re => (html.match(re) || [])[1] || "";
    const title = g(/<title>([^<]*)<\/title>/);
    const desc = g(/<meta name="description" content="([^"]*)"/);
    const canon = g(/<link rel="canonical" href="([^"]*)"/);
    let ld = 0, ldBad = 0;
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { ld++; try { JSON.parse(m[1]); } catch (e) { ldBad++; } }
    (titles[title] = titles[title] || []).push(u);
    rows.push({
      url: u.replace(SITE, "") || "/", durum: r.status, baslik: title.length, aciklama: desc.length,
      canonical: canon === u ? "ok" : (canon ? "farkli" : "YOK"), h1: (html.match(/<h1[\s>]/g) || []).length,
      hreflang: (html.match(/hreflang="/g) || []).length, jsonld: ld, jsonldHata: ldBad,
      altsiz: (html.match(/<img(?![^>]*\balt=)[^>]*>/g) || []).length, og: /property="og:image"/.test(html)
    });
  }

  const sorunlu = rows.filter(r => r.durum !== 200 || r.baslik < 20 || r.baslik > 70 || r.aciklama < 70 || r.aciklama > 165 ||
    r.canonical !== "ok" || r.h1 !== 1 || r.jsonldHata || !r.og || r.altsiz);
  const tekrar = Object.entries(titles).filter(([t, v]) => t && v.length > 1);
  console.log("Sorunlu sayfa:", sorunlu.length, "| tekrarlı başlık:", tekrar.length);
  sorunlu.forEach(s => console.log(" -", JSON.stringify(s)));
  tekrar.forEach(([t, v]) => console.log(" - tekrar:", t, v.join(", ")));
  if (!sorunlu.length && !tekrar.length) console.log("Tüm sayfalar temiz.");
})();
