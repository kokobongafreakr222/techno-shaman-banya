/**
 * @fileoverview Система неоновых частиц
 * @module effects/NeonParticles
 */

import * as PIXI from 'pixi.js';
import type { Effect, MouseReactive, ParticleSystemConfig } from '../types/index.js';

interface Particle {
  sprite: PIXI.Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  originalX: number;
  originalY: number;
}

/**
 * Конфигурация по умолчанию
 */
const DEFAULT_CONFIG: ParticleSystemConfig = {
  count: 50,
  colors: [0xff00ff, 0x00ffff, 0x39ff14, 0xff6600],
  size: { min: 2, max: 6 },
  alpha: { min: 0.3, max: 1.0 },
  velocity: { min: -1, max: 1 },
  life: { min: 100, max: 300 },
};

/**
 * Система неоновых частиц
 */
export class NeonParticles implements Effect, MouseReactive {
  public readonly container: PIXI.Container;
  private particles: Particle[] = [];
  private config: ParticleSystemConfig;
  private width: number;
  private height: number;
  private mouseX = 0;
  private mouseY = 0;
  private app: PIXI.Application;
  private textures: PIXI.Texture[] = [];

  constructor(app: PIXI.Application, width: number, height: number, config: Partial<ParticleSystemConfig> = {}) {
    this.app = app;
    this.width = width;
    this.height = height;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.container = new PIXI.Container();
  }

  /**
   * Инициализация эффекта
   */
  init(): void {
    this.createTextures();
    
    for (let i = 0; i < this.config.count; i++) {
      this.createParticle();
    }
  }

  /**
   * Создание текстур для частиц разных размеров
   */
  private createTextures(): void {
    this.config.colors.forEach(color => {
      const graphics = new PIXI.Graphics();
      
      // Внешнее свечение
      graphics.beginFill(color, 0.3);
      graphics.drawCircle(0, 0, 8);
      graphics.endFill();
      
      // Ядро
      graphics.beginFill(color, 1.0);
      graphics.drawCircle(0, 0, 3);
      graphics.endFill();
      
      const texture = this.app.renderer.generateTexture(graphics);
      this.textures.push(texture);
      
      // Очистка graphics
      graphics.destroy();
    });
  }

  /**
   * Создание частицы
   */
  private createParticle(): void {
    const texture = this.textures[Math.floor(Math.random() * this.textures.length)];
    const sprite = new PIXI.Sprite(texture);
    
    const x = Math.random() * this.width;
    const y = Math.random() * this.height;
    
    sprite.x = x;
    sprite.y = y;
    sprite.alpha = this.config.alpha.min + Math.random() * (this.config.alpha.max - this.config.alpha.min);
    sprite.scale.set(0.5 + Math.random() * 0.5);
    
    this.container.addChild(sprite);
    
    this.particles.push({
      sprite,
      vx: this.randomVelocity(),
      vy: this.randomVelocity(),
      life: 0,
      maxLife: this.config.life.min + Math.random() * (this.config.life.max - this.config.life.min),
      originalX: x,
      originalY: y,
    });
  }

  /**
   * Обновление эффекта
   */
  update(delta: number, time: number): void {
    this.particles.forEach((particle, index) => {
      // Движение
      particle.sprite.x += particle.vx * delta;
      particle.sprite.y += particle.vy * delta;
      particle.life += delta;

      // Пульсация
      const pulse = Math.sin(time * 2 + index) * 0.3 + 0.7;
      particle.sprite.alpha = pulse * 0.6;

      // Границы экрана (bounce)
      if (particle.sprite.x < 0 || particle.sprite.x > this.width) {
        particle.vx *= -1;
        particle.sprite.x = Math.max(0, Math.min(this.width, particle.sprite.x));
      }
      if (particle.sprite.y < 0 || particle.sprite.y > this.height) {
        particle.vy *= -1;
        particle.sprite.y = Math.max(0, Math.min(this.height, particle.sprite.y));
      }

      // Притяжение к мыши
      this.applyMouseAttraction(particle);

      // Сопротивление
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Респавн
      if (particle.life > particle.maxLife) {
        this.respawnParticle(particle);
      }
    });
  }

  /**
   * Применение притяжения к мыши
   */
  private applyMouseAttraction(particle: Particle): void {
    const dx = this.mouseX - particle.sprite.x;
    const dy = this.mouseY - particle.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 200 && dist > 0) {
      const force = (200 - dist) / 200;
      particle.vx += (dx / dist) * force * 0.5;
      particle.vy += (dy / dist) * force * 0.5;
    }
  }

  /**
   * Респавн частицы
   */
  private respawnParticle(particle: Particle): void {
    particle.sprite.x = Math.random() * this.width;
    particle.sprite.y = Math.random() * this.height;
    particle.originalX = particle.sprite.x;
    particle.originalY = particle.sprite.y;
    particle.life = 0;
    particle.vx = this.randomVelocity();
    particle.vy = this.randomVelocity();
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
   * Случайная скорость
   */
  private randomVelocity(): number {
    const range = this.config.velocity.max - this.config.velocity.min;
    return this.config.velocity.min + Math.random() * range;
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    this.particles.forEach(p => {
      this.container.removeChild(p.sprite);
      p.sprite.destroy();
    });
    this.particles = [];
    
    this.textures.forEach(t => t.destroy());
    this.textures = [];
  }
}
