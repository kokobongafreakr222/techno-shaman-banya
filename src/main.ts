/**
 * @fileoverview ТехноШаманская Баня - Main Entry Point
 * @description Рефакторенная версия с модульной архитектурой,
 * улучшенной производительностью и безопасностью
 * @version 2.0.0
 */

import * as PIXI from 'pixi.js';
import './style.css';
import { MatrixRain } from './effects/MatrixRain.js';
import { NeonParticles } from './effects/NeonParticles.js';
import { NeonGrid } from './effects/NeonGrid.js';
import { ClickEffects } from './effects/ClickEffects.js';
import { Parallax } from './effects/Parallax.js';
import { CountdownTimer } from './utils/CountdownTimer.js';
import { isWebGLSupported, throttle } from './utils/performance.js';
import type { Effect, MouseReactive } from './types/index.js';

/**
 * Основной класс приложения
 */
class TechnoShamanApp {
  private app: PIXI.Application | null = null;
  private effects: Effect[] = [];
  private mouseReactiveEffects: MouseReactive[] = [];
  private clickEffects: ClickEffects | null = null;
  private parallax: Parallax | null = null;
  private countdownTimer: CountdownTimer | null = null;
  private isRunning = false;

  /** @returns состояние приложения */
  get running(): boolean { return this.isRunning; }

  /**
   * Инициализация приложения
   */
  async init(): Promise<void> {
    try {
      // Проверка поддержки WebGL
      if (!isWebGLSupported()) {
        console.warn('WebGL не поддерживается, эффекты отключены');
        this.initFallback();
        return;
      }

      await this.initPixi();
      this.initEffects();
      this.initDOMEffects();
      this.attachEventListeners();
      
      this.isRunning = true;
      this.logWelcome();
    } catch (error) {
      console.error('Ошибка инициализации:', error);
      this.initFallback();
    }
  }

  /**
   * Инициализация PixiJS
   */
  private async initPixi(): Promise<void> {
    const canvas = document.getElementById('webgl-bg') as HTMLCanvasElement | null;
    if (!canvas) {
      throw new Error('Canvas элемент #webgl-bg не найден');
    }

    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2), // Ограничение для производительности
      autoDensity: true,
      powerPreference: 'high-performance',
    });

    // Обработка resize
    window.addEventListener('resize', throttle(() => this.handleResize(), 100));
  }

  /**
   * Инициализация эффектов
   */
  private initEffects(): void {
    if (!this.app) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Matrix Rain
    const matrixRain = new MatrixRain(this.app, width, height);
    matrixRain.init();
    this.effects.push(matrixRain);
    this.mouseReactiveEffects.push(matrixRain);
    this.app.stage.addChild(matrixRain.container);

    // Neon Grid
    const neonGrid = new NeonGrid(width, height);
    neonGrid.init();
    this.effects.push(neonGrid);
    this.app.stage.addChild(neonGrid.container);

    // Neon Particles
    const neonParticles = new NeonParticles(this.app, width, height, { count: 40 }); // Уменьшено для производительности
    neonParticles.init();
    this.effects.push(neonParticles);
    this.mouseReactiveEffects.push(neonParticles);
    this.app.stage.addChild(neonParticles.container);

    // Запуск анимационного цикла
    this.app.ticker.add((ticker) => this.animate(ticker.deltaTime));
  }

  /**
   * Инициализация DOM-эффектов
   */
  private initDOMEffects(): void {
    // Эффекты клика
    this.clickEffects = new ClickEffects({
      duration: 600,
      scale: 4,
      hueMin: 120,
      hueMax: 180,
    });
    this.clickEffects.init();

    // Параллакс
    this.parallax = new Parallax({
      baseSpeed: 0.5,
      speedIncrement: 0.1,
    });
    this.parallax.init();

    // Таймер
    this.countdownTimer = new CountdownTimer({ endOfDay: true });
    this.countdownTimer.init('countdown');
  }

  /**
   * Подключение слушателей событий
   */
  private attachEventListeners(): void {
    // Throttled mousemove для производительности (~60fps)
    window.addEventListener('mousemove', throttle((e: MouseEvent) => {
      this.mouseReactiveEffects.forEach(effect => {
        effect.onMouseMove(e.clientX, e.clientY);
      });
    }, 16));
  }

  /**
   * Обработка изменения размера окна
   */
  private handleResize(): void {
    if (!this.app) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.app.renderer.resize(width, height);

    // Обновление размеров эффектов
    this.effects.forEach(effect => {
      if ('resize' in effect) {
        (effect as unknown as { resize(w: number, h: number): void }).resize(width, height);
      }
    });
  }

  /**
   * Анимационный цикл
   */
  private animate(delta: number): void {
    const time = Date.now() * 0.001;

    this.effects.forEach(effect => {
      effect.update(delta, time);
    });
  }

  /**
   * Fallback для старых браузеров
   */
  private initFallback(): void {
    console.log('Запуск в fallback режиме (без WebGL эффектов)');
    
    // Просто таймер и базовые эффекты
    this.countdownTimer = new CountdownTimer({ endOfDay: true });
    this.countdownTimer.init('countdown');
  }

  /**
   * Лог приветствия
   */
  private logWelcome(): void {
    console.log(
      '%c🔮 ТЕХНОШАМАНСКАЯ БАНЯ v2.0',
      'color: #00ffff; font-size: 20px; font-weight: bold;'
    );
    console.log(
      '%cРефакторенная версия с модульной архитектурой',
      'color: #ff00ff; font-size: 12px;'
    );
  }

  /**
   * Уничтожение приложения и очистка ресурсов
   */
  dispose(): void {
    this.isRunning = false;

    // Очистка эффектов
    this.effects.forEach(effect => effect.dispose());
    this.effects = [];
    this.mouseReactiveEffects = [];

    // Очистка DOM эффектов
    this.clickEffects?.dispose();
    this.clickEffects = null;

    this.parallax?.dispose();
    this.parallax = null;

    this.countdownTimer?.dispose();
    this.countdownTimer = null;

    // Очистка Pixi
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new TechnoShamanApp();
  app.init();

  // Для отладки
  (window as unknown as Record<string, unknown>).technoShamanApp = app;
});

// Экспорт для тестирования
export { TechnoShamanApp };
