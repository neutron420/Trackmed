import { config } from './config';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

/**
 * Rate limiter for WebSocket messages
 * Tracks message counts per client within a time window
 */
class RateLimiter {
  private clients: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if a client is rate limited
   * @returns true if allowed, false if rate limited
   */
  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const entry = this.clients.get(clientId);

    if (!entry) {
      // First message from this client
      this.clients.set(clientId, {
        count: 1,
        windowStart: now,
      });
      return true;
    }

    // Check if window has expired
    if (now - entry.windowStart > config.rateLimit.windowMs) {
      // Reset window
      this.clients.set(clientId, {
        count: 1,
        windowStart: now,
      });
      return true;
    }

    // Check if under limit
    if (entry.count < config.rateLimit.maxMessages) {
      entry.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get remaining messages for a client
   */
  getRemaining(clientId: string): number {
    const entry = this.clients.get(clientId);
    if (!entry) return config.rateLimit.maxMessages;

    const now = Date.now();
    if (now - entry.windowStart > config.rateLimit.windowMs) {
      return config.rateLimit.maxMessages;
    }

    return Math.max(0, config.rateLimit.maxMessages - entry.count);
  }

  /**
   * Get time until rate limit resets (in ms)
   */
  getResetTime(clientId: string): number {
    const entry = this.clients.get(clientId);
    if (!entry) return 0;

    const elapsed = Date.now() - entry.windowStart;
    return Math.max(0, config.rateLimit.windowMs - elapsed);
  }

  /**
   * Remove a client from tracking
   */
  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [clientId, entry] of this.clients.entries()) {
      if (now - entry.windowStart > config.rateLimit.windowMs) {
        this.clients.delete(clientId);
      }
    }
  }

  /**
   * Stop the cleanup interval (for graceful shutdown)
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      trackedClients: this.clients.size,
      windowMs: config.rateLimit.windowMs,
      maxMessages: config.rateLimit.maxMessages,
    };
  }
}

export const rateLimiter = new RateLimiter();
