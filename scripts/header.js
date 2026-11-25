/**
 * Ortak site üst menüsü (ana sayfa, araçlar, Ankara Analizi ve blog sayfaları aynı bileşeni kullanır).
 * Stiller assets/css/custom.css içindeki ".sh-*" sınıflarındadır; menü davranışı satır içi küçük bir betiktir
 * (blog sayfaları main.js yüklemediği için bağımsız çalışır).
 *
 * opts:
 *   lang       "tr" | "en"
 *   rootHref   ana sayfanın bulunduğu klasöre önek ("" veya "../")
 *   assetsBase assets/ klasörüne önek ("", "../", "../../")
 *   blogHref   makale dizinine bağlantı ("blog/index.html" ya da blog içindeyken "index.html")
 *   langHref   diğer dildeki karşılığına bağlantı
 *   isHome     true ise bölüm bağlantıları "#id" olur
 *   active     "ankara" | "articles" | "tools" | "" (menüde vurgulanır)
 */
const PHONE_DISPLAY = "+90 532 238 40 39";
const PHONE_HREF = "tel:+905322384039";
const WHATSAPP_HREF = "https://wa.me/905322384039";

const T = {
  tr: {
    nav: { citizenship: "Vatandaşlık", ankara: "Ankara Analizi", articles: "Makaleler", faq: "S.S.S.", portfolio: "Portföy", tools: "Hesaplayıcılar" },
    contact: "Bize Ulaşın",
    advisor: "Ankara Gayrimenkul Danışmanı",
    districtsGuide: "Ankara Bölge Rehberi",
    advisorFile: "gayrimenkul-danismani.html",
    menu: "Menü",
    explore: "Sitede Gezin",
    sections: "Ana Sayfa Bölümleri",
    home: "Ana Sayfa",
    citizenshipLong: "Yatırım Yoluyla Vatandaşlık",
    videos: "Video Galerisi",
    portfolioLong: "Özel Portföy",
    faqLong: "Sıkça Sorulan Sorular",
    reviews: "Google Değerlendirmeleri",
    access: "Özel Portföye Erişim Talebi",
    whatsapp: "WhatsApp'tan Yazın",
    brand: "Ankara Gayrimenkul Stratejisti",
    logoAlt: "Ali Cömert — Real Estate Strategist",
    langLabel: "Dil seçimi",
    switchTo: "İngilizceye geç"
  },
  en: {
    nav: { citizenship: "Citizenship", ankara: "Ankara Analysis", articles: "Articles", faq: "FAQ", portfolio: "Portfolio", tools: "Calculators" },
    contact: "Contact Us",
    advisor: "Ankara Real Estate Advisor",
    districtsGuide: "Ankara District Guide",
    advisorFile: "real-estate-advisor.html",
    menu: "Menu",
    explore: "Explore",
    sections: "Home Page Sections",
    home: "Home",
    citizenshipLong: "Citizenship by Investment",
    videos: "Video Gallery",
    portfolioLong: "Private Portfolio",
    faqLong: "Frequently Asked Questions",
    reviews: "Google Reviews",
    access: "Request Private Access",
    whatsapp: "Message on WhatsApp",
    brand: "Ankara Real Estate Strategist",
    logoAlt: "Ali Cömert — Real Estate Strategist",
    langLabel: "Language",
    switchTo: "Switch to Turkish"
  }
};

