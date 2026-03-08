/**
 * @fileoverview Неоновая сетка
 * @module effects/NeonGrid
 */

import * as PIXI from 'pixi.js';
import type { Effect, NeonGridConfig } from '../types/index.js';

/**
 * Конфигурация по умолчанию
 */
const DEFAULT_CONFIG: NeonGridConfig = {
  gridSize: 80,
  horizontalColor: 0x00ffff,
  verticalColor: 0xff00ff,
  baseAlpha: 0.05,
  pulseSpeed: 1.0,
};

/**
 * Неоновая сетка
 */
export class NeonGrid implements Effect {
  public readonly container: PIXI.Container;
  private horizontalLines: PIXI.Graphics[] = [];
  private verticalLines: PIXI.Graphics[] = [];
  private config: NeonGridConfig;
  private width: number;
  private height: number;

  constructor(width: number, height: number, config: Partial<NeonGridConfig> = {}) {
    this.width = width;
    this.height = height;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.container = new PIXI.Container();
  }

  /**
   * Инициализация эффекта
   */
  init(): void {
    this.createGrid();
  }

  /**
   * Создание сетки
   */
  private createGrid(): void {
    const cols = Math.ceil(this.width / this.config.gridSize) + 1;
    const rows = Math.ceil(this.height / this.config.gridSize) + 1;

    // Горизонтальные линии
    for (let y = 0; y < rows; y++) {
      const line = new PIXI.Graphics();
      line.lineStyle(1, this.config.horizontalColor, this.config.baseAlpha);
      line.moveTo(0, y * this.config.gridSize);
      line.lineTo(this.width, y * this.config.gridSize);
      this.container.addChild(line);
      this.horizontalLines.push(line);
    }

    // Вертикальные линии
    for (let x = 0; x < cols; x++) {
      const line = new PIXI.Graphics();
      line.lineStyle(1, this.config.verticalColor, this.config.baseAlpha);
      line.moveTo(x * this.config.gridSize, 0);
      line.lineTo(x * this.config.gridSize, this.height);
      this.container.addChild(line);
      this.verticalLines.push(line);
    }
  }

  /**
   * Обновление эффекта
   */
  update(_delta: number, time: number): void {
    // Пульсация горизонтальных линий
    this.horizontalLines.forEach((line, index) => {
      const alpha = this.config.baseAlpha + 
        Math.sin(time * this.config.pulseSpeed + index * 0.1) * this.config.baseAlpha;
      line.alpha = Math.max(0.02, alpha);
    });

    // Пульсация вертикальных линий (с фазовым сдвигом)
    this.verticalLines.forEach((line, index) => {
      const alpha = this.config.baseAlpha + 
        Math.sin(time * this.config.pulseSpeed + index * 0.1 + Math.PI / 2) * this.config.baseAlpha;
      line.alpha = Math.max(0.02, alpha);
    });
  }

  /**
   * Обновление размеров
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    // Очистка и пересоздание сетки
    this.clearGrid();
    this.createGrid();
  }

  /**
   * Очистка сетки
   */
  private clearGrid(): void {
    [...this.horizontalLines, ...this.verticalLines].forEach(line => {
      this.container.removeChild(line);
      line.destroy();
    });
    this.horizontalLines = [];
    this.verticalLines = [];
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    this.clearGrid();
  }
}
