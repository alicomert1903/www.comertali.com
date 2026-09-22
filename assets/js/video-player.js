/**
 * ALİ CÖMERT - Tanıtım Videosu Modal Oynatıcı
 * Modalı açar/kapatır ve native <video> elementini kontrol eder.
 */

class VisionVideoPlayer {
  openModal() {
    const modal = document.getElementById("videoVisionModal");
    const video = document.getElementById("visionVideo");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";
    }
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }

  closeModal() {
    const modal = document.getElementById("videoVisionModal");
    const video = document.getElementById("visionVideo");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
    }
    if (video) {
      video.pause();
    }
  }
}

window.videoPlayer = new VisionVideoPlayer();
