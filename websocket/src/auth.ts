import jwt from 'jsonwebtoken';
import { config } from './config';
import { ClientType, ServiceType } from './types';

interface AuthResult {
  success: boolean;
  clientType?: ClientType;
  userId?: string;
  userRole?: string;
  serviceType?: ServiceType;
  error?: string;
}

/**
 * Verify JWT token for users/admins
 */
const verifyUserToken = (token: string, isAdmin: boolean = false): AuthResult => {
  try {
    const secret = isAdmin ? config.jwt.adminSecret : config.jwt.userSecret;
    const decoded = jwt.verify(token, secret) as any;
    
    return {
      success: true,
      clientType: isAdmin ? 'admin' : 'user',
      userId: decoded.userId,
      userRole: decoded.role,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid or expired token',
    };
  }
};

/**
 * Verify service key for backend-to-backend auth
 */
const verifyServiceKey = (serviceKey: string, serviceType: ServiceType): AuthResult => {
  const validKey = serviceType === 'admin-be' 
    ? config.serviceKeys.adminBe 
    : config.serviceKeys.userBe;
  
  if (serviceKey === validKey) {
    return {
      success: true,
      clientType: 'service',
      serviceType,
    };
  }
  
  return {
    success: false,
    error: 'Invalid service key',
  };
};

/**
 * Authenticate a client
 */
export const authenticateClient = (
  token?: string,
  serviceKey?: string,
  clientType?: ClientType,
  serviceType?: ServiceType
): AuthResult => {
  // Service authentication (backend-to-backend)
  if (clientType === 'service' && serviceKey && serviceType) {
    return verifyServiceKey(serviceKey, serviceType);
  }
  
  // User/Admin authentication
  if (token) {
    // Try user token first
    let result = verifyUserToken(token, false);
    if (result.success) return result;
    
    // Try admin token
    result = verifyUserToken(token, true);
    if (result.success) return result;
    
    return { success: false, error: 'Invalid token' };
  }
  
  return { success: false, error: 'No authentication provided' };
};
