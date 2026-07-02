// ---------- Starfield ----------
const skyCanvas = document.getElementById('sky');
const skyCtx = skyCanvas.getContext('2d');
let stars = [];
let shootingStars = [];

function resizeSky() {
  skyCanvas.width = window.innerWidth;
  skyCanvas.height = window.innerHeight;
  buildStars();
}

function buildStars() {
  const count = Math.floor((skyCanvas.width * skyCanvas.height) / 4500);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * skyCanvas.width,
    y: Math.random() * skyCanvas.height,
    r: Math.random() * 1.4 + 0.3,
    baseAlpha: Math.random() * 0.6 + 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.015 + 0.005,
  }));
}

function maybeSpawnShootingStar() {
  if (Math.random() < 0.006 && shootingStars.length < 2) {
    const startX = Math.random() * skyCanvas.width * 0.6;
    const startY = Math.random() * skyCanvas.height * 0.3;
    shootingStars.push({
      x: startX,
      y: startY,
      len: 120 + Math.random() * 80,
      speed: 9 + Math.random() * 6,
      angle: Math.PI / 5,
      life: 1,
    });
  }
}

function drawSky(t) {
  skyCtx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);

  for (const s of stars) {
    const a = s.baseAlpha + Math.sin(t * s.speed + s.phase) * 0.3;
    skyCtx.beginPath();
    skyCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    skyCtx.fillStyle = `rgba(255, 250, 235, ${Math.max(0, a)})`;
    skyCtx.fill();
  }

  maybeSpawnShootingStar();
  shootingStars.forEach((sh) => {
    const dx = Math.cos(sh.angle) * sh.speed;
    const dy = Math.sin(sh.angle) * sh.speed;
    sh.x += dx;
    sh.y += dy;
    sh.life -= 0.012;

    const grad = skyCtx.createLinearGradient(
      sh.x, sh.y,
      sh.x - Math.cos(sh.angle) * sh.len,
      sh.y - Math.sin(sh.angle) * sh.len
    );
    grad.addColorStop(0, `rgba(255,255,255,${sh.life})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');

    skyCtx.strokeStyle = grad;
    skyCtx.lineWidth = 2;
    skyCtx.beginPath();
    skyCtx.moveTo(sh.x, sh.y);
    skyCtx.lineTo(sh.x - Math.cos(sh.angle) * sh.len, sh.y - Math.sin(sh.angle) * sh.len);
    skyCtx.stroke();
  });
  shootingStars = shootingStars.filter((sh) => sh.life > 0 && sh.y < skyCanvas.height + 50);

  requestAnimationFrame(drawSky);
}

window.addEventListener('resize', resizeSky);
resizeSky();
requestAnimationFrame(drawSky);

// ---------- Fireflies ----------
const firefliesContainer = document.getElementById('fireflies');
const FIREFLY_COUNT = 22;

for (let i = 0; i < FIREFLY_COUNT; i++) {
  const el = document.createElement('div');
  el.className = 'firefly';
  el.style.left = Math.random() * 100 + 'vw';
  el.style.top = Math.random() * 100 + 'vh';
  el.style.setProperty('--dx1', (Math.random() * 160 - 80) + 'px');
  el.style.setProperty('--dy1', (Math.random() * 160 - 80) + 'px');
  el.style.setProperty('--dx2', (Math.random() * 160 - 80) + 'px');
  el.style.setProperty('--dy2', (Math.random() * 160 - 80) + 'px');
  el.style.setProperty('--dx3', (Math.random() * 160 - 80) + 'px');
  el.style.setProperty('--dy3', (Math.random() * 160 - 80) + 'px');
  const dur = 14 + Math.random() * 16;
  el.style.animationDuration = `${dur}s, ${2 + Math.random() * 3}s`;
  el.style.animationDelay = `${-Math.random() * dur}s, ${Math.random() * 3}s`;
  firefliesContainer.appendChild(el);
}

// ---------- Screen navigation ----------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---------- Envelope ----------
const envelope = document.getElementById('envelope');
function openEnvelope() {
  if (envelope.classList.contains('open')) return;
  envelope.classList.add('open');
  setTimeout(() => showScreen('letter'), 750);
}
envelope.addEventListener('click', openEnvelope);
envelope.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') openEnvelope();
});

document.getElementById('toQuestion').addEventListener('click', () => showScreen('question'));

// ---------- Dodging "No" button ----------
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const buttonsBox = document.getElementById('buttons');

const noPhrases = [
  'Нет', 'Точно нет?', 'Подумай ещё', 'А если так?', 'Ну пожалуйста',
  'Последний шанс', 'Серьёзно?', 'Не в этот раз', 'Даже не думай',
];
let dodgeCount = 0;
let dodgeLocked = false;

function dodge() {
  if (dodgeLocked) return;
  dodgeLocked = true;
  setTimeout(() => { dodgeLocked = false; }, 280);

  dodgeCount++;
  noBtn.textContent = noPhrases[Math.min(dodgeCount, noPhrases.length - 1)];

  if (!noBtn.classList.contains('dodging')) {
    // Reparent to <body>: .card uses backdrop-filter, which (like transform)
    // creates a new containing block for position:fixed descendants in
    // Chrome, so a fixed child would be positioned relative to the card
    // instead of the viewport. Moving it out keeps the math below correct.
    const startRect = noBtn.getBoundingClientRect();
    document.body.appendChild(noBtn);
    noBtn.classList.add('dodging');
    noBtn.style.left = startRect.left + 'px';
    noBtn.style.top = startRect.top + 'px';
    noBtn.offsetHeight; // force layout so the jump above doesn't get transitioned
  }

  const rect = noBtn.getBoundingClientRect();
  const margin = 20;
  const maxX = window.innerWidth - rect.width - margin;
  const maxY = window.innerHeight - rect.height - margin;

  const newX = Math.min(Math.max(margin, Math.random() * maxX), maxX);
  const newY = Math.min(Math.max(margin, Math.random() * maxY), maxY);
  noBtn.style.left = newX + 'px';
  noBtn.style.top = newY + 'px';

  const scale = Math.min(1 + dodgeCount * 0.06, 1.7);
  yesBtn.style.transform = `scale(${scale})`;
}

noBtn.addEventListener('mouseenter', dodge);
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  dodge();
}, { passive: false });
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  dodge();
});

// ---------- Yes ----------
yesBtn.addEventListener('click', () => {
  noBtn.style.display = 'none';
  showScreen('final');
  launchConfetti();
  launchHearts();
});

// ---------- Confetti ----------
const confettiCanvas = document.getElementById('confetti');
const cctx = confettiCanvas.getContext('2d');
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

const confettiColors = ['#f3d9a4', '#ff9ac1', '#b892ff', '#ffffff', '#ffd58a'];

function launchConfetti() {
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * confettiCanvas.height * 0.5,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 8,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 2,
    rot: Math.random() * Math.PI,
    rotSpeed: (Math.random() - 0.5) * 0.2,
    life: 0,
    maxLife: 260 + Math.random() * 120,
  }));

  function frame() {
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;
    pieces.forEach((p) => {
      if (p.life >= p.maxLife) return;
      alive = true;
      p.life++;
      p.x += p.speedX;
      p.y += p.speedY;
      p.rot += p.rotSpeed;
      cctx.save();
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rot);
      cctx.fillStyle = p.color;
      cctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
      cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cctx.restore();
    });
    if (alive) requestAnimationFrame(frame);
    else cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
  frame();
}

// ---------- Floating hearts ----------
function launchHearts() {
  const count = 24;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.textContent = '♡';
      heart.style.position = 'fixed';
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.bottom = '-40px';
      heart.style.fontSize = (16 + Math.random() * 22) + 'px';
      heart.style.color = ['#ff9ac1', '#f3d9a4', '#b892ff'][Math.floor(Math.random() * 3)];
      heart.style.textShadow = '0 0 10px rgba(255,154,193,0.7)';
      heart.style.zIndex = '11';
      heart.style.pointerEvents = 'none';
      heart.style.transition = `transform ${4 + Math.random() * 3}s linear, opacity ${4 + Math.random() * 3}s linear`;
      document.body.appendChild(heart);
      requestAnimationFrame(() => {
        heart.style.transform = `translateY(-${window.innerHeight + 100}px) translateX(${(Math.random() - 0.5) * 200}px) rotate(${(Math.random() - 0.5) * 90}deg)`;
        heart.style.opacity = '0';
      });
      setTimeout(() => heart.remove(), 7500);
    }, i * 120);
  }
}
