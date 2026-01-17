import { rateLimiter } from '../rate-limiter';

// Mock config
jest.mock('../config', () => ({
  config: {
    rateLimit: {
      windowMs: 1000, // 1 second for testing
      maxMessages: 3,
    },
  },
}));

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Reset rate limiter state between tests
    (rateLimiter as any).clients.clear();
  });

  afterAll(() => {
    // Stop the cleanup interval to allow Jest to exit
    rateLimiter.stop();
  });

  describe('isAllowed', () => {
    it('should allow first message from new client', () => {
      const result = rateLimiter.isAllowed('client-1');
      expect(result).toBe(true);
    });

    it('should allow messages under limit', () => {
      expect(rateLimiter.isAllowed('client-2')).toBe(true);
      expect(rateLimiter.isAllowed('client-2')).toBe(true);
      expect(rateLimiter.isAllowed('client-2')).toBe(true);
    });

    it('should block messages over limit', () => {
      rateLimiter.isAllowed('client-3');
      rateLimiter.isAllowed('client-3');
      rateLimiter.isAllowed('client-3');
      
      const result = rateLimiter.isAllowed('client-3');
      expect(result).toBe(false);
    });

    it('should track clients independently', () => {
      // Client A uses up limit
      rateLimiter.isAllowed('client-a');
      rateLimiter.isAllowed('client-a');
      rateLimiter.isAllowed('client-a');
      
      // Client B should still be allowed
      expect(rateLimiter.isAllowed('client-b')).toBe(true);
    });
  });

  describe('getRemaining', () => {
    it('should return max for new client', () => {
      const remaining = rateLimiter.getRemaining('new-client');
      expect(remaining).toBe(3);
    });

    it('should decrease after each message', () => {
      rateLimiter.isAllowed('client-x');
      expect(rateLimiter.getRemaining('client-x')).toBe(2);
      
      rateLimiter.isAllowed('client-x');
      expect(rateLimiter.getRemaining('client-x')).toBe(1);
    });

    it('should return 0 when exhausted', () => {
      rateLimiter.isAllowed('client-y');
      rateLimiter.isAllowed('client-y');
      rateLimiter.isAllowed('client-y');
      
      expect(rateLimiter.getRemaining('client-y')).toBe(0);
    });
  });

  describe('removeClient', () => {
    it('should remove client from tracking', () => {
      rateLimiter.isAllowed('client-to-remove');
      rateLimiter.isAllowed('client-to-remove');
      
      rateLimiter.removeClient('client-to-remove');
      
      // Should be back to full limit
      expect(rateLimiter.getRemaining('client-to-remove')).toBe(3);
    });
  });

  describe('getStats', () => {
    it('should return correct stats', () => {
      rateLimiter.isAllowed('stat-client-1');
      rateLimiter.isAllowed('stat-client-2');
      
      const stats = rateLimiter.getStats();
      expect(stats.trackedClients).toBe(2);
      expect(stats.windowMs).toBe(1000);
      expect(stats.maxMessages).toBe(3);
    });
  });
});
