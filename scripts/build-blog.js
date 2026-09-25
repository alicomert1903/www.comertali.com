/**
 * ALİ CÖMERT — Blog / Bölgesel Analiz Statik Sayfa Üretici
 * content/posts/*.json içindeki her yazı için blog/<slug>.html üretir,
 * blog/index.html arşiv sayfasını ve intelligence.html'deki "Son Yazılar"
 * bölümünü günceller, sitemap.xml'e yazı URL'lerini ekler.
 *
 * Bir yazının title_en + body_en alanları doluysa, aynı yazı için
 * en/blog/<slug>.html de üretilir (en/intelligence.html ve sitemap.xml'e
 * de EN URL'i eklenir). Bu alanlar boşsa o yazının İngilizcesi
 * sessizce atlanır — TR sayfası her durumda üretilir.
 *
 * Netlify her deploy'da bunu "node scripts/build-blog.js" ile çalıştırır.
 * Yeni bir npm bağımlılığı eklerseniz package.json + package-lock.json'ı
 * birlikte commit'leyin ki Netlify'ın npm install adımı bulabilsin.
 */

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "content", "posts");
const BLOG_DIR = path.join(ROOT, "blog");
const EN_BLOG_DIR = path.join(ROOT, "en", "blog");
const SITE_URL = "https://comertali.com";

const CATEGORY_LABELS_TR = {
  bolge_analizi: "Bölge Analizi",
  yatirim_rehberi: "Yatırım Rehberi",
  piyasa_raporu: "Piyasa Raporu",
  vatandaslik: "Vatandaşlık",
  genel: "Genel"
};

const CATEGORY_LABELS_EN = {
  bolge_analizi: "Regional Analysis",
  yatirim_rehberi: "Investment Guide",
  piyasa_raporu: "Market Report",
  vatandaslik: "Citizenship",
  genel: "General"
};

