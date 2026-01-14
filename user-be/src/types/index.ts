import { Request } from 'express';
import { JwtPayload } from '../middleware/auth.middleware';

// Extend Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Address types
export interface Address {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark: string | null;
  isDefault: boolean;
}

// Cart types
export interface CartItem {
  id: string;
  batchId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  medicine: {
    id: string;
    name: string;
    strength: string;
    dosageForm: string;
    mrp: number;
    imageUrl: string | null;
  };
  batch: {
    batchNumber: string;
    expiryDate: Date;
    remainingQuantity: number;
    status: string;
  };
  isAvailable: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  summary: {
    totalItems: number;
    itemCount: number;
    subtotal: number;
    tax: number;
    total: number;
  };
}

// Order types
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface OrderItem {
  id: string;
  batchId: string;
  medicineName: string;
  medicineStrength: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  items: OrderItem[];
  address: Address;
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
}

// Scan types
export interface ScanResult {
  verification: {
    status: 'AUTHENTIC' | 'RECALLED' | 'EXPIRED' | 'WARNING';
    message: string;
    isAuthentic: boolean;
    blockchainVerified: boolean;
  };
  medicine: {
    id: string;
    name: string;
    genericName: string | null;
    strength: string;
    composition: string;
    dosageForm: string;
    mrp: number;
    storageCondition: string | null;
    description: string | null;
    imageUrl: string | null;
  };
  batch: {
    id: string;
    batchNumber: string;
    manufacturingDate: Date;
    expiryDate: Date;
    status: string;
    isExpired: boolean;
    daysUntilExpiry: number;
  };
  manufacturer: {
    name: string;
    licenseNumber: string;
    address: string;
    city: string | null;
    state: string | null;
    country: string;
    isVerified: boolean;
  };
  canPurchase: boolean;
  availableQuantity: number;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}
