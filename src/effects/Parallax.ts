/**
 * @fileoverview Параллакс эффект для секций
 * @module effects/Parallax
 */

import type { Disposable } from '../types/index.js';
import { rafThrottle } from '../utils/performance.js';

/**
 * Конфигурация параллакса
 */
interface ParallaxConfig {
  baseSpeed: number;
  speedIncrement: number;
  selector: string;
}

/**
 * Класс для параллакс эффекта при скролле
 */
export class Parallax implements Disposable {
  private config: ParallaxConfig;
  private sections: HTMLElement[] = [];
  private handleScroll: () => void;
  private isActive = false;

  constructor(config: Partial<ParallaxConfig> = {}) {
    this.config = {
      baseSpeed: 0.5,
      speedIncrement: 0.1,
      selector: '.section',
      ...config,
    };
    
    // RAF throttle для производительности
    this.handleScroll = rafThrottle(() => this.update());
  }

  /**
   * Инициализация параллакса
   */
  init(): void {
    if (this.isActive) return;
    
    this.sections = Array.from(document.querySelectorAll(this.config.selector));
    
    if (this.sections.length === 0) {
      console.warn(`Parallax: элементы с селектором "${this.config.selector}" не найдены`);
      return;
    }
    
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.isActive = true;
    this.update();
  }

  /**
   * Обновление позиций секций
   */
  private update(): void {
    const scrolled = window.pageYOffset;
    
    this.sections.forEach((section, index) => {
      const speed = this.config.baseSpeed + (index * this.config.speedIncrement);
      const yPos = -(scrolled * speed * 0.1);
      section.style.transform = `translateY(${yPos}px)`;
    });
  }

  /**
   * Остановка параллакса
   */
  stop(): void {
    if (!this.isActive) return;
    
    window.removeEventListener('scroll', this.handleScroll);
    
    // Сброс трансформаций
    this.sections.forEach(section => {
      section.style.transform = '';
    });
    
    this.isActive = false;
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    this.stop();
    this.sections = [];
  }
}
