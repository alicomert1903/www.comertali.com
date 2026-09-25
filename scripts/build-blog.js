/**
 * ALİ CÖMERT — Blog / Bölgesel Analiz Statik Sayfa Üretici
 * content/posts/*.json içindeki her yazı için blog/<slug>.html üretir,
 * blog/index.html arşiv sayfasını ve intelligence.html'deki "Son Yazılar"
 * bölümünü günceller, sitemap.xml'e yazı URL'lerini ekler.
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
const SITE_URL = "https://comertali.com";

const CATEGORY_LABELS = {
  bolge_analizi: "Bölge Analizi",
  yatirim_rehberi: "Yatırım Rehberi",
  piyasa_raporu: "Piyasa Raporu",
  vatandaslik: "Vatandaşlık",
  genel: "Genel"
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

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function categoryLabel(key) {
  return CATEGORY_LABELS[key] || key || "Genel";
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHead(title, description, ogImage, canonicalPath) {
  return `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${SITE_URL}${canonicalPath}" />

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
  <link rel="stylesheet" href="../assets/css/custom.css" />`;
}

function renderHeader() {
  return `  <header class="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-700/40 transition-all duration-300">
    <div class="max-w-7xl mx-auto pl-4 pr-16 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 lg:gap-6">
      <div class="flex items-center justify-between w-full lg:w-auto gap-3">
        <a href="../index.html" class="flex items-center space-x-2 sm:space-x-3.5 group flex-shrink-0">
          <img src="../truemax_logo.png" onerror="this.onerror=null; this.src='../logo.png';" alt="TrueMax Gayrimenkul" class="h-8 sm:h-11 w-auto object-contain drop-shadow transition-transform duration-300 group-hover:scale-105" />
          <div>
            <span class="font-cinzel text-base sm:text-2xl font-bold tracking-wider text-titanium block leading-none">ALİ CÖMERT</span>
            <span class="text-[9px] sm:text-[10px] tracking-widest text-champagne uppercase font-semibold mt-1 block">TrueMax Gayrimenkul Bünyesinde</span>
          </div>
        </a>
        <div class="flex items-center space-x-1.5 sm:space-x-2.5 lg:hidden flex-shrink-0">
          <a href="../index.html#gatekeeping" class="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-champagne via-[#E6CA65] to-champagne-dark text-navy-dark font-bold text-xs shadow-lg font-cinzel tracking-wide">
            <i class="fas fa-lock text-[11px] mr-1.5"></i><span>Erişim</span>
          </a>
        </div>
      </div>
      <nav class="flex flex-row items-center overflow-x-auto whitespace-nowrap space-x-6 sm:space-x-8 lg:space-x-2 text-xs sm:text-sm font-semibold lg:tracking-normal tracking-wide py-1.5 pt-2 border-t border-slate-800/60 lg:border-t-0 no-scrollbar lg:flex-1 lg:min-w-0">
        <a href="../index.html#roadmap" class="text-titanium hover:text-champagne transition-colors flex items-center py-1 flex-shrink-0"><i class="fas fa-passport text-xs mr-2 text-champagne"></i><span>Vatandaşlık</span></a>
        <a href="../intelligence.html" class="text-champagne flex items-center py-1 flex-shrink-0 border-b border-champagne pb-0.5"><i class="fas fa-chart-line text-xs mr-2 text-champagne"></i><span>Ankara Analizi</span></a>
        <a href="../index.html#faq" class="text-titanium hover:text-champagne transition-colors flex items-center py-1 flex-shrink-0"><i class="fas fa-question-circle text-xs mr-2 text-champagne"></i><span>S.S.S.</span></a>
        <a href="../index.html#portfolio-showcase" class="text-titanium hover:text-champagne transition-colors flex items-center py-1 flex-shrink-0"><i class="fas fa-layer-group text-xs mr-2 text-champagne"></i><span>Portföy</span></a>
        <a href="../araclar.html" class="text-titanium hover:text-champagne transition-colors flex items-center py-1 flex-shrink-0"><i class="fas fa-calculator text-xs mr-2 text-champagne"></i><span>Hesaplayıcılar</span></a>
      </nav>
      <div class="hidden lg:flex items-center space-x-2 xl:space-x-3.5 flex-shrink-0">
        <a href="tel:+905322384039" class="inline-flex items-center justify-center px-2.5 xl:px-4 py-2 rounded-xl bg-navy-dark border border-slate-700 text-titanium font-semibold text-xs hover:border-champagne/60 hover:text-champagne transition-all duration-300">
          <i class="fas fa-phone-alt mr-1.5 xl:mr-2 text-champagne"></i><span>+90 532 238 40 39</span>
        </a>
        <a href="../index.html#gatekeeping" class="inline-flex items-center justify-center px-3.5 xl:px-5 py-2.5 rounded-xl bg-gradient-to-r from-champagne via-[#E6CA65] to-champagne-dark text-navy-dark font-bold text-sm shadow-xl hover:shadow-champagne/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-cinzel tracking-wide whitespace-nowrap">
          <i class="fas fa-lock-open mr-1.5 xl:mr-2 text-xs"></i><span>Özel Portföye Erişin</span>
        </a>
      </div>
    </div>
  </header>`;
}

function renderFooter() {
  return `  <footer class="bg-navy-dark border-t border-slate-800/80 pt-14 sm:pt-16 pb-16 text-xs text-titanium-muted font-sans">
    <div class="max-w-7xl mx-auto pl-4 pr-16 sm:px-6 lg:px-8">
      <div class="pb-8 sm:pb-10 mb-10 sm:mb-12 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <span class="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-champagne font-cinzel block">Ankara Gayrimenkul Stratejisti | TrueMax Gayrimenkul</span>
          <h3 class="font-cinzel text-lg sm:text-2xl font-bold text-titanium mt-1">Ali Cömert — TrueMax Gayrimenkul</h3>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-800/60">
        <div class="space-y-3">
          <h4 class="font-cinzel font-bold text-titanium text-sm uppercase tracking-wider">Hızlı Erişim</h4>
          <ul class="space-y-2">
            <li><a href="../index.html" class="hover:text-champagne transition-colors">Ana Sayfa</a></li>
            <li><a href="../intelligence.html" class="hover:text-champagne transition-colors">Ankara Analizi</a></li>
            <li><a href="../araclar.html" class="hover:text-champagne transition-colors">Tapu & Vergi Hesaplayıcıları</a></li>
            <li><a href="index.html" class="hover:text-champagne transition-colors">Tüm Yazılar</a></li>
          </ul>
        </div>
        <div class="flex items-center space-x-3 text-sm text-titanium">
          <a href="https://www.instagram.com/alicomert.realestate" target="_blank" rel="noopener" aria-label="Instagram" class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-champagne hover:text-navy-dark transition-colors"><i class="fab fa-instagram"></i></a>
          <a href="https://www.linkedin.com/in/ali-cömert-27b083380" target="_blank" rel="noopener" aria-label="LinkedIn" class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-champagne hover:text-navy-dark transition-colors"><i class="fab fa-linkedin-in"></i></a>
          <a href="https://wa.me/905322384039" target="_blank" rel="noopener" aria-label="WhatsApp" class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-champagne hover:text-navy-dark transition-colors"><i class="fab fa-whatsapp"></i></a>
        </div>
        <div class="space-y-3.5">
          <h4 class="font-cinzel font-bold text-titanium text-sm uppercase tracking-wider">İletişim</h4>
          <a href="tel:+905322384039" class="font-bold text-champagne text-base hover:underline block">+90 532 238 40 39</a>
          <p class="text-titanium">info@comertali.com</p>
        </div>
      </div>
      <div class="pt-8 text-[11px] text-slate-500 text-center sm:text-left">
        <p>&copy; 2026 ALİ CÖMERT - TrueMax Gayrimenkul Bünyesinde. Tüm hakları saklıdır.</p>
      </div>
    </div>
  </footer>
  <script src="https://cdn.tailwindcss.com"></script>`;
}

function articleSchema(post, canonicalPath) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || "",
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

function renderPostCard(post, basePath) {
  const img = post.cover_image
    ? `<img src="${basePath}${post.cover_image.replace(/^\//, "")}" alt="${escapeHtml(post.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />`
    : `<div class="w-full h-full bg-navy-dark flex items-center justify-center text-champagne/40 text-3xl"><i class="fas fa-newspaper"></i></div>`;
  return `
        <a href="${basePath}blog/${post.slug}.html" class="glass-panel rounded-3xl overflow-hidden border border-slate-700/60 hover:border-champagne/60 transition-all duration-300 flex flex-col group">
          <div class="relative aspect-video bg-navy-dark overflow-hidden">${img}</div>
          <div class="p-5 flex flex-col flex-grow">
            <span class="text-[10px] uppercase tracking-widest text-champagne font-bold font-cinzel mb-2">${escapeHtml(categoryLabel(post.category))} &middot; ${fmtDate(post.date)}</span>
            <h3 class="font-cinzel text-sm sm:text-base font-bold text-titanium leading-snug">${escapeHtml(post.title)}</h3>
            <p class="text-xs text-titanium-muted mt-2 leading-relaxed font-sans flex-grow">${escapeHtml(post.excerpt || "")}</p>
            <span class="mt-4 inline-flex items-center text-xs font-bold text-champagne">Devamını Oku <i class="fas fa-arrow-right ml-2 text-[10px]"></i></span>
          </div>
        </a>`;
}

function renderPostPage(post) {
  const canonicalPath = `/blog/${post.slug}.html`;
  const title = `${post.title} | Ali Cömert`;
  const description = post.excerpt || post.title;
  const bodyHtml = marked.parse(post.body || "");
  const coverBlock = post.cover_image
    ? `<div class="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-10"><img src="../${post.cover_image.replace(/^\//, "")}" alt="${escapeHtml(post.title)}" class="w-full h-auto object-cover" /></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr" class="scroll-smooth">
<head>
${renderHead(title, description, post.cover_image, canonicalPath)}
  ${articleSchema(post, canonicalPath)}
</head>
<body class="bg-navy text-titanium antialiased selection:bg-champagne selection:text-navy-dark">
${renderHeader()}
  <main class="pt-28 sm:pt-36 pb-20">
    <article class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8 reveal-on-scroll">
        <span class="text-xs uppercase tracking-widest text-champagne font-bold font-cinzel">${escapeHtml(categoryLabel(post.category))} &middot; ${fmtDate(post.date)}</span>
        <h1 class="font-cinzel text-2xl sm:text-4xl font-bold text-titanium tracking-tight mt-3 leading-tight">${escapeHtml(post.title)}</h1>
      </div>
      ${coverBlock}
      <div class="prose-blog text-sm sm:text-base text-titanium-muted leading-relaxed font-sans space-y-5">
        ${bodyHtml}
      </div>
      <div class="mt-14 glass-panel-gold rounded-3xl p-6 sm:p-8 border border-champagne/40 text-center">
        <h3 class="font-cinzel text-lg sm:text-xl font-bold text-titanium mb-2">Bu konuda birebir danışmanlık ister misiniz?</h3>
        <p class="text-xs sm:text-sm text-titanium-muted mb-5">Bölgesel analiz ve yatırım fırsatları için doğrudan iletişime geçin.</p>
        <a href="../index.html#gatekeeping" class="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-gradient-to-r from-champagne to-champagne-dark text-navy-dark font-bold text-sm shadow-xl hover:brightness-105 transition-all font-cinzel tracking-wide">
          Özel Portföye Erişin <i class="fas fa-arrow-right ml-3 text-xs"></i>
        </a>
      </div>
      <div class="mt-8">
        <a href="index.html" class="text-xs text-champagne hover:underline"><i class="fas fa-arrow-left mr-1.5"></i>Tüm Yazılara Dön</a>
      </div>
    </article>
  </main>
${renderFooter()}
</body>
</html>
`;
}

function renderBlogIndex(posts) {
  const cards = posts.map(p => renderPostCard(p, "../")).join("\n");
  const title = "Bölgesel Analiz & Blog | Ali Cömert";
  const description = "Ankara gayrimenkul piyasası, vatandaşlık süreçleri ve yatırım rehberleri üzerine yazılar.";
  return `<!DOCTYPE html>
<html lang="tr" class="scroll-smooth">
<head>
${renderHead(title, description, null, "/blog/")}
</head>
<body class="bg-navy text-titanium antialiased selection:bg-champagne selection:text-navy-dark">
${renderHeader()}
  <main class="pt-28 sm:pt-36 pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-14 sm:mb-16 reveal-on-scroll">
        <span class="text-xs uppercase tracking-widest text-champagne font-bold block mb-2 font-cinzel">GDOS Knowledge Base</span>
        <h1 class="font-cinzel text-2xl sm:text-5xl font-bold text-titanium tracking-tight">Bölgesel Analiz & Blog</h1>
      </div>
      ${posts.length
        ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 reveal-on-scroll">${cards}</div>`
        : `<p class="text-center text-titanium-muted text-sm">Henüz yayınlanmış yazı yok — yakında burada olacak.</p>`}
    </div>
  </main>
${renderFooter()}
</body>
</html>
`;
}

function updateIntelligencePage(posts) {
  const filePath = path.join(ROOT, "intelligence.html");
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, "utf8");

  const startMarker = "<!-- BLOG_POSTS_INJECT_START -->";
  const endMarker = "<!-- BLOG_POSTS_INJECT_END -->";
  if (!html.includes(startMarker) || !html.includes(endMarker)) return;

  const latest = posts.slice(0, 3);
  const injected = latest.length
    ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 reveal-on-scroll">${latest.map(p => renderPostCard(p, "")).join("\n")}</div>
        <div class="text-center mt-10"><a href="blog/index.html" class="inline-flex items-center text-champagne font-bold text-sm hover:underline">Tüm Yazıları Gör <i class="fas fa-arrow-right ml-2 text-xs"></i></a></div>`
    : `<p class="text-center text-titanium-muted text-sm">Henüz yayınlanmış yazı yok — yakında burada olacak.</p>`;

  const block = `${startMarker}${injected}${endMarker}`;
  html = html.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), block);
  fs.writeFileSync(filePath, html, "utf8");
}

function updateSitemap(posts) {
  const filePath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(filePath)) return;
  let xml = fs.readFileSync(filePath, "utf8");

  const startMarker = "<!-- BLOG_URLS_START -->";
  const endMarker = "<!-- BLOG_URLS_END -->";
  if (!xml.includes(startMarker)) return;

  const entries = posts.map(p => `  <url>
    <loc>${SITE_URL}/blog/${p.slug}.html</loc>
    <lastmod>${(p.date || "").slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n");

  const block = `${startMarker}\n${entries}\n  ${endMarker}`;
  xml = xml.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), block);
  fs.writeFileSync(filePath, xml, "utf8");
}

function main() {
  const posts = loadPosts();

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  for (const post of posts) {
    if (!post.title) continue;
    fs.writeFileSync(path.join(BLOG_DIR, `${post.slug}.html`), renderPostPage(post), "utf8");
  }
  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), renderBlogIndex(posts), "utf8");

  updateIntelligencePage(posts);
  updateSitemap(posts);

  console.log(`[build-blog] ${posts.length} yazı işlendi, blog/ üretildi.`);
}

main();