function renderSiteHeader(opts) {
  const { lang, rootHref = "", assetsBase = "", blogHref, langHref, isHome = false, active = "" } = opts;
  const t = T[lang];
  const sec = id => (isHome ? `#${id}` : `${rootHref}index.html#${id}`);
  const page = name => `${rootHref}${name}`;

  const nav = [
    ["citizenship", sec("roadmap"), t.nav.citizenship, ""],
    ["ankara", page("intelligence.html"), t.nav.ankara, "ankara"],
    ["articles", blogHref, t.nav.articles, "articles"],
    ["faq", sec("faq"), t.nav.faq, ""],
    ["portfolio", sec("portfolio-showcase"), t.nav.portfolio, ""],
    ["tools", page("araclar.html"), t.nav.tools, "tools"]
  ];
  const navHtml = nav.map(([, href, label, key]) =>
    `<a href="${href}"${key && key === active ? ' class="is-active" aria-current="page"' : ""}>${label}</a>`
  ).join("");

  const drawerLink = (href, icon, label) =>
    `<a href="${href}"><i class="fas ${icon}"></i><span>${label}</span></a>`;
  const exploreHtml = [
    drawerLink(page("index.html"), "fa-house", t.home),
    drawerLink(sec("roadmap"), "fa-passport", t.citizenshipLong),
    drawerLink(page("intelligence.html"), "fa-chart-line", t.nav.ankara),
    drawerLink(page("ankara/" + t.advisorFile), "fa-handshake", t.advisor),
    drawerLink(page("ankara/index.html"), "fa-map-location-dot", t.districtsGuide),
    drawerLink(blogHref, "fa-newspaper", t.nav.articles),
    drawerLink(page("araclar.html"), "fa-calculator", t.nav.tools)
  ].join("");
  const sectionsHtml = [
    drawerLink(sec("video-gallery"), "fa-circle-play", t.videos),
    drawerLink(sec("portfolio-showcase"), "fa-layer-group", t.portfolioLong),
    drawerLink(sec("faq"), "fa-circle-question", t.faqLong),
    drawerLink(sec("testimonials"), "fa-star", t.reviews),
    drawerLink(sec("gatekeeping"), "fa-lock-open", t.access)
  ].join("");

  const trActive = lang === "tr";
  const langHtml = `<div class="sh-lang" role="group" aria-label="${t.langLabel}">
        ${trActive ? '<span aria-current="true">TR</span>' : `<a href="${langHref}" hreflang="tr" aria-label="Türkçeye geç">TR</a>`}
        ${trActive ? `<a href="${langHref}" hreflang="en" aria-label="${t.switchTo}">EN</a>` : '<span aria-current="true">EN</span>'}
      </div>`;

  return `<header class="sh" id="siteHeader">
    <div class="sh-inner">
      <a href="${page("index.html")}" class="sh-brand">
        <img src="${assetsBase}assets/images/ali-comert-logo-128.png" width="44" height="44" alt="${t.logoAlt}" />
        <span class="sh-brand-text">
          <span class="sh-name">ALİ CÖMERT</span>
          <span class="sh-sub">${t.brand}</span>
        </span>
      </a>
      <nav class="sh-nav" aria-label="${t.menu}">${navHtml}</nav>
      <div class="sh-right">
        ${langHtml}
        <a href="${PHONE_HREF}" class="sh-contact" aria-label="${t.contact} ${PHONE_DISPLAY}">
          <span class="sh-contact-label">${t.contact}</span>
          <span class="sh-contact-num"><i class="fas fa-phone-alt"></i>${PHONE_DISPLAY}</span>
        </a>
        <a href="${PHONE_HREF}" class="sh-call" aria-label="${t.contact} ${PHONE_DISPLAY}"><i class="fas fa-phone-alt"></i></a>
        <button type="button" class="sh-burger" aria-label="${t.menu}" aria-expanded="false" aria-controls="shDrawer"><span></span><span></span><span></span></button>
      </div>
    </div>
    <div class="sh-backdrop"></div>
    <aside class="sh-drawer" id="shDrawer" aria-label="${t.menu}">
      <p class="sh-drawer-title">${t.explore}</p>
      ${exploreHtml}
      <p class="sh-drawer-title">${t.sections}</p>
      ${sectionsHtml}
      <div class="sh-drawer-cta">
        <a href="${PHONE_HREF}" class="sh-drawer-btn sh-drawer-btn-gold"><i class="fas fa-phone-alt"></i><span>${t.contact}<small>${PHONE_DISPLAY}</small></span></a>
        <a href="${WHATSAPP_HREF}" target="_blank" rel="noopener" class="sh-drawer-btn"><i class="fab fa-whatsapp"></i><span>${t.whatsapp}</span></a>
      </div>
    </aside>
    <script>
      (function () {
        var h = document.getElementById("siteHeader");
        var b = h.querySelector(".sh-burger");
        function set(o) { h.classList.toggle("sh-open", o); document.documentElement.classList.toggle("sh-open-doc", o); b.setAttribute("aria-expanded", o ? "true" : "false"); document.body.style.overflow = o ? "hidden" : ""; }
        b.addEventListener("click", function () { set(!h.classList.contains("sh-open")); });
        h.querySelector(".sh-backdrop").addEventListener("click", function () { set(false); });
        h.querySelectorAll(".sh-drawer a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
        document.addEventListener("click", function (e) {
          var a = e.target.closest ? e.target.closest("a[href]") : null;
          if (!a || typeof gtag !== "function") return;
          var u = a.getAttribute("href") || "", n = "";
          if (u.indexOf("tel:") === 0) n = "phone_click";
          else if (u.indexOf("wa.me") > -1 || u.indexOf("api.whatsapp.com") > -1) n = "whatsapp_click";
          else if (u.indexOf("mailto:") === 0) n = "email_click";
          else if (u.indexOf("instagram.com") > -1) n = "instagram_click";
          else if (u.indexOf("youtube.com") > -1) n = "youtube_click";
          else if (u.indexOf("linkedin.com") > -1) n = "linkedin_click";
          if (n) gtag("event", n, { link_url: u.slice(0, 150), page_path: location.pathname });
        }, true);
      })();
    </script>
  </header>`;
}

module.exports = { renderSiteHeader };
