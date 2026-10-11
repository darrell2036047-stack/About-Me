(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderStatus = document.getElementById('loaderStatus');
  const loadingStarted = performance.now();
  const loadingDuration = reduceMotion ? 180 : 1650;
  const loadingStages = [
    [0, 'MENYIAPKAN PENGALAMAN'],
    [35, 'MEMUAT PROFIL'],
    [72, 'MENYUSUN ANTARMUKA'],
    [94, 'HAMPIR SIAP']
  ];
  let loadFrame;
  function animateLoader(now) {
    const raw = Math.min(1, (now - loadingStarted) / loadingDuration);
    // Smooth progress with a short finishing pause for a polished opening.
    const eased = 1 - Math.pow(1 - raw, 2.2);
    const percent = Math.min(100, Math.round(eased * 100));
    if (loaderFill) loaderFill.style.width = percent + '%';
    if (loaderPercent) loaderPercent.textContent = percent + '%';
    const stage = [...loadingStages].reverse().find(item => percent >= item[0]);
    if (stage && loaderStatus) loaderStatus.textContent = stage[1];
    if (raw < 1) loadFrame = requestAnimationFrame(animateLoader);
    else {
      if (loaderStatus) loaderStatus.textContent = 'SELAMAT DATANG';
      window.setTimeout(() => loader.classList.add('hide'), reduceMotion ? 80 : 220);
    }
  }
  if (reduceMotion) {
    loaderFill.style.width = '100%';
    loaderPercent.textContent = '100%';
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('hide'), 180), {once:true});
  } else {
    loadFrame = requestAnimationFrame(animateLoader);
    window.addEventListener('load', () => {
      if (!loadFrame) loadFrame = requestAnimationFrame(animateLoader);
    }, {once:true});
  }
  // Small synthesized click sound. Gain is set to 0.5 (50%) and no audio file is needed.
  let audioContext;
  function clickSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioContext) audioContext = new AudioContext();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      const master = audioContext.createGain();
      master.gain.setValueAtTime(1.0, now); // 100% sound level
      master.connect(audioContext.destination);
      [[740, 0, 0.075], [988, 0.035, 0.09]].forEach(([frequency, delay, duration]) => {
        const osc = audioContext.createOscillator();
        const envelope = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, now + delay);
        envelope.gain.setValueAtTime(0.0001, now + delay);
        envelope.gain.exponentialRampToValueAtTime(0.22, now + delay + 0.012);
        envelope.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
        osc.connect(envelope); envelope.connect(master);
        osc.start(now + delay); osc.stop(now + delay + duration + 0.01);
      });
    } catch (e) { /* Sound is optional when the browser blocks audio. */ }
  }
  let firstInteraction = true;
  document.addEventListener('click', e => {
    if (e.target.closest('a, button')) {
      clickSound();
      // Browsers block unsolicited autoplay. On the first real interaction,
      // play a subtle welcome chime if the loader is still visible.
      if (firstInteraction && !loader.classList.contains('hide')) {
        firstInteraction = false;
      }
    }
  });
  const menuBtn = document.getElementById('menuBtn');
  const navlinks = document.getElementById('navlinks');
  menuBtn.addEventListener('click', () => {
    const open = navlinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? '×' : '☰';
  });
  navlinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navlinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = '☰';
  }));
  const topBtn = document.getElementById('backTop');
  window.addEventListener('scroll', () => topBtn.classList.toggle('show', window.scrollY > 450), {passive:true});
  topBtn.addEventListener('click', () => window.scrollTo({top:0,behavior:reduceMotion?'auto':'smooth'}));
  document.getElementById('year').textContent = new Date().getFullYear();
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));
})();
