/**
 * @fileoverview Типы для ТехноШаманской Бани
 * @module types/index
 */

import * as PIXI from 'pixi.js';

/**
 * Интерфейс частицы для системы частиц
 */
export interface Particle {
  sprite: PIXI.Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  reset(): void;
}

/**
 * Интерфейс капли кода (matrix rain)
 */
export interface CodeDrop {
  text: PIXI.Text;
  speed: number;
  column: number;
  reset(y?: number): void;
}

/**
 * Конфигурация для Matrix Rain эффекта
 */
export interface MatrixRainConfig {
  columnWidth: number;
  fontSize: { min: number; max: number };
  alpha: { min: number; max: number };
  speed: { min: number; max: number };
  chars: string;
  colors: string[];
}

/**
 * Конфигурация для системы частиц
 */
export interface ParticleSystemConfig {
  count: number;
  colors: number[];
  size: { min: number; max: number };
  alpha: { min: number; max: number };
  velocity: { min: number; max: number };
  life: { min: number; max: number };
}

/**
 * Конфигурация для неоновой сетки
 */
export interface NeonGridConfig {
  gridSize: number;
  horizontalColor: number;
  verticalColor: number;
  baseAlpha: number;
  pulseSpeed: number;
}

/**
 * Опции для эффектов при клике
 */
export interface ClickEffectOptions {
  duration: number;
  scale: number;
  colors: string[];
}

/**
 * Результат security audit
 */
export interface SecurityAuditResult {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'xss' | 'memory' | 'performance' | 'best-practice';
  description: string;
  recommendation: string;
  line?: number;
  file?: string;
}

/**
 * Тип для throttle функции
 */
export type ThrottledFunction<T extends (...args: unknown[]) => unknown> = T & {
  cancel(): void;
};

/**
 * Позиция мыши
 */
export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Границы экрана
 */
export interface ViewportBounds {
  width: number;
  height: number;
}

/**
 * Disposable интерфейс для ресурсов требующих очистки
 */
export interface Disposable {
  dispose(): void;
}

/**
 * Интерфейс для эффектов которые можно анимировать
 */
export interface Animatable {
  update(delta: number, time: number): void;
}

/**
 * Интерфейс для эффектов реагирующих на мышь
 */
export interface MouseReactive {
  onMouseMove(x: number, y: number): void;
}

/**
 * Базовый интерфейс для всех эффектов
 */
export interface Effect extends Disposable, Animatable {
  readonly container: PIXI.Container;
  init(): void;
}
