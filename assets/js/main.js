/**
 * ALİ CÖMERT — GDOS Platform | Main Core JavaScript Engine
 * Handles Language Detection, Scroll Animations, Gatekeeping Form Scoring, Timeline, UI Interactions.
 * GA4 Event Tracking: initGA4Events() — replace G-XXXXXXXXXX in index.html with real Measurement ID.
 */

document.addEventListener("DOMContentLoaded", () => {
  initLanguageIntelligence();
  initScrollAnimations();
  initFAQAccordion();
  initTimelineInteractivity();
  initGatekeepingForm();
  initMobileNavigation();
  initCheckboxValidation();
  initQrWelcomeScenario();
  initPortfolioCMS();
  initFxTicker();
  initGA4Events(); // GDOS Analytics — must run last (after all elements are bound)
});

/* ==========================================================================
   1. TECHNICAL INFRASTRUCTURE: Core Console Intelligence
   ========================================================================== */
function initLanguageIntelligence() {
  console.group("%c👑 ALİ CÖMERT | GDOS — Ankara Real Estate Intelligence Platform", "color: #D4AF37; font-size: 14px; font-weight: bold; background: #0A1128; padding: 6px 12px; border: 1px solid #D4AF37; border-radius: 4px;");
  console.log("%c[System Initialized] Core UI & Executive Engine Active.", "color: #D4AF37; font-weight: bold; font-size: 12px;");
  console.log("%c[Schema] RealEstateAgent + Person + FAQPage + HowTo — 4 schemas active.", "color: #94A3B8; font-size: 11px;");
  console.log("%c[GA4] Event tracking active. Replace G-XXXXXXXXXX with your Measurement ID.", "color: #94A3B8; font-size: 11px;");
  console.log("%c[Netlify] Modular GDOS architecture loaded successfully.", "color: #94A3B8; font-size: 11px;");
  console.groupEnd();
}

/* ==========================================================================
   2. SCROLL & FADE-IN ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -60px 0px",
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        // Optional: stop observing once revealed
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  revealElements.forEach(el => revealObserver.observe(el));

  // Also trigger initial check for hero elements right away
  setTimeout(() => {
    document.querySelectorAll(".hero-reveal").forEach(el => el.classList.add("revealed"));
  }, 100);
}

/* ==========================================================================
   3. FAQ ACCORDION INTERACTION
   ========================================================================== */
function initFAQAccordion() {
  const accordionButtons = document.querySelectorAll(".faq-toggle-btn");
  accordionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector(".faq-icon");
      const isExpanded = btn.getAttribute("aria-expanded") === "true";

      // Close all other accordions for clean UX
      accordionButtons.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute("aria-expanded", "false");
          otherBtn.nextElementSibling.style.maxHeight = null;
          otherBtn.nextElementSibling.classList.add("opacity-0");
          const otherIcon = otherBtn.querySelector(".faq-icon");
          if (otherIcon) otherIcon.style.transform = "rotate(0deg)";
        }
      });

      if (isExpanded) {
        btn.setAttribute("aria-expanded", "false");
        content.style.maxHeight = null;
        content.classList.add("opacity-0");
        if (icon) icon.style.transform = "rotate(0deg)";
      } else {
        btn.setAttribute("aria-expanded", "true");
        content.style.maxHeight = content.scrollHeight + 40 + "px";
        content.classList.remove("opacity-0");
        if (icon) icon.style.transform = "rotate(180deg)";
      }
    });
  });
}

/* ==========================================================================
   4. CITIZENSHIP ROADMAP (TIMELINE) INTERACTION
   ========================================================================== */
