import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * General API rate limiter - 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Rate limiter for auth endpoints - 50 requests per 15 minutes (relaxed for dev)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 login/register attempts per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * Sensitive operations rate limiter - 10 requests per hour
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: 'Too many sensitive operations, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Sanitize request body to prevent NoSQL injection
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const sanitized: any = Array.isArray(obj) ? [] : {};
      
      for (const key in obj) {
        // Block keys starting with $ (MongoDB operators) or containing dots
        if (key.startsWith('$') || key.includes('.')) {
          continue;
        }
        sanitized[key] = typeof obj[key] === 'object' ? sanitize(obj[key]) : obj[key];
      }
      
      return sanitized;
    };
    
    req.body = sanitize(req.body);
  }
  next();
};

/**
 * Log suspicious activity
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log potential security issues
  const suspiciousPatterns = [
    /(<script|javascript:|data:)/i,
    /(union\s+select|drop\s+table|delete\s+from)/i,
    /(\.\.\/)/, // Path traversal
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    console.warn(`[SECURITY] Suspicious request detected from IP: ${req.ip}`);
    console.warn(`[SECURITY] Path: ${req.path}`);
    console.warn(`[SECURITY] Body: ${JSON.stringify(req.body)}`);
  }

  next();
};
