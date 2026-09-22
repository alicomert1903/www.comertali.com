/**
 * Ali CÖMERT — VIP vCard Contact Generator & Downloader
 * Generates an official vCard (.vcf) file on the fly with complete consultancy contact details.
 */

function downloadVIPvCard() {
  const vcardContent = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:CÖMERT;Ali;;;",
    "FN:Ali CÖMERT | Ankara Gayrimenkul Stratejisti — TrueMax Danışmanlık",
    "ORG:TrueMax Gayrimenkul",
    "TITLE:Ankara Gayrimenkul Stratejisti | Yatırım Danışmanı",
    "TEL;TYPE=WORK,VOICE:+905322384039",
    "TEL;TYPE=CELL,VOICE:+905322384039",
    "EMAIL;TYPE=PREF,INTERNET:info@comertali.com",
    "URL:https://comertali.com",
    "ADR;TYPE=WORK:;;Prof. Dr. Ahmet Taner Kışlalı Mah. 2812. Cad. No:43 İLKO SİTESİ;Çankaya;Ankara;06810;Turkey",
    "NOTE:Ankara bölge bazlı gayrimenkul analizi, off-market portföy erişimi ve Yatırım Yoluyla Türk Vatandaşlığı danışmanlığı. TrueMax Gayrimenkul bünyesinde.",
    "REV:" + new Date().toISOString(),
    "END:VCARD"
  ].join("\r\n");

  const blob = new Blob([vcardContent], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.setAttribute("download", "ali_comert.vcf");
  document.body.appendChild(downloadLink);
  
  downloadLink.click();
  
  setTimeout(() => {
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }, 300);

  // Show subtle toast or console confirmation
  if (window.showLuxuryToast) {
    window.showLuxuryToast("VIP İletişim Kartı cihazınıza kaydediliyor...", "gold");
  } else {
    console.log("[ComertAli Intelligence] vCard generated and triggered download.");
  }
}

window.downloadVIPvCard = downloadVIPvCard;
