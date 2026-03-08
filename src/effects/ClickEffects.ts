/**
 * @fileoverview Эффекты при клике
 * @module effects/ClickEffects
 */

import type { Disposable } from '../types/index.js';

/**
 * Конфигурация эффектов клика
 */
interface ClickEffectConfig {
  duration: number;
  scale: number;
  hueMin: number;
  hueMax: number;
}

/**
 * Класс для создания визуальных эффектов при клике
 * Безопасная реализация без innerHTML
 */
export class ClickEffects implements Disposable {
  private config: ClickEffectConfig;
  private styleElement: HTMLStyleElement | null = null;
  private isActive = false;

  constructor(config: Partial<ClickEffectConfig> = {}) {
    this.config = {
      duration: 600,
      scale: 4,
      hueMin: 120,
      hueMax: 180,
      ...config,
    };
  }

  /**
   * Инициализация эффектов
   */
  init(): void {
    if (this.isActive) return;
    
    this.injectStyles();
    this.attachListeners();
    this.isActive = true;
  }

  /**
   * Инъекция CSS стилей (безопасно)
   */
  private injectStyles(): void {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.textContent = `
      .click-burst {
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      
      @keyframes clickBurst {
        0% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(${this.config.scale});
          opacity: 0;
        }
      }
      
      .click-burst.animate {
        animation: clickBurst ${this.config.duration}ms ease-out forwards;
      }
    `;
    
    document.head.appendChild(this.styleElement);
  }

  /**
   * Подключение слушателей событий
   */
  private attachListeners(): void {
    document.addEventListener('click', this.handleClick);
  }

  /**
   * Обработчик клика
   */
  private handleClick = (e: MouseEvent): void => {
    this.createBurst(e.clientX, e.clientY);
  };

  /**
   * Создание вспышки (без innerHTML!)
   */
  private createBurst(x: number, y: number): void {
    const burst = document.createElement('div');
    burst.className = 'click-burst animate';
    
    // Безопасное позиционирование
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    
    // Случайный цвет через HSL
    const hue = this.config.hueMin + Math.random() * (this.config.hueMax - this.config.hueMin);
    const color = `hsl(${hue}, 100%, 50%)`;
    burst.style.background = color;
    burst.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
    
    document.body.appendChild(burst);
    
    // Удаление после анимации
    setTimeout(() => {
      if (burst.parentNode) {
        burst.parentNode.removeChild(burst);
      }
    }, this.config.duration);
  }

  /**
   * Остановка эффектов
   */
  stop(): void {
    if (!this.isActive) return;
    
    document.removeEventListener('click', this.handleClick);
    this.isActive = false;
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    this.stop();
    
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }
}
