import * as PIXI from 'pixi.js';
import './style.css';

// ============================================
// ТЕХНОШАМАНСКАЯ БАНЯ - WebGL ЭФФЕКТЫ НА PixiJS
// ============================================

interface Particle {
  sprite: PIXI.Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface CodeDrop {
  text: PIXI.Text;
  speed: number;
  column: number;
}

class TechnoShamanBackground {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private particles: Particle[] = [];
  private codeDrops: CodeDrop[] = [];
  private neonLines: PIXI.Graphics[] = [];
  private matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  private mouseX = 0;
  private mouseY = 0;
  private width = window.innerWidth;
  private height = window.innerHeight;

  constructor() {
    // Инициализация PixiJS приложения
    this.app = new PIXI.Application({
      view: document.getElementById('webgl-bg') as HTMLCanvasElement,
      width: this.width,
      height: this.height,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    // События мыши для интерактивности
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Ресайз
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.app.renderer.resize(this.width, this.height);
    });

    // Инициализация эффектов
    this.initCodeRain();
    this.initParticles();
    this.initNeonGrid();
    
    // Запуск анимации
    this.app.ticker.add((ticker) => this.animate(ticker.deltaTime));
  }

  // ============================================
  // ЭФФЕКТ 1: КОДОВЫЙ ДОЖДЬ (Matrix-style)
  // ============================================
  private initCodeRain(): void {
    const columns = Math.floor(this.width / 20);
    
    for (let i = 0; i < columns; i++) {
      const char = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
      const colors = ['#00ff00', '#00ffff', '#ff00ff'];
      const text = new PIXI.Text(char, {
        fontFamily: 'Share Tech Mono',
        fontSize: 14 + Math.random() * 10,
        fill: colors[Math.floor(Math.random() * 3)],
      });
      text.alpha = 0.3 + Math.random() * 0.4;

      text.x = i * 20;
      text.y = Math.random() * this.height;
      
      this.container.addChild(text);
      
      this.codeDrops.push({
        text,
        speed: 1 + Math.random() * 3,
        column: i,
      });
    }
  }

  // ============================================
  // ЭФФЕКТ 2: НЕОНОВЫЕ ЧАСТИЦЫ
  // ============================================
  private initParticles(): void {
    const particleCount = 50;
    const colors = [0xff00ff, 0x00ffff, 0x39ff14, 0xff6600];

    for (let i = 0; i < particleCount; i++) {
      const graphics = new PIXI.Graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 2 + Math.random() * 4;

      graphics.beginFill(color);
      graphics.drawCircle(0, 0, size);
      graphics.endFill();

      // Glow эффект
      graphics.beginFill(color, 0.3);
      graphics.drawCircle(0, 0, size * 2);
      graphics.endFill();

      const texture = this.app.renderer.generateTexture(graphics);
      const sprite = new PIXI.Sprite(texture);

      sprite.x = Math.random() * this.width;
      sprite.y = Math.random() * this.height;
      sprite.alpha = 0.3 + Math.random() * 0.7;

      this.container.addChild(sprite);

      this.particles.push({
        sprite,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 0,
        maxLife: 100 + Math.random() * 200,
      });
    }
  }

  // ============================================
  // ЭФФЕКТ 3: НЕОНОВАЯ СЕТКА
  // ============================================
  private initNeonGrid(): void {
    const gridSize = 80;
    const cols = Math.ceil(this.width / gridSize) + 1;
    const rows = Math.ceil(this.height / gridSize) + 1;

    // Горизонтальные линии
    for (let y = 0; y < rows; y++) {
      const line = new PIXI.Graphics();
      line.lineStyle(1, 0x00ffff, 0.1);
      line.moveTo(0, y * gridSize);
      line.lineTo(this.width, y * gridSize);
      this.container.addChild(line);
      this.neonLines.push(line);
    }

    // Вертикальные линии
    for (let x = 0; x < cols; x++) {
      const line = new PIXI.Graphics();
      line.lineStyle(1, 0xff00ff, 0.1);
      line.moveTo(x * gridSize, 0);
      line.lineTo(x * gridSize, this.height);
      this.container.addChild(line);
      this.neonLines.push(line);
    }
  }

