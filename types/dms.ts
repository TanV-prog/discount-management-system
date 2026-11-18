export type StakeholderRole =
  | 'Administrator'
  | 'Business Manager'
  | 'Sales Staff'
  | 'Customer'
  | 'Marketing Team'
  | 'Accountant';

export type DiscountType = 'percentage' | 'flat';

export type DiscountCategory =
  | 'Quantity'
  | 'Seasonal'
  | 'Trade/Functional'
  | 'Cash'
  | 'Clearance'
  | 'Rebate'
  | 'Special Offer';

export interface DiscountRule {
  id: string;
  name: string;
  discountType: DiscountType;
  discountCategory: DiscountCategory;
  discountValue: number; // e.g., 20 for 20%, 500 for flat 500
  applicableCategory: string; // 'All Categories' or specific category name
  minOrderValue?: number;
  minQuantity?: number;
  maxDiscountCap?: number; // Cap on maximum discount allowed
  validFrom: string; // YYYY-MM-DD
  validTo: string; // YYYY-MM-DD
  status: 'active' | 'inactive' | 'expired' | 'pending_approval';
  approvalStatus: 'approved' | 'pending' | 'rejected';
  createdByRole: StakeholderRole;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string; // e.g. FESTIVAL20
  ruleId: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  description: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  sku: string;
  inStock: boolean;
  imageSeed: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface GuardCheckStep {
  stepNumber: number;
  title: string;
  passed: boolean;
  message: string;
  detail?: string;
}

export interface DiscountCalculationResult {
  isEligible: boolean;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  appliedCoupon?: Coupon;
  appliedRule?: DiscountRule;
  discountCategory?: DiscountCategory;
  guardChecks: GuardCheckStep[];
  statusMessage: string;
  maxCapApplied: boolean;
}

export interface OrderTransaction {
  id: string;
  orderNumber: string;
  timestamp: string;
  customerName: string;
  customerEmail: string;
  roleInitiator: StakeholderRole;
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
  ruleName?: string;
  discountCategory?: DiscountCategory;
  items: {
    productName: string;
    category: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }[];
  totalQuantity: number;
  status: 'Completed' | 'Refunded';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: StakeholderRole;
  action: string;
  details: string;
  type: 'creation' | 'approval' | 'redemption' | 'modification' | 'security';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: StakeholderRole;
  department?: string;
  joinedDate: string;
}