const UI = {
  tr: {
    readMore: "Devamını Oku",
    allPosts: "Tüm Yazıları Gör",
    noPosts: "Henüz yayınlanmış yazı yok — yakında burada olacak.",
    consultTitle: "Bu konuda birebir danışmanlık ister misiniz?",
    consultSub: "Bölgesel analiz ve yatırım fırsatları için doğrudan iletişime geçin.",
    requestAccess: "Özel Portföye Erişin",
    backToAll: "Tüm Yazılara Dön",
    blogTitle: "Bölgesel Analiz & Blog | Ali Cömert",
    blogDescription: "Ankara gayrimenkul piyasası, vatandaşlık süreçleri ve yatırım rehberleri üzerine yazılar.",
    knowledgeBase: "GDOS Knowledge Base",
    blogHeading: "Bölgesel Analiz & Blog"
  },
  en: {
    readMore: "Read More",
    allPosts: "See All Articles",
    noPosts: "No articles published yet — check back soon.",
    consultTitle: "Would you like one-on-one advisory on this topic?",
    consultSub: "Reach out directly for regional analysis and investment opportunities.",
    requestAccess: "Request Private Access",
    backToAll: "Back to All Articles",
    blogTitle: "Regional Analysis & Blog | Ali Cömert",
    blogDescription: "Articles on the Ankara real estate market, citizenship processes and investment guides.",
    knowledgeBase: "GDOS Knowledge Base",
    blogHeading: "Regional Analysis & Blog"
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

/**
 * assetsBase: gerçek site köküne ulaşmak için önek (assets/, truemax_logo.png vb.)
 * TR blog/<slug>.html için "../", EN en/blog/<slug>.html için "../../".
 */
function renderHead(title, description, ogImage, canonicalPath, assetsBase, hreflangBlock) {
  return `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${SITE_URL}${canonicalPath}" />
  ${hreflangBlock || ""}
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${SITE_URL}${canonicalPath}" />
  ${ogImage ? `<meta property="og:image" content="${ogImage.startsWith("http") ? ogImage : SITE_URL + ogImage}" />` : ""}

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
  <link rel="stylesheet" href="${assetsBase}assets/css/custom.css" />`;
}

/**
 * siteBase: yazının kendi dilindeki köküne ulaşmak için önek
 * (index.html/intelligence.html/araclar.html) — TR ve EN için "../".
 * assetsBase: gerçek site köküne ulaşmak için önek — TR "../", EN "../../".
 */
function renderHeader(lang, siteBase, assetsBase) {
  const t = lang === "en"
    ? { brand: "Part of TrueMax Real Estate", access: "Access", citizenship: "Citizenship", ankara: "Ankara Analysis", faq: "FAQ", portfolio: "Portfolio", calculators: "Calculators", phone: "+90 532 238 40 39", cta: "Request Private Access" }
    : { brand: "TrueMax Gayrimenkul Bünyesinde", access: "Erişim", citizenship: "Vatandaşlık", ankara: "Ankara Analizi", faq: "S.S.S.", portfolio: "Portföy", calculators: "Hesaplayıcılar", phone: "+90 532 238 40 39", cta: "Özel Portföye Erişin" };

  return `  <header class="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-700/40 transition-all duration-300">
    <div class="max-w-7xl mx-auto pl-4 pr-16 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 lg:gap-6">
      <div class="flex items-center justify-between w-full lg:w-auto gap-3">
        <a href="${siteBase}index.html" class="flex items-center space-x-2 sm:space-x-3.5 group flex-shrink-0">
          <img src="${assetsBase}truemax_logo.png" onerror="this.onerror=null; this.src='${assetsBase}logo.png';" alt="TrueMax" class="h-8 sm:h-11 w-auto object-contain drop-shadow transition-transform duration-300 group-hover:scale-105" />
          <div>
            <span class="font-cinzel text-base sm:text-2xl font-bold tracking-wider text-titanium block leading-none">ALİ CÖMERT</span>
            <span class="text-[9px] sm:text-[10px] tracking-widest text-champagne uppercase font-semibold mt-1 block">${t.brand}</span>
          </div>
        </a>
        <div class="flex items-center space-x-1.5 sm:space-x-2.5 lg:hidden flex-shrink-0">
          <a href="${siteBase}index.html#gatekeeping" class="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-champagne via-[#E6CA65] to-champagne-dark text-navy-dark font-bold text-xs shadow-lg font-cinzel tracking-wide">
            <i class="fas fa-lock text-[11px] mr-1.5"></i><span>${t.access}</span>
          </a>
        </div>
      </div>
      <nav class="flex flex-row items-center overflow-x-auto whitespace-nowrap space-x-6 sm:space-x-8 lg:space-x-2 text-xs sm:text-sm font-semibold lg:tracking-normal tracking-wide py-1.5 pt-2 border-t border-slate-800/60 lg:border-t-0 no-scrollbar lg:flex-1 lg:min-w-0">
        <a href="${siteBase}index.html#roadmap" class="text-titanium hover:text-champagne transition-colors flex items-center py-1 flex-shrink-0"><i class="fas fa-passport text-xs mr-2 text-champagne"></i><span>${t.citizenship}</span></a>
        <a href="${siteBase}intelligence.html" class="text-champagne flex items-center py-1 flex-shrink-0 border-b border-champagne pb-0.5"><i class="fas fa-chart-line text-xs mr-2 text-champagne"></i><span>${t.ankara}</span></a>
        <a href="${siteBase}index.html#faq" class="text-titanium hover:text-champagne transition-colors flex items-center py-1 flex-shrink-0"><i class="fas fa-question-circle text-xs mr-2 text-champagne"></i><span>${t.faq}</span></a>
        <a href="${siteBase}index.html#portfolio-showcase" class="text-titanium hover:text-champagne transition-colors flex items-center py-1 flex-shrink-0"><i class="fas fa-layer-group text-xs mr-2 text-champagne"></i><span>${t.portfolio}</span></a>
        <a href="${siteBase}araclar.html" class="text-titanium hover:text-champagne transition-colors flex items-center py-1 flex-shrink-0"><i class="fas fa-calculator text-xs mr-2 text-champagne"></i><span>${t.calculators}</span></a>
      </nav>
      <div class="hidden lg:flex items-center space-x-2 xl:space-x-3.5 flex-shrink-0">
        <a href="tel:+905322384039" class="inline-flex items-center justify-center px-2.5 xl:px-4 py-2 rounded-xl bg-navy-dark border border-slate-700 text-titanium font-semibold text-xs hover:border-champagne/60 hover:text-champagne transition-all duration-300">
          <i class="fas fa-phone-alt mr-1.5 xl:mr-2 text-champagne"></i><span>${t.phone}</span>
        </a>
        <a href="${siteBase}index.html#gatekeeping" class="inline-flex items-center justify-center px-3.5 xl:px-5 py-2.5 rounded-xl bg-gradient-to-r from-champagne via-[#E6CA65] to-champagne-dark text-navy-dark font-bold text-sm shadow-xl hover:shadow-champagne/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-cinzel tracking-wide whitespace-nowrap">
          <i class="fas fa-lock-open mr-1.5 xl:mr-2 text-xs"></i><span>${t.cta}</span>
        </a>
      </div>
    </div>
  </header>`;
}

function renderFooter(lang, siteBase, assetsBase) {
  const t = lang === "en"
    ? {
        tagline: "Ankara Real Estate Strategist | TrueMax Real Estate",
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
        tagline: "Ankara Gayrimenkul Stratejisti | TrueMax Gayrimenkul",
        name: "Ali Cömert — TrueMax Gayrimenkul",
        quickAccess: "Hızlı Erişim",
        home: "Ana Sayfa",
        ankara: "Ankara Analizi",
        calculators: "Tapu & Vergi Hesaplayıcıları",
        allPosts: "Tüm Yazılar",
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
  </footer>
  <script src="https://cdn.tailwindcss.com"></script>`;
}

function articleSchema(post, lang, canonicalPath) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": postTitle(post, lang),
    "description": postExcerpt(post, lang) || postTitle(post, lang),
    "datePublished": post.date || "",
    "author": { "@type": "Person", "name": "Ali Cömert" },
    "publisher": { "@type": "Organization", "name": "TrueMax Gayrimenkul" },
    "mainEntityOfPage": SITE_URL + canonicalPath
  };
  if (post.cover_image) {
    schema.image = post.cover_image.startsWith("http") ? post.cover_image : SITE_URL + post.cover_image;
  }
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * rootPrefix: çağıran sayfadan gerçek site köküne ulaşmak için önek (görseller için).
 * blogPath: kökten yazının blog dizinine giden yol ("blog/" ya da "en/blog/").
 */
function renderPostCard(post, lang, rootPrefix, blogPath) {
  const title = postTitle(post, lang);
  const excerpt = postExcerpt(post, lang);
  const t = UI[lang];
  const img = post.cover_image
    ? `<img src="${rootPrefix}${post.cover_image.replace(/^\//, "")}" alt="${escapeHtml(title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />`
    : `<div class="w-full h-full bg-navy-dark flex items-center justify-center text-champagne/40 text-3xl"><i class="fas fa-newspaper"></i></div>`;
  return `
        <a href="${rootPrefix}${blogPath}${post.slug}.html" class="glass-panel rounded-3xl overflow-hidden border border-slate-700/60 hover:border-champagne/60 transition-all duration-300 flex flex-col group">
          <div class="relative aspect-video bg-navy-dark overflow-hidden">${img}</div>
          <div class="p-5 flex flex-col flex-grow">
            <span class="text-[10px] uppercase tracking-widest text-champagne font-bold font-cinzel mb-2">${escapeHtml(categoryLabel(post.category, lang))} &middot; ${fmtDate(post.date, lang)}</span>
            <h3 class="font-cinzel text-sm sm:text-base font-bold text-titanium leading-snug">${escapeHtml(title)}</h3>
            <p class="text-xs text-titanium-muted mt-2 leading-relaxed font-sans flex-grow">${escapeHtml(excerpt)}</p>
            <span class="mt-4 inline-flex items-center text-xs font-bold text-champagne">${t.readMore} <i class="fas fa-arrow-right ml-2 text-[10px]"></i></span>
          </div>
        </a>`;
}

function renderPostPage(post, lang) {
  const t = UI[lang];
  const isEn = lang === "en";
  const canonicalPath = isEn ? `/en/blog/${post.slug}.html` : `/blog/${post.slug}.html`;
  const trCanonical = `/blog/${post.slug}.html`;
  const enCanonical = `/en/blog/${post.slug}.html`;
  const title = `${postTitle(post, lang)} | Ali Cömert`;
  const description = postExcerpt(post, lang) || postTitle(post, lang);
  const bodyHtml = marked.parse(postBody(post, lang));
  const assetsBase = isEn ? "../../" : "../";
  const siteBase = "../";

  const hreflangBlock = hasEnglish(post)
    ? `<link rel="alternate" hreflang="tr" href="${SITE_URL}${trCanonical}" />
  <link rel="alternate" hreflang="en" href="${SITE_URL}${enCanonical}" />
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${trCanonical}" />`
    : `<link rel="alternate" hreflang="tr" href="${SITE_URL}${trCanonical}" />
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${trCanonical}" />`;

  const coverBlock = post.cover_image
    ? `<div class="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-10"><img src="${assetsBase}${post.cover_image.replace(/^\//, "")}" alt="${escapeHtml(postTitle(post, lang))}" class="w-full h-auto object-cover" /></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}" class="scroll-smooth">
<head>
${renderHead(title, description, post.cover_image, canonicalPath, assetsBase, hreflangBlock)}
  ${articleSchema(post, lang, canonicalPath)}
</head>
<body class="bg-navy text-titanium antialiased selection:bg-champagne selection:text-navy-dark">
${renderHeader(lang, siteBase, assetsBase)}
  <main class="pt-28 sm:pt-36 pb-20">
    <article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8 reveal-on-scroll">
        <span class="text-xs uppercase tracking-widest text-champagne font-bold font-cinzel">${escapeHtml(categoryLabel(post.category, lang))} &middot; ${fmtDate(post.date, lang)}</span>
        <h1 class="font-cinzel text-2xl sm:text-4xl font-bold text-titanium tracking-tight mt-3 leading-tight">${escapeHtml(postTitle(post, lang))}</h1>
      </div>
      ${coverBlock}
      <div class="prose-blog text-sm sm:text-base text-titanium-muted leading-relaxed font-sans space-y-5">
        ${bodyHtml}
      </div>
      <div class="mt-14 glass-panel-gold rounded-3xl p-6 sm:p-8 border border-champagne/40 text-center">
        <h3 class="font-cinzel text-lg sm:text-xl font-bold text-titanium mb-2">${t.consultTitle}</h3>
        <p class="text-xs sm:text-sm text-titanium-muted mb-5">${t.consultSub}</p>
        <a href="${siteBase}index.html#gatekeeping" class="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-gradient-to-r from-champagne to-champagne-dark text-navy-dark font-bold text-sm shadow-xl hover:brightness-105 transition-all font-cinzel tracking-wide">
          ${t.requestAccess} <i class="fas fa-arrow-right ml-3 text-xs"></i>
        </a>
      </div>
      <div class="mt-8">
        <a href="index.html" class="text-xs text-champagne hover:underline"><i class="fas fa-arrow-left mr-1.5"></i>${t.backToAll}</a>
      </div>
    </article>
  </main>
${renderFooter(lang, siteBase, assetsBase)}
</body>
</html>
`;
}

function renderBlogIndex(posts, lang) {
  const t = UI[lang];
  const isEn = lang === "en";
  const assetsBase = isEn ? "../../" : "../";
  const siteBase = "../";
  const blogPath = isEn ? "en/blog/" : "blog/";
  const canonicalPath = isEn ? "/en/blog/" : "/blog/";
  const trCanonical = "/blog/";
  const enCanonical = "/en/blog/";

  const hreflangBlock = `<link rel="alternate" hreflang="tr" href="${SITE_URL}${trCanonical}" />
  <link rel="alternate" hreflang="en" href="${SITE_URL}${enCanonical}" />
  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${trCanonical}" />`;

  const cards = posts.map(p => renderPostCard(p, lang, assetsBase, blogPath)).join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}" class="scroll-smooth">
<head>
${renderHead(t.blogTitle, t.blogDescription, null, canonicalPath, assetsBase, hreflangBlock)}
</head>
<body class="bg-navy text-titanium antialiased selection:bg-champagne selection:text-navy-dark">
${renderHeader(lang, siteBase, assetsBase)}
  <main class="pt-28 sm:pt-36 pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-14 sm:mb-16 reveal-on-scroll">
        <span class="text-xs uppercase tracking-widest text-champagne font-bold block mb-2 font-cinzel">${t.knowledgeBase}</span>
        <h1 class="font-cinzel text-2xl sm:text-5xl font-bold text-titanium tracking-tight">${t.blogHeading}</h1>
      </div>
      ${posts.length
        ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 reveal-on-scroll">${cards}</div>`
        : `<p class="text-center text-titanium-muted text-sm">${t.noPosts}</p>`}
    </div>
  </main>
${renderFooter(lang, siteBase, assetsBase)}
</body>
</html>
`;
}

function updateIntelligencePage(posts, lang) {
  const filePath = lang === "en"
    ? path.join(ROOT, "en", "intelligence.html")
    : path.join(ROOT, "intelligence.html");
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, "utf8");

  const startMarker = "<!-- BLOG_POSTS_INJECT_START -->";
  const endMarker = "<!-- BLOG_POSTS_INJECT_END -->";
  if (!html.includes(startMarker) || !html.includes(endMarker)) return;

  const t = UI[lang];
  const blogPath = lang === "en" ? "en/blog/" : "blog/";
  // intelligence.html (TR) kökte, en/intelligence.html kendi dil kökünde (en/) oturur;
  // kart görselleri gerçek site köküne göre konumlanır (cover_image dile göre değişmez).
  const cardRootPrefix = lang === "en" ? "../" : "";

  const latest = posts.slice(0, 3);
  const injected = latest.length
    ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 reveal-on-scroll">${latest.map(p => renderPostCard(p, lang, cardRootPrefix, blogPath)).join("\n")}</div>
        <div class="text-center mt-10"><a href="blog/index.html" class="inline-flex items-center text-champagne font-bold text-sm hover:underline">${t.allPosts} <i class="fas fa-arrow-right ml-2 text-xs"></i></a></div>`
    : `<p class="text-center text-titanium-muted text-sm">${t.noPosts}</p>`;

  const block = `${startMarker}${injected}${endMarker}`;
  html = html.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), block);
  fs.writeFileSync(filePath, html, "utf8");
}

