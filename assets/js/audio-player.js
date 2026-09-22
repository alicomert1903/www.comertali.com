/**
 * Ali CÖMERT - Audio Vision Player (v3 Cache Busting Edition)
 * Powers the "Vizyonu Dinleyin" studio-quality experience with visualizer and interactive executive speech transcript.
 */

class LuxuryVisionAudioPlayer {
  constructor() {
    this.isPlaying = false;
    this.timer = null;
    this.duration = 42; // seconds
    this.currentTime = 0;
    
    this.manifestoSegments = [
      { time: 0, text: "Merhaba, ben Ali Cömert. TrueMax Gayrimenkul bünyesinde, Ankara geneli lüks konut ve tüm Türkiye vatandaşlık portföyümüze hoş geldiniz." },
      { time: 7, text: "Gayrimenkul yatırımı; sadece bir metrekare veya lokasyon seçimi değil, zamanın, riskin ve sermayenin kusursuz bir matematikle yönetilmesidir." },
      { time: 16, text: "Sistem mühendisliği altyapım ve profesyonel iş disiplinimle; portföy yönetimini ve vatandaşlık süreçlerini sıfır hata prensibiyle kurguluyorum." },
      { time: 25, text: "Benimle çalıştığınızda, tesadüflerle veya şişirilmiş vaatlerle değil; sadece analitik verilere dayanan kesin sonuçlarla karşılaşırsınız." },
      { time: 34, text: "Zamanınızın ve yatırımınızın değerini biliyorum. Sizi de bu şeffaf ve profesyonel yatırım ağına davet ediyorum." }
    ];
  }

  getAudioElement() {
    let el = document.getElementById("vizyon-audio");
    if (!el) {
      el = new Audio("./vizyon_v2.wav");
      el.id = "vizyon-audio";
      el.preload = "auto";
      document.body.appendChild(el);
    } else if (!el.getAttribute("src") || el.getAttribute("src") === "") {
      el.src = "./vizyon_v2.wav";
    }
    return el;
  }

  openModal() {
    const modal = document.getElementById("audioVisionModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";
      this.play();
    }
  }

  closeModal() {
    const modal = document.getElementById("audioVisionModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
      this.pause();
      this.reset();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.isPlaying) return;
    const audioEl = this.getAudioElement();
    
    this.isPlaying = true;
    if (audioEl.readyState === 0) {
      audioEl.load();
    }
    audioEl.play().catch(e => {
      console.error("Audio play error, retrying load:", e);
      audioEl.src = "./vizyon_v2.wav";
      audioEl.load();
      audioEl.play().catch(err => console.error("Retry play failed:", err));
    });
    this.updateUI();

    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (audioEl && !audioEl.paused) {
        this.currentTime = audioEl.currentTime || 0;
        if (audioEl.duration && !isNaN(audioEl.duration) && audioEl.duration > 0) {
          this.duration = audioEl.duration;
        }
      } else if (!audioEl || audioEl.error) {
        this.currentTime += 0.5;
      }

      if (this.currentTime >= this.duration) {
        this.pause();
        this.reset();
      } else {
        this.updateProgress();
      }
    }, 250);

    audioEl.onended = () => {
      this.pause();
      this.reset();
    };
  }

  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    const audioEl = this.getAudioElement();
    if (audioEl) {
      try { audioEl.pause(); } catch(e) {}
    }
    if (this.timer) clearInterval(this.timer);
    this.updateUI();
  }

  reset() {
    this.pause();
    const audioEl = this.getAudioElement();
    if (audioEl) {
      try { audioEl.currentTime = 0; } catch (e) {}
    }
    this.currentTime = 0;
    this.updateProgress();
  }

  updateProgress() {
    const progressEl = document.getElementById("audioProgressBar");
    const timeDisplay = document.getElementById("audioTimeDisplay");
    const transcriptEl = document.getElementById("audioTranscriptText");

    if (progressEl) {
      const percentage = (this.currentTime / this.duration) * 100;
      progressEl.style.width = `${Math.min(percentage, 100)}%`;
    }

    if (timeDisplay) {
      const mins = Math.floor(this.currentTime / 60);
      const secs = Math.floor(this.currentTime % 60);
      const durMins = Math.floor(this.duration / 60);
      const durSecs = Math.floor(this.duration % 60);
      timeDisplay.textContent = `0${mins}:${secs < 10 ? '0' : ''}${secs} / 0${durMins}:${durSecs < 10 ? '0' : ''}${durSecs}`;
    }

    if (transcriptEl) {
      let activeText = this.manifestoSegments[0].text;
      for (let i = 0; i < this.manifestoSegments.length; i++) {
        if (this.currentTime >= this.manifestoSegments[i].time) {
          activeText = this.manifestoSegments[i].text;
        }
      }
      if (transcriptEl.textContent !== activeText) {
        transcriptEl.style.opacity = 0;
        setTimeout(() => {
          transcriptEl.textContent = activeText;
          transcriptEl.style.opacity = 1;
        }, 200);
      }
    }
  }

  updateUI() {
    const playBtnIcon = document.getElementById("audioPlayPauseIcon");
    const playBtnText = document.getElementById("audioPlayPauseText");
    const waveBars = document.querySelectorAll(".audio-bar");
    const statusDot = document.getElementById("audioStatusDot");

    if (this.isPlaying) {
      if (playBtnIcon) playBtnIcon.className = "fas fa-pause text-navy";
      if (playBtnText) playBtnText.textContent = "Duraklat";
      waveBars.forEach(bar => bar.style.animationPlayState = "running");
      if (statusDot) statusDot.className = "w-3 h-3 rounded-full bg-[#D4AF37] animate-ping inline-block mr-2";
    } else {
      if (playBtnIcon) playBtnIcon.className = "fas fa-play text-navy";
      if (playBtnText) playBtnText.textContent = "Oynat";
      waveBars.forEach(bar => bar.style.animationPlayState = "paused");
      if (statusDot) statusDot.className = "w-3 h-3 rounded-full bg-slate-500 inline-block mr-2";
    }
  }
}

window.visionPlayer = new LuxuryVisionAudioPlayer();
