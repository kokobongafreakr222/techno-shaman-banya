/**
 * @fileoverview Утилиты для работы с событиями и производительностью
 * @module utils/performance
 */

import type { ThrottledFunction } from '../types/index.js';

/**
 * Throttle функция — ограничивает частоту вызовов
 * @param fn - функция для throttle
 * @param limit - минимальный интервал между вызовами в мс
 * @returns throttled функция
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ThrottledFunction<T> {
  let inThrottle = false;
  let lastFn: ReturnType<typeof setTimeout> | null = null;

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      
      lastFn = setTimeout(() => {
        inThrottle = false;
        lastFn = null;
      }, limit);
    }
  } as ThrottledFunction<T>;

  throttled.cancel = () => {
    if (lastFn) {
      clearTimeout(lastFn);
      lastFn = null;
      inThrottle = false;
    }
  };

  return throttled;
}

/**
 * RAF throttle — использует requestAnimationFrame для throttle
 * @param fn - функция для throttle
 * @returns throttled функция
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(fn: T): () => void {
  let ticking = false;
  let lastArgs: Parameters<T> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    lastArgs = args;
    
    if (!ticking) {
      requestAnimationFrame(() => {
        if (lastArgs) {
          fn.apply(this, lastArgs);
          lastArgs = null;
        }
        ticking = false;
      });
      ticking = true;
    }
  };
}

/**
 * Object Pool для переиспользования объектов
 * @template T тип объектов в пуле
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 0) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  /**
   * Получить объект из пула
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  /**
   * Вернуть объект в пул
   */
  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  /**
   * Очистить пул
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * Получить размер пула
   */
  get size(): number {
    return this.pool.length;
  }
}

/**
 * Проверка поддержки WebGL
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Проверка поддержки WebGL2
 */
export function isWebGL2Supported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

/**
 * Безопасная санитизация текста (защита от XSS)
 * @param text - текст для санитизации
 * @returns санитизированный текст
 */
export function sanitizeText(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Безопасное создание элемента с текстом
 * @param tag - HTML тег
 * @param text - текстовое содержимое
 * @returns созданный элемент
 */
export function createSafeElement(tag: string, text?: string): HTMLElement {
  const element = document.createElement(tag);
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

/**
 * Debounce функция
 * @param fn - функция для debounce
 * @param wait - задержка в мс
 * @returns debounced функция
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
}

/**
 * Мемоизация функции
 * @param fn - функция для мемоизации
 * @returns мемоизированная функция
 */
export function memoize<T extends (arg: string) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function (arg: string): ReturnType<T> {
    if (cache.has(arg)) {
      return cache.get(arg) as ReturnType<T>;
    }
    
    const result = fn(arg) as ReturnType<T>;
    cache.set(arg, result);
    return result;
  } as T;
}