  // ============================================
  // АНИМАЦИЯ
  // ============================================
  private animate(delta: number): void {
    const time = Date.now() * 0.001;

    // Анимация кодового дождя
    this.codeDrops.forEach((drop, index) => {
      drop.text.y += drop.speed * delta;
      
      // Мерцание
      drop.text.alpha = 0.2 + Math.sin(time * 3 + index) * 0.2;
      
      // Сброс позиции
      if (drop.text.y > this.height) {
        drop.text.y = -30;
        // Случайная смена символа
        drop.text.text = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
      }

      // Отталкивание от мыши
      const dx = drop.text.x - this.mouseX;
      const dy = drop.text.y - this.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 100) {
        const force = (100 - dist) / 100;
        drop.text.x += (dx / dist) * force * 5;
      }
      
      // Возврат в колонку
      const targetX = drop.column * 20;
      drop.text.x += (targetX - drop.text.x) * 0.05;
    });

    // Анимация частиц
    this.particles.forEach((particle, index) => {
      // Движение
      particle.sprite.x += particle.vx * delta;
      particle.sprite.y += particle.vy * delta;
      particle.life += delta;

      // Пульсация
      const pulse = Math.sin(time * 2 + index) * 0.3 + 0.7;
      particle.sprite.alpha = pulse * 0.6;
      particle.sprite.scale.set(pulse);

      // Границы экрана
      if (particle.sprite.x < 0 || particle.sprite.x > this.width) {
        particle.vx *= -1;
      }
      if (particle.sprite.y < 0 || particle.sprite.y > this.height) {
        particle.vy *= -1;
      }

      // Притяжение к мыши
      const dx = this.mouseX - particle.sprite.x;
      const dy = this.mouseY - particle.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 200 && dist > 0) {
        particle.vx += (dx / dist) * 0.5;
        particle.vy += (dy / dist) * 0.5;
      }

      // Сопротивление
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Респавн
      if (particle.life > particle.maxLife) {
        particle.sprite.x = Math.random() * this.width;
        particle.sprite.y = Math.random() * this.height;
        particle.life = 0;
      }
    });

    // Пульсация сетки
    this.neonLines.forEach((line, index) => {
      const alpha = 0.05 + Math.sin(time + index * 0.1) * 0.05;
      line.alpha = alpha;
    });
  }
}

// ============================================
// ТАЙМЕР ОБРАТНОГО ОТСЧЁТА
// ============================================
function initCountdown(): void {
  const timerElement = document.getElementById('countdown');
  if (!timerElement) return;

  // Устанавливаем конец дня
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  function updateTimer() {
    const current = new Date();
    const diff = endOfDay.getTime() - current.getTime();
    
    if (diff <= 0) {
      timerElement!.textContent = '00:00:00';
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    timerElement!.textContent = 
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ============================================
// ПАРАЛЛАКС ЭФФЕКТ ПРИ СКРОЛЛЕ
// ============================================
function initParallax(): void {
  const sections = document.querySelectorAll('.section');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    sections.forEach((section, index) => {
      const speed = 0.5 + (index * 0.1);
      const yPos = -(scrolled * speed);
      (section as HTMLElement).style.transform = `translateY(${yPos * 0.1}px)`;
    });
  });
}

// ============================================
// НЕОНОВЫЕ ВСПЫШКИ ПРИ КЛИКЕ
// ============================================
function initClickEffects(): void {
  document.addEventListener('click', (e) => {
    const burst = document.createElement('div');
    burst.style.position = 'fixed';
    burst.style.left = e.clientX + 'px';
    burst.style.top = e.clientY + 'px';
    burst.style.width = '10px';
    burst.style.height = '10px';
    burst.style.borderRadius = '50%';
    burst.style.background = `hsl(${Math.random() * 60 + 120}, 100%, 50%)`;
    burst.style.boxShadow = `0 0 20px currentColor, 0 0 40px currentColor`;
    burst.style.pointerEvents = 'none';
    burst.style.zIndex = '9999';
    burst.style.animation = 'clickBurst 0.6s ease-out forwards';
    
    document.body.appendChild(burst);
    
    setTimeout(() => burst.remove(), 600);
  });

  // Добавляем keyframes динамически
  const style = document.createElement('style');
  style.textContent = `
    @keyframes clickBurst {
      0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Запускаем WebGL фон
  new TechnoShamanBackground();
  
  // Запускаем таймер
  initCountdown();
  
  // Параллакс
  initParallax();
  
  // Эффекты клика
  initClickEffects();
  
  // Консоль-лог для дебаггеров
  console.log('%c🔮 ТЕХНОШАМАНСКАЯ БАНЯ ЗАГРУЖЕНА', 'color: #00ffff; font-size: 20px; font-weight: bold;');
  console.log('%cЕсли ты читаешь это — значит цифровые духи уже рядом...', 'color: #ff00ff; font-size: 12px;');
});