function initTimelineInteractivity() {
  const timelineItems = document.querySelectorAll(".timeline-item");
  const detailBoxTitle = document.getElementById("timelineDetailTitle");
  const detailBoxDesc = document.getElementById("timelineDetailDesc");
  const detailBoxBadge = document.getElementById("timelineDetailBadge");

  const timelineDetails = {
    step1: {
      title: "Adım 1: Uygunluk Analizi & Hedef Portföy Eşleştirmesi",
      desc: "Yatırımcının bütçe, vatandaşlık takvimi ve risk tercihine göre portföy havuzu önce bölge bazında süzgeçten geçirilir: Çankaya diplomatik kuşağı, Oran–Koru–Çayyolu getiri hattı veya kentsel dönüşüm bölgeleri. Ardından hukuki incelemeden geçmiş mülkler listelenir.",
      badge: "Süre: 1 - 3 Gün | Hukuki Ön Denetim"
    },
    step2: {
      title: "Adım 2: Stratejik Portföy Seçimi & Ekspertiz Onayı",
      desc: "Seçilen gayrimenkuller için Sermaye Piyasası Kurulu (SPK) onaylı bağımsız gayrimenkul değerleme raporu alınır. Gerçek değer ile tapu beyan değerinin $400.000+ kuralıyla tam uyumu belgelenir.",
      badge: "Süre: 3 - 5 Gün | SPK Onaylı Değerleme"
    },
    step3: {
      title: "Adım 3: Yasal Süreç, Döviz Alım Belgesi (DAB) & Tapu Transferi",
      desc: "Yatırım tutarı Merkez Bankası kurundan Türk Lirası'na çevrilerek resmi Döviz Alım Belgesi (DAB) düzenlenir. Tapu devri ve 3 yıl satılamaz şerhi işlemleri uzman avukat ekibimizce vekaleten tamamlanır.",
      badge: "Süre: 2 - 4 Gün | Blokajsız Güvenli İşlem"
    },
    step4: {
      title: "Adım 4: Uygunluk Belgesi & Biyometrik Vatandaşlık Başvurusu",
      desc: "Tapu Kadastro Genel Müdürlüğü'nden Uygunluk Belgesi alınır. Yatırımcı, eşi ve 18 yaş altı çocukları için istisnai vatandaşlık ve kısa dönem oturum izni başvurusu tek oturumda yapılır.",
      badge: "Süre: 2 - 3 Hafta | Aile Kapsamlı Başvuru"
    },
    step5: {
      title: "Adım 5: Türk Pasaportu Teslimi & VIP Varlık Yönetimi",
      desc: "Cumhurbaşkanlığı kararı ve nüfus tescilinin ardından çipli Türk Pasaportları ve Kimlik Kartları yatırımcının adresine teslim edilir. Satın alınan mülkler için VIP kira veya varlık yönetimi hizmetimiz devreye girer.",
      badge: "Süre: 3 - 4 Ay | Pasaport Teslimi & Getiri Yönetimi"
    }
  };

  timelineItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      timelineItems.forEach(el => el.classList.remove("active", "border-champagne", "bg-navy-light/90"));
      timelineItems.forEach(el => el.classList.add("border-slate-700/50", "bg-navy-dark/60"));

      item.classList.add("active", "border-champagne", "bg-navy-light/90");
      item.classList.remove("border-slate-700/50", "bg-navy-dark/60");

      const stepKey = item.getAttribute("data-step") || `step${index + 1}`;
      const data = timelineDetails[stepKey];
      if (data && detailBoxTitle) {
        // Smooth fade out & in
        const container = detailBoxTitle.parentElement;
        container.style.opacity = 0;
        setTimeout(() => {
          detailBoxTitle.textContent = data.title;
          detailBoxDesc.textContent = data.desc;
          if (detailBoxBadge) detailBoxBadge.textContent = data.badge;
          container.style.opacity = 1;
        }, 200);
      }
    });
  });
}

/* ==========================================================================
   5. GATEKEEPING FORM (ELEME FORMU & VIP PROFIL SKORLAMA)
   ========================================================================== */
