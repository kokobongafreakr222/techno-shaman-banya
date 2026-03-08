/**
 * @fileoverview Таймер обратного отсчёта
 * @module utils/CountdownTimer
 */

// createSafeElement импортирован для будущего использования

/**
 * Конфигурация таймера
 */
interface CountdownConfig {
  targetDate?: Date;
  endOfDay?: boolean;
  onTick?: (time: TimeComponents) => void;
  onComplete?: () => void;
}

/**
 * Компоненты времени
 */
interface TimeComponents {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

/**
 * Класс таймера обратного отсчёта
 */
export class CountdownTimer {
  private element: HTMLElement | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private targetDate: Date;
  private onTick?: (time: TimeComponents) => void;
  private onComplete?: () => void;

  constructor(config: CountdownConfig = {}) {
    if (config.targetDate) {
      this.targetDate = config.targetDate;
    } else if (config.endOfDay) {
      const now = new Date();
      this.targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else {
      // По умолчанию — конец дня
      const now = new Date();
      this.targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    }

    this.onTick = config.onTick;
    this.onComplete = config.onComplete;
  }

  /**
   * Инициализация таймера
   * @param elementId - ID элемента для отображения таймера
   */
  init(elementId: string): void {
    const el = document.getElementById(elementId);
    if (!el) {
      console.warn(`CountdownTimer: элемент с id "${elementId}" не найден`);
      return;
    }
    
    this.element = el;
    this.start();
  }

  /**
   * Запуск таймера
   */
  start(): void {
    this.update();
    this.intervalId = setInterval(() => this.update(), 1000);
  }

  /**
   * Остановка таймера
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Обновление таймера
   */
  private update(): void {
    const current = new Date();
    const diff = this.targetDate.getTime() - current.getTime();
    
    const time = this.calculateTimeComponents(diff);
    
    if (this.onTick) {
      this.onTick(time);
    }

    if (diff <= 0) {
      this.displayTime({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
      this.stop();
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }

    this.displayTime(time);
  }

  /**
   * Расчёт компонентов времени
   */
  private calculateTimeComponents(diffMs: number): TimeComponents {
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, totalMs: diffMs };
  }

  /**
   * Отображение времени (безопасно, без innerHTML)
   */
  private displayTime(time: TimeComponents): void {
    if (!this.element) return;
    
    const formatted = 
      `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
    
    // Безопасное обновление через textContent вместо innerHTML
    this.element.textContent = formatted;
  }

  /**
   * Уничтожение таймера и очистка ресурсов
   */
  dispose(): void {
    this.stop();
    this.element = null;
  }
}
