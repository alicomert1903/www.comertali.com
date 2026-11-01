/**
 * ALİ CÖMERT — Blog / Rehber Statik Sayfa Üretici
 * content/posts/*.json içindeki her yazı için blog/<slug>.html üretir,
 * blog/index.html arşiv sayfasını; intelligence.html'deki "Son Yazılar" ve
 * ana sayfadaki "Rehberler" bölümlerini günceller, sitemap.xml'e URL'leri ekler.
 *
 * Bir yazının title_en + body_en alanları doluysa aynı yazı için
 * en/blog/<slug_en || slug>.html de üretilir (en/intelligence.html, en/index.html
 * ve sitemap.xml'e de EN URL'i eklenir). Bu alanlar boşsa o yazının İngilizcesi
 * sessizce atlanır — TR sayfası her durumda üretilir.
 *
 * Netlify her deploy'da bunu "node scripts/build-blog.js" ile çalıştırır.
 * Yeni bir npm bağımlılığı eklerseniz package.json + package-lock.json'ı
 * birlikte commit'leyin ki Netlify'ın npm install adımı bulabilsin.
 */

const fs = require("fs");
const path = require("path");
const { renderSiteHeader } = require("./header");
const { marked } = require("marked");

const ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "content", "posts");
const BLOG_DIR = path.join(ROOT, "blog");
const EN_BLOG_DIR = path.join(ROOT, "en", "blog");
const SITE_URL = "https://comertali.com";
const GA_ID = "G-9N16G04E0K";

const CATEGORY_LABELS_TR = {
  bolge_analizi: "Bölge Analizi",
  yatirim_rehberi: "Yatırım Rehberi",
  piyasa_raporu: "Piyasa Raporu",
  vatandaslik: "Vatandaşlık",
  kredi_masraflar: "Konut Kredisi ve Masraflar",
  hukuk: "Kira ve Hukuk",
  genel: "Genel"
};

const CATEGORY_LABELS_EN = {
  bolge_analizi: "Regional Analysis",
  yatirim_rehberi: "Investment Guide",
  piyasa_raporu: "Market Report",
  vatandaslik: "Citizenship",
  kredi_masraflar: "Mortgage & Costs",
  hukuk: "Rent & Law",
  genel: "General"
};

const UI = {
  tr: {
    readMore: "Devamını Oku",
    allPosts: "Tüm Makaleleri Gör",
    noPosts: "Henüz yayınlanmış yazı yok — yakında burada olacak.",
    consultTitle: "Bu konuda birebir danışmanlık ister misiniz?",
    consultSub: "Bölgesel analiz, uygun portföy ve vatandaşlık süreci için doğrudan iletişime geçin.",
    requestAccess: "Özel Portföye Erişin",
    backToAll: "Tüm Makalelere Dön",
    blogTitle: "Makaleler: Vatandaşlık, Konut Kredisi, Tapu ve Ankara Yatırımı | Ali Cömert",
    blogDescription: "Yatırım yoluyla Türk vatandaşlığı, konut kredisi, tapu masrafları, kira hukuku ve Ankara bölge analizi üzerine kaynaklı makaleler.",
    knowledgeBase: "Bilgi Merkezi",
    blogHeading: "Makaleler ve Güncel Bilgiler",
    home: "Ana Sayfa",
    contents: "İçindekiler",
    minRead: "dk okuma",
    updated: "Son güncelleme",
    moreGuides: "Diğer Makaleler",
    aboutAuthor: "Yazar",
    authorRole: "Ankara Gayrimenkul Danışmanı · TrueMax Gayrimenkul",
    authorBio: "Ankara'da yatırımcılar için bölge analizi, yatırım getirisi ve yatırım yoluyla vatandaşlık portföy danışmanlığı yapıyor.",
    homeGuidesKicker: "Bilgi Merkezi",
    homeGuidesTitle: "Makaleler ve Güncel Bilgiler",
    homeGuidesSub: "Vatandaşlık, konut kredisi, tapu masrafları, kira hukuku ve Ankara bölge analizleri — resmî kaynaklarıyla birlikte."
  },
  en: {
    readMore: "Read More",
    allPosts: "See All Articles",
    noPosts: "No articles published yet — check back soon.",
    consultTitle: "Would you like one-on-one advisory on this topic?",
    consultSub: "Reach out directly for regional analysis, suitable portfolio and the citizenship process.",
    requestAccess: "Request Private Access",
    backToAll: "Back to All Articles",
    blogTitle: "Articles: Citizenship, Mortgages, Title Deed Costs & Ankara Property | Ali Cömert",
    blogDescription: "Sourced articles on Turkish citizenship by investment, mortgages, property purchase costs, rental law and Ankara district analysis.",
    knowledgeBase: "Knowledge Center",
    blogHeading: "Articles & Updates",
    home: "Home",
    contents: "Contents",
    minRead: "min read",
    updated: "Last updated",
    moreGuides: "More Articles",
    aboutAuthor: "Author",
    authorRole: "Ankara Real Estate Advisor · TrueMax Real Estate",
    authorBio: "Advises investors in Ankara on district analysis, investment returns and citizenship-by-investment property portfolios.",
    homeGuidesKicker: "Knowledge Center",
    homeGuidesTitle: "Articles & Updates",
    homeGuidesSub: "Citizenship, mortgages, title deed costs, rental law and Ankara district analysis, with official sources."
  }
};

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith(".json"));
  const posts = files.map(file => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const data = JSON.parse(raw);
    const slug = file.replace(/\.json$/, "");
    return { ...data, slug };
  });
  posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return posts;
}