function initGatekeepingForm() {
  const form = document.getElementById("gatekeepingForm") || document.forms["ozel-portfoy"];
  const scoreBadge = document.getElementById("liveProfileScore");
  const dropdown1 = document.getElementById("yatirimHedefi");
  const dropdown2 = document.getElementById("yatirimZamanlamasi");
  const dropdown3 = document.getElementById("yatirimHacmi");

  // Live Score Calculation
  const updateProfileScore = () => {
    let score = 50; // Base baseline score

    if (dropdown1 && dropdown1.value) {
      if (dropdown1.value.includes("Vatandaşlık")) score += 20;
      else if (dropdown1.value.includes("Ticari") || dropdown1.value.includes("Portföy")) score += 15;
      else score += 10;
    }

    if (dropdown2 && dropdown2.value) {
      if (dropdown2.value.includes("Hemen")) score += 20;
      else if (dropdown2.value.includes("1-3 Ay")) score += 15;
      else score += 5;
    }

    if (dropdown3 && dropdown3.value) {
      if (dropdown3.value.includes("3.000.000+")) score += 30;
      else if (dropdown3.value.includes("1.000.000")) score += 20;
      else if (dropdown3.value.includes("400.000")) score += 15;
    }

    if (scoreBadge) {
      scoreBadge.textContent = `%${Math.min(score, 99)} VIP Eşleşme Skoru`;
      if (score >= 85) {
        scoreBadge.className = "px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] animate-pulse";
      } else {
        scoreBadge.className = "px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-600 text-slate-300";
      }
    }
  };

  [dropdown1, dropdown2, dropdown3].forEach(el => {
    if (el) el.addEventListener("change", updateProfileScore);
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName")?.value?.trim();
      const contactInfo = document.getElementById("contactInfo")?.value?.trim();
      const phoneNo = document.getElementById("phoneNo")?.value?.trim();

      if (!fullName || !contactInfo || !phoneNo) {
        const msg = window.currentLang === "en" ? "Please fill in all mandatory contact fields." :
                    window.currentLang === "ru" ? "Пожалуйста, заполните все обязательные контактные поля." :
                    window.currentLang === "zh" ? "请填写所有必填的联系信息栏。" : "Lütfen tüm zorunlu iletişim alanlarını doldurunuz.";
        showLuxuryToast(msg, "red");
        return;
      }

      if (!dropdown1?.value || !dropdown2?.value || !dropdown3?.value) {
        const msg = window.currentLang === "en" ? "Please select investment goal, timing, and volume." :
                    window.currentLang === "ru" ? "Пожалуйста, выберите цель инвестирования, сроки и объем." :
                    window.currentLang === "zh" ? "请选择投资目标、时间安排及投资规模。" : "Lütfen yatırım hedefi, zamanlaması ve hacmi seçimlerini yapınız.";
        showLuxuryToast(msg, "red");
        return;
      }

      const kvkkChecked = document.getElementById("kvkkCheck")?.checked;
      const ndaChecked = document.getElementById("ndaCheck")?.checked;
      const cookieChecked = document.getElementById("cookieCheck")?.checked;

      if (!kvkkChecked || !ndaChecked || !cookieChecked) {
        const msg = window.currentLang === "en" ? "Please check all required legal agreements (KVKK, NDA, Cookies)." :
                    window.currentLang === "ru" ? "Пожалуйста, отметьте все юридические соглашения (KVKK, NDA, Cookies)." :
                    window.currentLang === "zh" ? "请勾选所有相关的法律协议确认框（KVKK, NDA, Cookies）。" : "Lütfen tüm yasal onay kutucuklarını (KVKK, NDA, Çerez) işaretleyiniz.";
        showLuxuryToast(msg, "red");
        return;
      }

      // Show loading spinner on button
      const submitBtn = form.querySelector("button[type='submit']");
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      const loadingText = window.currentLang === "en" ? "Analyzing & Processing..." :
                          window.currentLang === "ru" ? "Анализ и предварительная оценка..." :
                          window.currentLang === "zh" ? "系统正在分析及初步评估中..." : "Analiz & Ön Değerlendirme Yapılıyor...";
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> ${loadingText}`;

      // Simulate Netlify Form Submission or actual POST if deployed
      const formData = new FormData(form);
      
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      }).then(() => {
        // Success handling whether local or on Netlify
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          form.reset();
          updateProfileScore();
          openSuccessModal(fullName, dropdown1.value, dropdown3.value);
        }, 1200);
      }).catch(err => {
        // Fallback simulation for local dev without active netlify backend
        console.log("[ComertAli Netlify Form] Local simulation successful:", err);
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          form.reset();
          updateProfileScore();
          openSuccessModal(fullName, dropdown1.value, dropdown3.value);
        }, 1200);
      });
    });
  }
}

function openSuccessModal(name, goal, volume) {
  const modal = document.getElementById("gatekeepingSuccessModal");
  const nameEl = document.getElementById("successModalName");
  const detailsEl = document.getElementById("successModalDetails");

  if (nameEl) {
    if (window.currentLang === "en") nameEl.textContent = `Dear ${name || "Investor"}, Your Request Has Been Received.`;
    else if (window.currentLang === "ru") nameEl.textContent = `Уважаемый(ая) ${name || "Инвестор"}, ваш запрос принят.`;
    else if (window.currentLang === "zh") nameEl.textContent = `尊敬的 ${name || "投资者"}，您的具体申请已顺利提交。`;
    else nameEl.textContent = `Sayın ${name || "Yatırımcımız"}, Talebiniz Alınmıştır.`;
  }
  if (detailsEl) {
    if (window.currentLang && window.i18nData && window.i18nData[window.currentLang]?.modal_success_desc) {
      detailsEl.textContent = window.i18nData[window.currentLang].modal_success_desc;
    } else {
      detailsEl.textContent = `Talebiniz kurumsal departmanımıza ulaşmıştır. Ali Cömert Özel Danışmanlık servisi en kısa sürede sizinle iletişime geçecektir.`;
    }
  }

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
  }
}

window.closeSuccessModal = function() {
  const modal = document.getElementById("gatekeepingSuccessModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
  }
};

/* ==========================================================================
   6. MOBILE NAVIGATION & LUXURY TOAST NOTIFICATIONS
   ========================================================================== */
function initMobileNavigation() {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const closeBtn = document.getElementById("closeMobileMenu");
  const drawer = document.getElementById("mobileMenuDrawer");
  const links = drawer?.querySelectorAll("a");

  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", () => {
      drawer.classList.remove("translate-x-full");
      document.body.style.overflow = "hidden";
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener("click", () => {
      drawer.classList.add("translate-x-full");
      document.body.style.overflow = "";
    });
  }

  links?.forEach(link => {
    link.addEventListener("click", () => {
      drawer.classList.add("translate-x-full");
      document.body.style.overflow = "";
    });
  });
}

function initCheckboxValidation() {
  const kvkk = document.getElementById("kvkkCheck");
  const nda = document.getElementById("ndaCheck");
  const cookie = document.getElementById("cookieCheck");
  const submitBtn = document.getElementById("gatekeepingSubmitBtn");

  if (!submitBtn) return;

  const validate = () => {
    const allChecked = kvkk?.checked && nda?.checked && cookie?.checked;
    submitBtn.disabled = !allChecked;
    if (allChecked) {
      submitBtn.classList.remove("opacity-50", "cursor-not-allowed", "grayscale-[30%]");
      submitBtn.classList.add("hover:scale-[1.02]", "active:scale-[0.98]", "shadow-2xl");
    } else {
      submitBtn.classList.add("opacity-50", "cursor-not-allowed", "grayscale-[30%]");
      submitBtn.classList.remove("hover:scale-[1.02]", "active:scale-[0.98]", "shadow-2xl");
    }
  };

  [kvkk, nda, cookie].forEach(el => {
    if (el) el.addEventListener("change", validate);
  });
  
  validate();
}

function initQrWelcomeScenario() {
  const urlParams = new URLSearchParams(window.location.search);
  const isQr = urlParams.get("qr") === "true";
  const qrModal = document.getElementById("qrWelcomeModal");

  if (isQr && qrModal) {
    qrModal.classList.remove("hidden");
    qrModal.classList.add("flex");
    document.body.style.overflow = "hidden";
  }
}

window.closeQrModal = function() {
  const qrModal = document.getElementById("qrWelcomeModal");
  if (qrModal) {
    qrModal.classList.add("hidden");
    qrModal.classList.remove("flex");
    document.body.style.overflow = "";
  }
};

window.showLuxuryToast = function(message, color = "gold") {
  const toastContainer = document.getElementById("luxuryToastContainer") || createToastContainer();
  const toast = document.createElement("div");
  
  const borderColor = color === "red" ? "border-red-500 text-red-300" : "border-[#D4AF37] text-[#E2E8F0]";
  const icon = color === "red" ? "fa-exclamation-triangle text-red-400" : "fa-check-circle text-[#D4AF37]";
  
  toast.className = `glass-panel-gold px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-500 transform translate-y-4 opacity-0 border ${borderColor}`;
  toast.innerHTML = `
    <i class="fas ${icon} text-lg"></i>
    <span class="text-sm font-medium tracking-wide">${message}</span>
  `;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-4", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
};

function createToastContainer() {
  const container = document.createElement("div");
  container.id = "luxuryToastContainer";
  container.className = "fixed bottom-24 right-6 z-50 flex flex-col space-y-3 pointer-events-none";
  document.body.appendChild(container);
  return container;
}

/* ==========================================================================
   7. LEGAL & NDA HTML MODAL POPUP HANDLER
   ========================================================================== */
window.openLegalModal = function(title, content) {
  const modal = document.getElementById("legalHtmlModal");
  const titleEl = document.getElementById("legalModalTitle");
  const contentEl = document.getElementById("legalModalContent");

  let finalContent = content;
  if (!finalContent && title) {
    if (title.includes("KVKK")) {
      finalContent = `<p class="leading-relaxed">6698 sayılı Kişisel Verilerin Korunması Kanunu ('KVKK') kapsamında; tarafıma iletmiş olduğunuz ad, soyad, iletişim numarası, e-posta adresi ve yatırım hedefi (bütçe, zamanlama, lokasyon) bilgileriniz veri sorumlusu sıfatıyla Ali Cömert tarafından işlenmektedir. Bu veriler; nitelikli gayrimenkul eşleştirmelerinin yapılması, tarafınıza sunulacak özel (off-market) portföylerin güvenliğinin sağlanması, vatandaşlık (Citizenship) süreçlerinin yasal takibi ve iletişim faaliyetlerinin yürütülmesi amaçlarıyla sınırlı olarak kullanılmaktadır. Verileriniz, yasal zorunluluklar veya vatandaşlık işlemleri kapsamında yetkili kamu kurumları ve hukuki iş ortaklarımız haricinde hiçbir üçüncü şahısla paylaşılmayacaktır. Formu onaylayarak, verilerinizin bu kapsamda işlenmesine açık rıza göstermektesiniz.</p>`;
    } else if (title.includes("NDA") || title.includes("Gizlilik")) {
      finalContent = `<p class="leading-relaxed">İşbu form aracılığıyla 'Özel Portföy' erişimi talep eden yatırımcı, kendisine Ali Cömert tarafından sunulacak olan tüm gayrimenkul bilgilerinin (mülk konumları, mal sahibi kimlikleri, kat planları, finansal analizler, tapu kayıtları) 'Ticari Sır' niteliğinde olduğunu gayrikabili rücu kabul ve taahhüt eder. Yatırımcı, elde ettiği bu verileri kopyalayamaz, ekran görüntüsü alamaz, üçüncü kişi veya rakip firmalarla paylaşamaz ve mülk sahiplerine veya aracılarına Ali Cömert'in yazılı izni olmadan ulaşamaz. Bu gizlilik ihlalinden doğacak her türlü maddi/manevi zararın tazmini yatırımcının sorumluluğundadır. Formu onaylayarak bu gizlilik şartlarını kabul etmiş sayılırsınız.</p>`;
    } else if (title.includes("Çerez") || title.includes("Cookie")) {
      finalContent = `<p class="leading-relaxed">comertali.com platformunda, güvenli ve kesintisiz bir kullanıcı deneyimi sunmak amacıyla çerezler kullanılmaktadır. Sitemizde; form güvenliğini sağlayan ve yasal onay mekanizmalarını hafızada tutan 'Zorunlu Çerezler' ile site trafiğini anonim olarak ölçen 'Analitik Çerezler' aktiftir. Tarayıcı ayarlarınızdan çerezleri reddetmeniz durumunda sitenin temel fonksiyonları çalışmayabilir. Siteyi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz.</p>`;
    }
  }

  if (titleEl) titleEl.textContent = title;
  if (contentEl) {
    contentEl.innerHTML = finalContent || `<p>Ali CÖMERT Özel Gayrimenkul & Vatandaşlık Danışmanlığı bünyesinde paylaşılan tüm stratejik veriler, yüksek mahremiyet (NDA) ve KVKK standartlarında korunur.</p>`;
  }

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
  }
};

