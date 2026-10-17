import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private readonly memoryFallback = new Map<
    string,
    { value: string; expiresAt: number }
  >();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url =
      this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: false,
        lazyConnect: true,
      });
      this.client.on('error', (err) => {
        this.logger.warn(
          `Redis error (using in-memory fallback): ${err.message}`,
        );
      });
      this.client.connect().catch((err) => {
        this.logger.warn(
          `Redis connect failed, using in-memory fallback: ${err.message}`,
        );
      });
    } catch (err: any) {
      this.logger.warn(
        `Redis init failed, using in-memory fallback: ${err?.message}`,
      );
      this.client = null;
    }
  }

  async onModuleDestroy() {
    try {
      await this.client?.quit();
    } catch {
      /* ignore */
    }
  }

  private get fallbackEnabled(): boolean {
    return !this.client || this.client.status !== 'ready';
  }

  private readFallback(key: string): string | null {
    const entry = this.memoryFallback.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memoryFallback.delete(key);
      return null;
    }
    return entry.value;
  }

  async get(key: string): Promise<string | null> {
    if (this.fallbackEnabled || !this.client) return this.readFallback(key);
    try {
      return await this.client.get(key);
    } catch {
      return this.readFallback(key);
    }
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    if (this.fallbackEnabled || !this.client) {
      this.memoryFallback.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
      return;
    }
    try {
      await this.client.setex(key, ttlSeconds, value);
    } catch {
      this.memoryFallback.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  /** Set only if not exists (atomic). Returns true if set. */
  async setnx(
    key: string,
    ttlSeconds: number,
    value: string,
  ): Promise<boolean> {
    if (this.fallbackEnabled || !this.client) {
      if (this.readFallback(key) !== null) return false;
      this.memoryFallback.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
      return true;
    }
    try {
      const res = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
      return res === 'OK';
    } catch {
      if (this.readFallback(key) !== null) return false;
      this.memoryFallback.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
      return true;
    }
  }

  async del(key: string): Promise<void> {
    this.memoryFallback.delete(key);
    if (!this.fallbackEnabled && this.client) {
      try {
        await this.client.del(key);
      } catch {
        /* ignore */
      }
    }
  }
}