function hasEnglish(post) {
  return Boolean(post.title_en && post.body_en);
}

function slugFor(post, lang) {
  return lang === "en" ? (post.slug_en || post.slug) : post.slug;
}

function urlPath(post, lang) {
  return lang === "en" ? `/en/blog/${slugFor(post, "en")}.html` : `/blog/${post.slug}.html`;
}

function postTitle(post, lang) {
  return lang === "en" ? post.title_en : post.title;
}

function postExcerpt(post, lang) {
  return lang === "en" ? (post.excerpt_en || "") : (post.excerpt || "");
}

function postBody(post, lang) {
  return lang === "en" ? (post.body_en || "") : (post.body || "");
}

function fmtDate(iso, lang) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return lang === "en"
    ? d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    : d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function isoDate(iso) {
  const d = new Date(iso || 0);
  return isNaN(d) ? "" : d.toISOString().slice(0, 10);
}

function categoryLabel(key, lang) {
  const map = lang === "en" ? CATEGORY_LABELS_EN : CATEGORY_LABELS_TR;
  return map[key] || key || (lang === "en" ? "General" : "Genel");
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeEntities(text) {
  return String(text)
    .replace(/&#([0-9]+);/g, (m, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function slugify(text) {
  return String(text)
    .replace(/İ/g, "i")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .toLowerCase()
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/İ/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/** content/videos.json'daki Reel kayıtlarını ID'ye göre eşler (başlık/kapak için). */
function loadReels() {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "videos.json"), "utf8"));
    const map = {};
    for (const v of d.videos || []) {
      const m = String(v.url || "").match(/reel\/([A-Za-z0-9_-]+)/);
      if (m) map[m[1]] = v;
    }
    return map;
  } catch (e) {
    return {};
  }
}

/**
 * Yazı içinde:
 *   [[reel:ID]]      -> tıklanınca Instagram oynatıcısı yüklenen kart (tıklanmadan Meta'ya istek gitmez)
 *   [[reellink:ID]]  -> sitede oynatılamayan Reel'ler için Instagram'a bağlantı
 */
