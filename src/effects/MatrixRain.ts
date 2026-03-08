/**
 * @fileoverview Matrix Rain эффект (кодовый дождь)
 * @module effects/MatrixRain
 */

import * as PIXI from 'pixi.js';
import type { Effect, MouseReactive, MatrixRainConfig, CodeDrop } from '../types/index.js';
import { ObjectPool } from '../utils/performance.js';

/**
 * Конфигурация по умолчанию
 */
const DEFAULT_CONFIG: MatrixRainConfig = {
  columnWidth: 20,
  fontSize: { min: 14, max: 24 },
  alpha: { min: 0.3, max: 0.7 },
  speed: { min: 1, max: 4 },
  chars: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
  colors: ['#00ff00', '#00ffff', '#ff00ff'],
};

/**
 * Эффект Matrix Rain (кодовый дождь)
 */
export class MatrixRain implements Effect, MouseReactive {
  public readonly container: PIXI.Container;
  private drops: CodeDrop[] = [];
  private config: MatrixRainConfig;
  private width: number;
  private height: number;
  private mouseX = 0;
  private mouseY = 0;
  
  // Object pool для текстовых объектов
  private textPool: ObjectPool<PIXI.Text>;

  constructor(_app: PIXI.Application, width: number, height: number, config: Partial<MatrixRainConfig> = {}) {
    this.width = width;
    this.height = height;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.container = new PIXI.Container();
    
    // Инициализация пула текстов
    this.textPool = new ObjectPool<PIXI.Text>(
      () => this.createTextObject(),
      (text) => this.resetTextObject(text),
      50
    );
  }

  /**
   * Создание текстового объекта
   */
  private createTextObject(): PIXI.Text {
    const text = new PIXI.Text('', {
      fontFamily: 'Share Tech Mono',
      fontSize: this.config.fontSize.min,
      fill: this.config.colors[0],
    });
    return text;
  }

  /**
   * Сброс текстового объекта
   */
  private resetTextObject(text: PIXI.Text): void {
    text.alpha = 1;
    text.visible = true;
  }

  /**
   * Инициализация эффекта
   */
  init(): void {
    const columns = Math.floor(this.width / this.config.columnWidth);
    
    for (let i = 0; i < columns; i++) {
      const text = this.textPool.acquire();
      this.configureDropText(text, i);
      
      this.container.addChild(text);
      
      this.drops.push({
        text,
        speed: this.randomSpeed(),
        column: i,
        reset: (y?: number) => this.resetDrop(this.drops[this.drops.length - 1], y),
      });
    }
  }

  /**
   * Конфигурация текста капли
   */
  private configureDropText(text: PIXI.Text, column: number): void {
    text.text = this.randomChar();
    text.style.fontSize = this.randomFontSize();
    text.style.fill = this.randomColor();
    text.alpha = this.randomAlpha();
    text.x = column * this.config.columnWidth;
    text.y = Math.random() * this.height;
  }

  /**
   * Сброс капли
   */
  private resetDrop(drop: CodeDrop, y?: number): void {
    drop.text.text = this.randomChar();
    drop.text.y = y ?? -30;
    drop.speed = this.randomSpeed();
  }

  /**
   * Обновление эффекта
   */
  update(delta: number, time: number): void {
    this.drops.forEach((drop, index) => {
      // Движение
      drop.text.y += drop.speed * delta;
      
      // Мерцание
      drop.text.alpha = 0.2 + Math.sin(time * 3 + index) * 0.2;
      
      // Сброс позиции
      if (drop.text.y > this.height) {
        this.resetDrop(drop);
      }

      // Отталкивание от мыши
      this.applyMouseRepulsion(drop);
      
      // Возврат в колонку
      const targetX = drop.column * this.config.columnWidth;
      drop.text.x += (targetX - drop.text.x) * 0.05;
    });
  }

  /**
   * Применение отталкивания от мыши
   */
  private applyMouseRepulsion(drop: CodeDrop): void {
    const dx = drop.text.x - this.mouseX;
    const dy = drop.text.y - this.mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 100 && dist > 0) {
      const force = (100 - dist) / 100;
      drop.text.x += (dx / dist) * force * 5;
    }
  }

  /**
   * Обработка движения мыши
   */
  onMouseMove(x: number, y: number): void {
    this.mouseX = x;
    this.mouseY = y;
  }

  /**
   * Обновление размеров
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * Случайный символ
   */
  private randomChar(): string {
    return this.config.chars[Math.floor(Math.random() * this.config.chars.length)];
  }

  /**
   * Случайный размер шрифта
   */
  private randomFontSize(): number {
    return this.config.fontSize.min + Math.random() * (this.config.fontSize.max - this.config.fontSize.min);
  }

  /**
   * Случайный цвет
   */
  private randomColor(): string {
    return this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
  }

  /**
   * Случайная прозрачность
   */
  private randomAlpha(): number {
    return this.config.alpha.min + Math.random() * (this.config.alpha.max - this.config.alpha.min);
  }

  /**
   * Случайная скорость
   */
  private randomSpeed(): number {
    return this.config.speed.min + Math.random() * (this.config.speed.max - this.config.speed.min);
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    this.drops.forEach(drop => {
      this.container.removeChild(drop.text);
      this.textPool.release(drop.text);
    });
    this.drops = [];
    this.textPool.clear();
  }
}