function updateSitemap(posts, enPosts) {
  const filePath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(filePath)) return;
  let xml = fs.readFileSync(filePath, "utf8");

  const trStart = "<!-- BLOG_URLS_START -->";
  const trEnd = "<!-- BLOG_URLS_END -->";
  if (xml.includes(trStart)) {
    const entries = posts.map(p => `  <url>
    <loc>${SITE_URL}/blog/${p.slug}.html</loc>
    <lastmod>${(p.date || "").slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n");
    const block = `${trStart}\n${entries}\n  ${trEnd}`;
    xml = xml.replace(new RegExp(`${trStart}[\\s\\S]*?${trEnd}`), block);
  }

  const enStart = "<!-- EN_BLOG_URLS_START -->";
  const enEnd = "<!-- EN_BLOG_URLS_END -->";
  if (xml.includes(enStart)) {
    const entries = enPosts.map(p => `  <url>
    <loc>${SITE_URL}/en/blog/${p.slug}.html</loc>
    <lastmod>${(p.date || "").slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join("\n");
    const block = `${enStart}\n${entries}\n  ${enEnd}`;
    xml = xml.replace(new RegExp(`${enStart}[\\s\\S]*?${enEnd}`), block);
  }

  fs.writeFileSync(filePath, xml, "utf8");
}

function main() {
  const posts = loadPosts().filter(p => p.title);
  const enPosts = posts.filter(hasEnglish);

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  for (const post of posts) {
    fs.writeFileSync(path.join(BLOG_DIR, `${post.slug}.html`), renderPostPage(post, "tr"), "utf8");
  }
  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), renderBlogIndex(posts, "tr"), "utf8");

  if (enPosts.length) {
    fs.mkdirSync(EN_BLOG_DIR, { recursive: true });
    for (const post of enPosts) {
      fs.writeFileSync(path.join(EN_BLOG_DIR, `${post.slug}.html`), renderPostPage(post, "en"), "utf8");
    }
    fs.writeFileSync(path.join(EN_BLOG_DIR, "index.html"), renderBlogIndex(enPosts, "en"), "utf8");
  }

  updateIntelligencePage(posts, "tr");
  updateIntelligencePage(enPosts, "en");
  updateSitemap(posts, enPosts);

  console.log(`[build-blog] ${posts.length} TR yazı, ${enPosts.length} EN yazı işlendi.`);
}

main();