function renderShortcodes(md, lang, assetsBase) {
  const reels = loadReels();
  const isEn = lang === "en";
  const caption = id => {
    const v = reels[id] || {};
    return escapeHtml((isEn ? v.title_en : v.title) || "Instagram Reel");
  };
  return md
    .replace(/\[\[reel:([A-Za-z0-9_-]+)\]\]/g, (m, id) => {
      const v = reels[id] || {};
      const thumb = v.thumbnail ? assetsBase + v.thumbnail.replace(/^\//, "") : "";
      const img = thumb
        ? `<img src="${thumb}" alt="${caption(id)}" loading="lazy" decoding="async" style="margin:0;border-radius:0" class="w-full h-full object-cover" />`
        : "";
      const aria = isEn ? "Play the Reel" : "Reel videosunu oynat";
      const open = isEn ? "Open on Instagram" : "Instagram'da aç";
      return `\n<figure class="ig-embed mx-auto max-w-xs my-8"><button type="button" class="ig-embed-btn group relative block w-full rounded-3xl overflow-hidden border border-slate-700/60 bg-navy-dark" style="aspect-ratio:9/13" data-reel="${id}" aria-label="${aria}">${img}<span class="absolute inset-0 flex items-center justify-center bg-navy-dark/30 group-hover:bg-navy-dark/10 transition-colors"><span class="w-14 h-14 rounded-full bg-champagne/90 text-navy-dark flex items-center justify-center text-xl shadow-xl"><i class="fas fa-play ml-0.5"></i></span></span></button><figcaption class="mt-2 text-[11px] text-center text-titanium-muted">${caption(id)} &middot; Instagram Reel &middot; <a href="https://www.instagram.com/reel/${id}/" target="_blank" rel="noopener">${open}</a></figcaption></figure>\n`;
    })
    .replace(/\[\[reellink:([A-Za-z0-9_-]+)\]\]/g, (m, id) =>
      `\n<p><a href="https://www.instagram.com/reel/${id}/" target="_blank" rel="noopener"><i class="fab fa-instagram"></i> ${isEn ? "Watch the video on Instagram" : "Videoyu Instagram'da izleyin"}</a></p>\n`);
}

const IG_SCRIPT = `<script>
  document.querySelectorAll('.ig-embed-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.instagram.com/reel/' + b.dataset.reel + '/embed/';
      f.className = 'w-full rounded-3xl border border-slate-700/60';
      f.style.height = 'min(75vh, 720px)';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.setAttribute('allowfullscreen', '');
      f.title = b.getAttribute('aria-label') || 'Instagram Reel';
      b.replaceWith(f);
    });
  });
</script>`;

/** marked çıktısındaki <h2>'lere id ekler ve içindekiler listesini döndürür. */
function addHeadingIds(html) {
  const toc = [];
  const used = new Set();
  const out = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, inner) => {
    let id = slugify(inner) || "bolum";
    while (used.has(id)) id += "-2";
    used.add(id);
    toc.push({ id, text: decodeEntities(inner.replace(/<[^>]+>/g, "")) });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

function readingMinutes(md) {
  const words = String(md || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * assetsBase: gerçek site köküne ulaşmak için önek (assets/, truemax_logo.png vb.)
 * TR blog/<slug>.html için "../", EN en/blog/<slug>.html için "../../".
 */
function renderHead(title, description, ogImage, canonicalPath, assetsBase, hreflangBlock, extraMeta) {
  const isEn = canonicalPath.startsWith("/en/");
  const defaultOg = isEn ? "/og-image-en.jpg?v=2" : "/og-image.jpg?v=2";
  const og = ogImage || defaultOg;
  const ogUrl = og.startsWith("http") ? og : SITE_URL + og;
  return `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=2" />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png?v=2" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
  <meta name="theme-color" content="#0A1128" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${SITE_URL}${canonicalPath}" />
  ${hreflangBlock || ""}
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="${extraMeta ? "article" : "website"}" />
  <meta property="og:url" content="${SITE_URL}${canonicalPath}" />
  <meta property="og:site_name" content="comertali.com" />
  <meta property="og:locale" content="${isEn ? "en_US" : "tr_TR"}" />
  <meta property="og:image" content="${ogUrl}" />
  ${extraMeta || ""}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogUrl}" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            navy: { DEFAULT: '#0A1128', light: '#121E42', dark: '#050814' },
            titanium: { DEFAULT: '#E2E8F0', muted: '#94A3B8' },
            champagne: { DEFAULT: '#D4AF37', light: '#F3E5AB', dark: '#AA8C2C' }
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            serif: ['Playfair Display', 'serif'],
            cinzel: ['Cinzel', 'Playfair Display', 'serif']
          }
        }
      }
    }
  </script>
  <link rel="stylesheet" href="${assetsBase}assets/css/custom.css?v=20261101_6" />
  <!-- Google Analytics 4 (${GA_ID}) — reklam kişiselleştirme sinyalleri kapalı -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    gtag('js', new Date());
    gtag('config', '${GA_ID}', { allow_google_signals: false, allow_ad_personalization_signals: false });
  </script>
`;
}

/**
 * siteBase: yazının kendi dilindeki köküne ulaşmak için önek
 * (index.html/intelligence.html/araclar.html) — TR ve EN için "../".
 * assetsBase: gerçek site köküne ulaşmak için önek — TR "../", EN "../../".
 */
function renderHeader(lang, siteBase, assetsBase, langHref) {
  return renderSiteHeader({ lang, rootHref: siteBase, assetsBase, blogHref: "index.html", langHref, isHome: false, active: "articles" });
}

function renderFooter(lang, siteBase) {
  const t = lang === "en"
    ? {
        tagline: "Ankara Real Estate Advisor | TrueMax Real Estate",
        name: "Ali Cömert — TrueMax Real Estate",
        quickAccess: "Quick Links",
        home: "Home",
        ankara: "Ankara Analysis",
        calculators: "Title Deed & Tax Calculators",
        allPosts: "All Articles",
        contact: "Contact",
        rights: "&copy; 2026 ALİ CÖMERT - Part of TrueMax Real Estate. All rights reserved."
      }
    : {
        tagline: "Ankara Gayrimenkul Danışmanı | TrueMax Gayrimenkul",
        name: "Ali Cömert — TrueMax Gayrimenkul",
        quickAccess: "Hızlı Erişim",
        home: "Ana Sayfa",
        ankara: "Ankara Analizi",
        calculators: "Tapu & Vergi Hesaplayıcıları",
        allPosts: "Tüm Makaleler",
        contact: "İletişim",
        rights: "&copy; 2026 ALİ CÖMERT - TrueMax Gayrimenkul Bünyesinde. Tüm hakları saklıdır."
      };

  return `  <footer class="bg-navy-dark border-t border-slate-800/80 pt-14 sm:pt-16 pb-16 text-xs text-titanium-muted font-sans">
    <div class="max-w-7xl mx-auto pl-4 pr-16 sm:px-6 lg:px-8">
      <div class="pb-8 sm:pb-10 mb-10 sm:mb-12 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <span class="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-champagne font-cinzel block">${t.tagline}</span>
          <h3 class="font-cinzel text-lg sm:text-2xl font-bold text-titanium mt-1">${t.name}</h3>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-800/60">
        <div class="space-y-3">
          <h4 class="font-cinzel font-bold text-titanium text-sm uppercase tracking-wider">${t.quickAccess}</h4>
          <ul class="space-y-2">
            <li><a href="${siteBase}index.html" class="hover:text-champagne transition-colors">${t.home}</a></li>
            <li><a href="${siteBase}intelligence.html" class="hover:text-champagne transition-colors">${t.ankara}</a></li>
            <li><a href="${siteBase}araclar.html" class="hover:text-champagne transition-colors">${t.calculators}</a></li>
            <li><a href="index.html" class="hover:text-champagne transition-colors">${t.allPosts}</a></li>
          </ul>
        </div>
        <div class="flex items-center space-x-3 text-sm text-titanium">
          <a href="https://www.instagram.com/alicomert.realestate" target="_blank" rel="noopener" aria-label="Instagram" class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-champagne hover:text-navy-dark transition-colors"><i class="fab fa-instagram"></i></a>
          <a href="https://www.linkedin.com/in/ali-cömert-27b083380" target="_blank" rel="noopener" aria-label="LinkedIn" class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-champagne hover:text-navy-dark transition-colors"><i class="fab fa-linkedin-in"></i></a>
          <a href="https://wa.me/905322384039" target="_blank" rel="noopener" aria-label="WhatsApp" class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-champagne hover:text-navy-dark transition-colors"><i class="fab fa-whatsapp"></i></a>
        </div>
        <div class="space-y-3.5">
          <h4 class="font-cinzel font-bold text-titanium text-sm uppercase tracking-wider">${t.contact}</h4>
          <a href="tel:+905322384039" class="font-bold text-champagne text-base hover:underline block">+90 532 238 40 39</a>
          <p class="text-titanium">info@comertali.com</p>
        </div>
      </div>
      <div class="pt-8 text-[11px] text-slate-500 text-center sm:text-left">
        <p>${t.rights}</p>
      </div>
    </div>
  </footer>`;
}

function articleSchema(post, lang, canonicalPath) {
  const isEn = lang === "en";
  const homeUrl = isEn ? `${SITE_URL}/en/` : `${SITE_URL}/`;
  const t = UI[lang];
  const image = post.cover_image
    ? (post.cover_image.startsWith("http") ? post.cover_image : SITE_URL + post.cover_image)
    : SITE_URL + (isEn ? "/og-image-en.jpg?v=2" : "/og-image.jpg?v=2");
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": postTitle(post, lang),
    "description": postExcerpt(post, lang) || postTitle(post, lang),
    "inLanguage": lang,
    "datePublished": post.date || "",
    "dateModified": post.updated || post.date || "",
    "image": [image],
    "author": { "@type": "Person", "@id": `${homeUrl}#person`, "name": "Ali Cömert", "url": homeUrl },
    "publisher": {
      "@type": "Organization",
      "name": isEn ? "TrueMax Real Estate" : "TrueMax Gayrimenkul",
      "url": "https://truemaxgayrimenkul.com",
      "logo": { "@type": "ImageObject", "url": SITE_URL + "/assets/images/ali-comert-logo-256.png" }
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": SITE_URL + canonicalPath }
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": t.home, "item": homeUrl },
      { "@type": "ListItem", "position": 2, "name": t.knowledgeBase, "item": SITE_URL + (isEn ? "/en/blog/" : "/blog/") },
      { "@type": "ListItem", "position": 3, "name": postTitle(post, lang), "item": SITE_URL + canonicalPath }
    ]
  };
  return `<script type="application/ld+json">${JSON.stringify(article)}</script>
  <script type="application/ld+json">${JSON.stringify(crumbs)}</script>`;
}

/**
 * rootPrefix: çağıran sayfadan gerçek site köküne ulaşmak için önek (görseller ve bağlantılar için).
 */
function renderPostCard(post, lang, rootPrefix) {
  const title = postTitle(post, lang);
  const excerpt = postExcerpt(post, lang);
  const t = UI[lang];
  const img = post.cover_image
    ? `<img src="${rootPrefix}${post.cover_image.replace(/^\//, "")}" alt="${escapeHtml(title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />`
    : `<div class="w-full h-full bg-gradient-to-br from-navy-light to-navy-dark flex items-center justify-center text-champagne/50 text-4xl"><i class="fas ${post.category === "vatandaslik" ? "fa-passport" : "fa-newspaper"}"></i></div>`;
  return `
        <a href="${rootPrefix}${urlPath(post, lang).replace(/^\//, "")}" class="glass-panel rounded-3xl overflow-hidden border border-slate-700/60 hover:border-champagne/60 transition-all duration-300 flex flex-col group">
          <div class="relative aspect-video bg-navy-dark overflow-hidden">${img}</div>
          <div class="p-5 flex flex-col flex-grow">
            <span class="text-[10px] uppercase tracking-widest text-champagne font-bold font-cinzel mb-2">${escapeHtml(categoryLabel(post.category, lang))} &middot; ${fmtDate(post.updated || post.date, lang)}</span>
            <h3 class="font-cinzel text-sm sm:text-base font-bold text-titanium leading-snug">${escapeHtml(title)}</h3>
            <p class="text-xs text-titanium-muted mt-2 leading-relaxed font-sans flex-grow">${escapeHtml(excerpt)}</p>
            <span class="mt-4 inline-flex items-center text-xs font-bold text-champagne">${t.readMore} <i class="fas fa-arrow-right ml-2 text-[10px]"></i></span>
          </div>
        </a>`;
}

function renderAuthorBox(lang, assetsBase, siteBase) {
  const t = UI[lang];
  return `
      <aside class="mt-12 glass-panel rounded-3xl p-5 sm:p-6 border border-slate-700/60 flex items-start gap-4 sm:gap-5">
        <img src="${assetsBase}ali-comert-ankara-stratejist.jpg" alt="Ali Cömert" width="64" height="64" loading="lazy" decoding="async" class="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover object-top border border-champagne/50 flex-shrink-0" />
        <div>
          <span class="text-[10px] uppercase tracking-widest text-champagne font-bold font-cinzel">${t.aboutAuthor}</span>
          <h3 class="font-cinzel text-base sm:text-lg font-bold text-titanium leading-tight"><a href="${siteBase}index.html" class="hover:text-champagne transition-colors">Ali Cömert</a></h3>
          <p class="text-[11px] text-champagne/80 mt-0.5">${t.authorRole}</p>
          <p class="text-xs text-titanium-muted mt-2 leading-relaxed">${t.authorBio}</p>
          <p class="mt-2.5 flex items-center gap-3 text-sm">
            <a href="https://www.linkedin.com/in/ali-cömert-27b083380" target="_blank" rel="noopener" aria-label="LinkedIn" class="text-titanium-muted hover:text-champagne transition-colors"><i class="fab fa-linkedin-in"></i></a>
            <a href="https://www.instagram.com/alicomert.realestate" target="_blank" rel="noopener" aria-label="Instagram" class="text-titanium-muted hover:text-champagne transition-colors"><i class="fab fa-instagram"></i></a>
          </p>
        </div>
      </aside>`;
}

function renderPostPage(post, lang, allPosts) {
  const t = UI[lang];
  const isEn = lang === "en";
  const canonicalPath = urlPath(post, lang);
  const title = (isEn ? post.seo_title_en : post.seo_title) || `${postTitle(post, lang)} | Ali Cömert`;
  const description = postExcerpt(post, lang) || postTitle(post, lang);
  const md = postBody(post, lang);
  const { html: bodyHtml, toc } = addHeadingIds(marked.parse(renderShortcodes(md, lang, isEn ? "../../" : "../")));
  const assetsBase = isEn ? "../../" : "../";
  const siteBase = "../";
  const published = post.date || "";
  const modified = post.updated || post.date || "";

  const hreflangBlock = hasEnglish(post)
    ? `<link rel="alternate" hreflang="tr" href="${SITE_URL}${urlPath(post, "tr")}" />
  <link rel="alternate" hreflang="en" href="${SITE_URL}${urlPath(post, "en")}" />
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${urlPath(post, "tr")}" />`
    : `<link rel="alternate" hreflang="tr" href="${SITE_URL}${urlPath(post, "tr")}" />
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${urlPath(post, "tr")}" />`;

  const extraMeta = `<meta property="article:published_time" content="${published}" />
  <meta property="article:modified_time" content="${modified}" />
  <meta property="article:author" content="Ali Cömert" />`;

  const coverBlock = post.cover_image
    ? `<div class="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-10"><img src="${assetsBase}${post.cover_image.replace(/^\//, "")}" alt="${escapeHtml(postTitle(post, lang))}" class="w-full h-auto object-cover" /></div>`
    : "";

  const tocBlock = toc.length >= 3
    ? `<nav aria-label="${t.contents}" class="mb-10 glass-panel rounded-2xl p-5 border border-slate-700/60">
        <p class="font-cinzel text-sm font-bold text-titanium mb-3">${t.contents}</p>
        <ol class="text-xs sm:text-sm text-titanium-muted space-y-1.5 list-decimal list-inside">
          ${toc.map(h => `<li><a href="#${h.id}" class="hover:text-champagne transition-colors">${escapeHtml(h.text)}</a></li>`).join("\n          ")}
        </ol>
      </nav>`
    : "";

  const related = allPosts
    .filter(p => p.slug !== post.slug && (isEn ? hasEnglish(p) : true))
    .slice(0, 3);
  const relatedBlock = related.length
    ? `
      <section class="mt-14">
        <h2 class="font-cinzel text-lg sm:text-xl font-bold text-titanium mb-5">${t.moreGuides}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">${related.map(p => renderPostCard(p, lang, assetsBase)).join("\n")}</div>
      </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}" class="scroll-smooth">
<head>
${renderHead(title, description, post.cover_image, canonicalPath, assetsBase, hreflangBlock, extraMeta)}
  ${articleSchema(post, lang, canonicalPath)}
</head>
<body class="bg-navy text-titanium antialiased selection:bg-champagne selection:text-navy-dark">
${renderHeader(lang, siteBase, assetsBase, isEn ? "../../blog/" + post.slug + ".html" : (hasEnglish(post) ? "../en/blog/" + slugFor(post, "en") + ".html" : "../en/blog/"))}
  <main class="pt-28 sm:pt-36 pb-20">
    <article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav aria-label="breadcrumb" class="text-[11px] text-titanium-muted mb-5">
        <a href="${siteBase}index.html" class="hover:text-champagne transition-colors">${t.home}</a>
        <span class="mx-1.5">/</span>
        <a href="index.html" class="hover:text-champagne transition-colors">${t.knowledgeBase}</a>
      </nav>
      <div class="mb-8">
        <span class="text-xs uppercase tracking-widest text-champagne font-bold font-cinzel">${escapeHtml(categoryLabel(post.category, lang))}</span>
        <h1 class="font-cinzel text-2xl sm:text-4xl font-bold text-titanium tracking-tight mt-3 leading-tight">${escapeHtml(postTitle(post, lang))}</h1>
        <p class="mt-4 text-xs text-titanium-muted">
          <span>Ali Cömert</span>
          <span class="mx-1.5">&middot;</span>
          <time datetime="${isoDate(modified)}">${t.updated}: ${fmtDate(modified, lang)}</time>
          <span class="mx-1.5">&middot;</span>
          <span>${readingMinutes(md)} ${t.minRead}</span>
        </p>
      </div>
      ${coverBlock}
      ${tocBlock}
      <div class="prose-blog text-sm sm:text-base text-titanium-muted leading-relaxed font-sans space-y-5">
        ${bodyHtml}
      </div>
      ${/\[\[reel:/.test(md) ? IG_SCRIPT : ""}
      <div class="mt-14 glass-panel-gold rounded-3xl p-6 sm:p-8 border border-champagne/40 text-center">
        <h3 class="font-cinzel text-lg sm:text-xl font-bold text-titanium mb-2">${t.consultTitle}</h3>
        <p class="text-xs sm:text-sm text-titanium-muted mb-5">${t.consultSub}</p>
        <a href="${siteBase}index.html#gatekeeping" class="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-gradient-to-r from-champagne to-champagne-dark text-navy-dark font-bold text-sm shadow-xl hover:brightness-105 transition-all font-cinzel tracking-wide">
          ${t.requestAccess} <i class="fas fa-arrow-right ml-3 text-xs"></i>
        </a>
      </div>
${renderAuthorBox(lang, assetsBase, siteBase)}
${relatedBlock}
      <div class="mt-8">
        <a href="index.html" class="text-xs text-champagne hover:underline"><i class="fas fa-arrow-left mr-1.5"></i>${t.backToAll}</a>
      </div>
    </article>
  </main>
${renderFooter(lang, siteBase)}
</body>
</html>
`;
}

function renderBlogIndex(posts, lang) {
  const t = UI[lang];
  const isEn = lang === "en";
  const assetsBase = isEn ? "../../" : "../";
  const siteBase = "../";
  const canonicalPath = isEn ? "/en/blog/" : "/blog/";

  const hreflangBlock = `<link rel="alternate" hreflang="tr" href="${SITE_URL}/blog/" />
  <link rel="alternate" hreflang="en" href="${SITE_URL}/en/blog/" />
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/blog/" />`;

  const cards = posts.map(p => renderPostCard(p, lang, assetsBase).replace("<a ", `<a data-cat="${p.category}" `)).join("\n");
  const cats = [...new Set(posts.map(p => p.category))];
  const chip = "px-3.5 py-1.5 rounded-full border border-slate-700 text-xs font-semibold text-titanium-muted hover:border-champagne/60 hover:text-champagne transition-colors";
  const chips = cats.length > 1
    ? `<div id="cat-filter" class="flex flex-wrap justify-center gap-2 mb-10 sm:mb-12"><button type="button" data-filter="all" class="${chip} border-champagne text-champagne">${isEn ? "All" : "Tümü"}</button>${cats.map(c => `<button type="button" data-filter="${c}" class="${chip}">${escapeHtml(categoryLabel(c, lang))}</button>`).join("")}</div>`
    : "";
  const filterScript = cats.length > 1
    ? `<script>(function(){var bar=document.getElementById("cat-filter");if(!bar)return;bar.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var f=b.getAttribute("data-filter");bar.querySelectorAll("button").forEach(function(x){x.classList.toggle("border-champagne",x===b);x.classList.toggle("text-champagne",x===b);});document.querySelectorAll("a[data-cat]").forEach(function(a){a.style.display=(f==="all"||a.getAttribute("data-cat")===f)?"":"none";});});})();</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}" class="scroll-smooth">
<head>
${renderHead(t.blogTitle, t.blogDescription, null, canonicalPath, assetsBase, hreflangBlock)}
</head>
<body class="bg-navy text-titanium antialiased selection:bg-champagne selection:text-navy-dark">
${renderHeader(lang, siteBase, assetsBase, isEn ? "../../blog/" : "../en/blog/")}
  <main class="pt-28 sm:pt-36 pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
        <span class="text-xs uppercase tracking-widest text-champagne font-bold block mb-2 font-cinzel">${t.knowledgeBase}</span>
        <h1 class="font-cinzel text-2xl sm:text-5xl font-bold text-titanium tracking-tight">${t.blogHeading}</h1>
      </div>
      ${chips}
      ${posts.length
        ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">${cards}</div>`
        : `<p class="text-center text-titanium-muted text-sm">${t.noPosts}</p>`}
    </div>
  </main>
${renderFooter(lang, siteBase)}
  ${filterScript}
</body>
</html>
`;
}

function injectBetween(filePath, startMarker, endMarker, content) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, "utf8");
  if (!html.includes(startMarker) || !html.includes(endMarker)) return;
  const block = `${startMarker}${content}${endMarker}`;
  html = html.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), () => block);
  fs.writeFileSync(filePath, html, "utf8");
}

function updateIntelligencePage(posts, lang) {
  const filePath = lang === "en"
    ? path.join(ROOT, "en", "intelligence.html")
    : path.join(ROOT, "intelligence.html");
  const t = UI[lang];
  // intelligence.html (TR) kökte, en/intelligence.html kendi dil kökünde (en/) oturur.
  const rootPrefix = lang === "en" ? "../" : "";
  const latest = posts.slice(0, 3);
  const injected = latest.length
    ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">${latest.map(p => renderPostCard(p, lang, rootPrefix)).join("\n")}</div>
        <div class="text-center mt-10"><a href="blog/index.html" class="inline-flex items-center text-champagne font-bold text-sm hover:underline">${t.allPosts} <i class="fas fa-arrow-right ml-2 text-xs"></i></a></div>`
    : `<p class="text-center text-titanium-muted text-sm">${t.noPosts}</p>`;
  injectBetween(filePath, "<!-- BLOG_POSTS_INJECT_START -->", "<!-- BLOG_POSTS_INJECT_END -->", injected);
}

/** Ana sayfadaki "Rehberler" bölümü: yazı varsa tüm bölüm, yoksa hiçbir şey. */
function updateHomeGuides(posts, lang) {
  const filePath = lang === "en" ? path.join(ROOT, "en", "index.html") : path.join(ROOT, "index.html");
  const t = UI[lang];
  const rootPrefix = lang === "en" ? "../" : "";
  const latest = posts.slice(0, 6);
  const section = latest.length
    ? `
  <section id="rehberler" class="py-20 sm:py-24 bg-navy relative border-y border-slate-800/80">
    <div class="max-w-7xl mx-auto pl-4 pr-16 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-12 sm:mb-14 reveal-on-scroll">
        <span class="text-xs uppercase tracking-widest text-champagne font-bold block mb-2 font-cinzel">${t.homeGuidesKicker}</span>
        <h2 class="font-cinzel text-2xl sm:text-4xl font-bold text-titanium tracking-tight">${t.homeGuidesTitle}</h2>
        <p class="text-xs sm:text-base text-titanium-muted mt-3 sm:mt-4 leading-relaxed font-sans">${t.homeGuidesSub}</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 reveal-on-scroll">${latest.map(p => renderPostCard(p, lang, rootPrefix)).join("\n")}</div>
      <div class="text-center mt-10"><a href="blog/index.html" class="inline-flex items-center text-champagne font-bold text-sm hover:underline">${t.allPosts} <i class="fas fa-arrow-right ml-2 text-xs"></i></a></div>
    </div>
  </section>
  `
    : "";
  injectBetween(filePath, "<!-- HOME_GUIDES_START -->", "<!-- HOME_GUIDES_END -->", section);
}

function updateSitemap(posts, enPosts) {
  const filePath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(filePath)) return;
  let xml = fs.readFileSync(filePath, "utf8");

  const alternates = p => {
    const tr = SITE_URL + urlPath(p, "tr");
    const lines = [`    <xhtml:link rel="alternate" hreflang="tr" href="${tr}"/>`];
    if (hasEnglish(p)) lines.push(`    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL + urlPath(p, "en")}"/>`);
    lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${tr}"/>`);
    return lines.join("\n");
  };
  const lastmod = p => isoDate(p.updated || p.date);

  const trStart = "<!-- BLOG_URLS_START -->";
  const trEnd = "<!-- BLOG_URLS_END -->";
  if (xml.includes(trStart)) {
    const entries = posts.map(p => `  <url>
    <loc>${SITE_URL + urlPath(p, "tr")}</loc>
    <lastmod>${lastmod(p)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
${alternates(p)}
  </url>`).join("\n");
    xml = xml.replace(new RegExp(`${trStart}[\\s\\S]*?${trEnd}`), () => `${trStart}\n${entries}\n  ${trEnd}`);
  }

  const enStart = "<!-- EN_BLOG_URLS_START -->";
  const enEnd = "<!-- EN_BLOG_URLS_END -->";
  if (xml.includes(enStart)) {
    const entries = enPosts.map(p => `  <url>
    <loc>${SITE_URL + urlPath(p, "en")}</loc>
    <lastmod>${lastmod(p)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
${alternates(p)}
  </url>`).join("\n");
    xml = xml.replace(new RegExp(`${enStart}[\\s\\S]*?${enEnd}`), () => `${enStart}\n${entries}\n  ${enEnd}`);
  }

  fs.writeFileSync(filePath, xml, "utf8");
}

function main() {
  const posts = loadPosts().filter(p => p.title);
  const enPosts = posts.filter(hasEnglish);

  // Silinen yazıların eski sayfaları kalmasın: üretilen dizinleri her derlemede sıfırla.
  for (const dir of [BLOG_DIR, EN_BLOG_DIR]) {
    if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith(".html")) fs.unlinkSync(path.join(dir, f));
  }

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  for (const post of posts) {
    fs.writeFileSync(path.join(BLOG_DIR, `${post.slug}.html`), renderPostPage(post, "tr", posts), "utf8");
  }
  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), renderBlogIndex(posts, "tr"), "utf8");

  if (enPosts.length) {
    fs.mkdirSync(EN_BLOG_DIR, { recursive: true });
    for (const post of enPosts) {
      fs.writeFileSync(path.join(EN_BLOG_DIR, `${slugFor(post, "en")}.html`), renderPostPage(post, "en", enPosts), "utf8");
    }
    fs.writeFileSync(path.join(EN_BLOG_DIR, "index.html"), renderBlogIndex(enPosts, "en"), "utf8");
  }

  updateIntelligencePage(posts, "tr");
  updateIntelligencePage(enPosts, "en");
  updateHomeGuides(posts, "tr");
  updateHomeGuides(enPosts, "en");
  updateSitemap(posts, enPosts);

  console.log(`[build-blog] ${posts.length} TR yazı, ${enPosts.length} EN yazı işlendi.`);
}

main();