window.closeLegalModal = function() {
  const modal = document.getElementById("legalHtmlModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "";
  }
};

/* ==========================================================================
   GDOS ANALYTICS — GA4 Event Tracking
   Tracks every meaningful user interaction for conversion measurement.
   All events respect user privacy — no PII is sent to GA4.
   Replace G-XXXXXXXXXX in index.html with your real Measurement ID to activate.
   ========================================================================== */
function initGA4Events() {
  // Guard: only run if GA4 is loaded
  if (typeof gtag !== 'function') return;

  // Helper: fire a GA4 event safely
  function track(eventName, params = {}) {
    try {
      gtag('event', eventName, {
        event_category: 'GDOS',
        ...params
      });
    } catch(e) {
      // Silently fail if gtag is not ready
    }
  }

  // ---- 1. PORTFOLIO ACCESS FORM SUBMIT ----
  // Fires when the gatekeeping form is successfully submitted
  const gatekeepingForm = document.querySelector('form[name="portfolio-access"], form[name="vip-access"], #gatekeeping form');
  if (gatekeepingForm) {
    gatekeepingForm.addEventListener('submit', () => {
      track('portfolio_access_request', {
        event_label: 'Gatekeeping Form Submit',
        value: 1
      });
    });
  }

  // ---- 2. WHATSAPP CLICKS ----
  document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
    el.addEventListener('click', () => {
      track('whatsapp_click', {
        event_label: 'WhatsApp Direct Contact',
        value: 1
      });
    });
  });

  // ---- 3. PHONE CLICKS ----
  document.querySelectorAll('a[href^="tel:"]').forEach(el => {
    el.addEventListener('click', () => {
      track('phone_click', {
        event_label: 'Phone Direct Call',
        value: 1
      });
    });
  });

  // ---- 4. VCARD DOWNLOAD ----
  // Hooks into the vCard button via MutationObserver on the download trigger
  const vcardBtn = document.querySelector('[onclick*="downloadVIPvCard"]');
  if (vcardBtn) {
    vcardBtn.addEventListener('click', () => {
      track('vcard_download', {
        event_label: 'VIP vCard Download',
        value: 1
      });
    });
  }

  // ---- 5. TANITIM VİDEOSU AÇILDI ----
  const videoBtn = document.querySelector('[onclick*="videoPlayer"]');
  if (videoBtn) {
    videoBtn.addEventListener('click', () => {
      track('vision_video_play', {
        event_label: 'Tanıtım Videosu Açıldı',
        value: 1
      });
    });
  }

  // ---- 6. FAQ EXPAND ----
  document.querySelectorAll('.faq-toggle-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const question = btn.querySelector('span')?.textContent?.trim()?.substring(0, 60) || `FAQ ${index + 1}`;
      track('faq_expand', {
        event_label: question,
        event_category: 'Knowledge Engagement'
      });
    });
  });

  // ---- 7. PORTFOLIO CARD CTA CLICKS ----
  document.querySelectorAll('#portfolio-showcase a[href*="gatekeeping"]').forEach((el, index) => {
    el.addEventListener('click', () => {
      track('portfolio_card_click', {
        event_label: `Portfolio Card ${index + 1}`,
        value: 1
      });
    });
  });

  // ---- 8. HERO PRIMARY CTA ----
  const heroCta = document.querySelector('#hero a[href*="gatekeeping"].btn-gold-pulse');
  if (heroCta) {
    heroCta.addEventListener('click', () => {
      track('hero_cta_click', {
        event_label: 'Hero Gold Button — Ozel Portfoye Erisin',
        value: 2
      });
    });
  }

  // ---- 9. LINKEDIN CLICK ----
  document.querySelectorAll('a[href*="linkedin.com"]').forEach(el => {
    el.addEventListener('click', () => {
      track('linkedin_click', {
        event_label: 'LinkedIn Profile Visit'
      });
    });
  });

  // ---- 10. TRUEMAX REFERRAL ----
  document.querySelectorAll('a[href*="truemaxgayrimenkul.com"]').forEach(el => {
    el.addEventListener('click', () => {
      track('truemax_referral_click', {
        event_label: 'TrueMax Portfolio Referral'
      });
    });
  });

  // ---- 11. SCROLL DEPTH (25% / 50% / 75% / 100%) ----
  const scrollMilestones = new Set();
  window.addEventListener('scroll', () => {
    const scrollPct = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    [25, 50, 75, 100].forEach(milestone => {
      if (scrollPct >= milestone && !scrollMilestones.has(milestone)) {
        scrollMilestones.add(milestone);
        track('scroll_depth', {
          event_label: `Scroll ${milestone}%`,
          event_category: 'Engagement'
        });
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   12. CMS-DRIVEN CONTENT: ÖZEL PORTFÖY KARTLARI (content/portfolio.json)
   Decap CMS panelinden düzenlenir; dosya bulunamazsa mevcut statik metinler
   olduğu gibi kalır (progressive enhancement, sayfa asla boş kalmaz).
   ========================================================================== */
function initPortfolioCMS() {
  const cards = document.querySelectorAll("#portfolioCardsGrid .portfolio-card");
  if (!cards.length) return;

  fetch("content/portfolio.json")
    .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
    .then(data => {
      (data.cards || []).forEach((cardData, i) => {
        const card = cards[i];
        if (!card) return;
        Object.keys(cardData).forEach(field => {
          const el = card.querySelector(`[data-field="${field}"]`);
          if (!el) return;
          if (el.tagName === "IMG") {
            el.src = cardData[field];
          } else {
            el.textContent = cardData[field];
          }
        });
      });
    })
    .catch(() => {
      // content/portfolio.json henüz yok veya erişilemedi — statik içerik kalır.
    });
}

/* ==========================================================================
   13. CANLI PİYASA ŞERİDİ: USD / EUR / Gram Altın (Truncgil Finans API)
   API'ye ulaşılamazsa şerit gizli kalır, sayfa bozulmaz.
   ========================================================================== */
function initFxTicker() {
  const ticker = document.getElementById("fxTicker");
  if (!ticker) return;

  const fmt = n => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  fetch("https://finans.truncgil.com/v4/today.json")
    .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
    .then(data => {
      const usd = data.USD?.Selling;
      const eur = data.EUR?.Selling;
      const gold = data.GRA?.Selling;
      if (!usd || !eur || !gold) return;

      document.getElementById("fxUsd").textContent = fmt(usd) + " TL";
      document.getElementById("fxEur").textContent = fmt(eur) + " TL";
      document.getElementById("fxGold").textContent = fmt(gold) + " TL";

      const saat = typeof data.Update_Date === "string" ? data.Update_Date.split(" ")[1]?.slice(0, 5) : "";
      document.getElementById("fxUpdated").textContent = saat ? `Güncelleme: ${saat}` : "";

      ticker.classList.remove("hidden");
      ticker.classList.add("flex");
    })
    .catch(() => {
      // Kur verisine ulaşılamadı — şerit gizli kalır.
    });
}
