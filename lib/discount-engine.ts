import {
  Coupon,
  DiscountRule,
  CartItem,
  DiscountCalculationResult,
  GuardCheckStep,
} from '@/types/dms';

export interface EvaluationContext {
  orderTotal: number;
  couponCode?: string;
  cartItems: CartItem[];
  currentDateStr: string; // YYYY-MM-DD
  rules: DiscountRule[];
  coupons: Coupon[];
}

/**
 * Calculates discounts according to the exact 7-guard engine sequence specified in the DMS requirements:
 * Guard 1: No coupon provided -> proceeds at full price
 * Guard 2: Coupon code does not exist -> rejected
 * Guard 3: Coupon is inactive -> rejected
 * Guard 4: Coupon has reached its usage limit -> rejected
 * Guard 5: Discount rule is outside its valid date range -> rejected
 * Guard 6: Order does not meet the rule's minimum order value -> rejected
 * Guard 7: Order does not meet the rule's minimum quantity -> rejected
 */
export function calculateDiscount(ctx: EvaluationContext): DiscountCalculationResult {
  const { orderTotal, couponCode, cartItems, currentDateStr, rules, coupons } = ctx;

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const trimmedCode = (couponCode || '').trim().toUpperCase();

  // Guard 1: No coupon provided
  if (!trimmedCode) {
    return {
      isEligible: false,
      originalAmount: orderTotal,
      discountAmount: 0,
      finalAmount: orderTotal,
      statusMessage: 'No coupon provided. Order proceeds at standard full price.',
      maxCapApplied: false,
      guardChecks: [
        {
          stepNumber: 1,
          title: 'Coupon Code Presence',
          passed: false,
          message: 'No coupon code entered. Proceeding with regular checkout.',
          detail: 'No promotional deduction requested.',
        },
      ],
    };
  }

  const guardChecks: GuardCheckStep[] = [];

  // Step 1 check passed (code was provided)
  guardChecks.push({
    stepNumber: 1,
    title: 'Coupon Code Provided',
    passed: true,
    message: `Coupon code "${trimmedCode}" supplied for verification.`,
  });

  // Guard 2: Coupon code does not exist
  const coupon = coupons.find(
    (c) => c.code.trim().toUpperCase() === trimmedCode
  );

  if (!coupon) {
    guardChecks.push({
      stepNumber: 2,
      title: 'Coupon Existence Check',
      passed: false,
      message: `Coupon code "${trimmedCode}" does not exist in the database.`,
      detail: 'Please check your spelling or choose an active coupon from Offers.',
    });

    return {
      isEligible: false,
      originalAmount: orderTotal,
      discountAmount: 0,
      finalAmount: orderTotal,
      statusMessage: `Coupon "${trimmedCode}" not found.`,
      maxCapApplied: false,
      guardChecks,
    };
  }

  guardChecks.push({
    stepNumber: 2,
    title: 'Coupon Existence Check',
    passed: true,
    message: `Coupon "${coupon.code}" found in registry.`,
  });

  // Guard 3: Coupon is inactive
  if (!coupon.isActive) {
    guardChecks.push({
      stepNumber: 3,
      title: 'Coupon Status (Active/Inactive)',
      passed: false,
      message: `Coupon "${coupon.code}" is currently deactivated by the administrator.`,
      detail: 'This promotion is paused and cannot be redeemed right now.',
    });

    return {
      isEligible: false,
      originalAmount: orderTotal,
      discountAmount: 0,
      finalAmount: orderTotal,
      appliedCoupon: coupon,
      statusMessage: `Coupon "${coupon.code}" is disabled.`,
      maxCapApplied: false,
      guardChecks,
    };
  }

  guardChecks.push({
    stepNumber: 3,
    title: 'Coupon Status (Active/Inactive)',
    passed: true,
    message: `Coupon "${coupon.code}" is active and enabled.`,
  });

  // Guard 4: Coupon has reached its usage limit
  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
    guardChecks.push({
      stepNumber: 4,
      title: 'Usage Limit Check',
      passed: false,
      message: `Coupon "${coupon.code}" has reached its maximum limit (${coupon.usageCount}/${coupon.usageLimit} uses).`,
      detail: 'This promo allocation has been fully redeemed by other shoppers.',
    });

    return {
      isEligible: false,
      originalAmount: orderTotal,
      discountAmount: 0,
      finalAmount: orderTotal,
      appliedCoupon: coupon,
      statusMessage: `Coupon limit exhausted (${coupon.usageLimit} uses reached).`,
      maxCapApplied: false,
      guardChecks,
    };
  }

  guardChecks.push({
    stepNumber: 4,
    title: 'Usage Limit Check',
    passed: true,
    message: `Coupon quota available (${coupon.usageCount} of ${coupon.usageLimit} used).`,
  });

  // Fetch linked DiscountRule
  const rule = rules.find((r) => r.id === coupon.ruleId);

  if (!rule) {
    guardChecks.push({
      stepNumber: 5,
      title: 'Rule Linkage Integrity',
      passed: false,
      message: 'Linked discount rule definition is missing.',
    });

    return {
      isEligible: false,
      originalAmount: orderTotal,
      discountAmount: 0,
      finalAmount: orderTotal,
      appliedCoupon: coupon,
      statusMessage: 'Invalid rule configuration.',
      maxCapApplied: false,
      guardChecks,
    };
  }

  // Guard 5: Discount rule is outside its valid date range
  const today = currentDateStr; // 'YYYY-MM-DD'
  const isBeforeStart = today < rule.validFrom;
  const isAfterEnd = today > rule.validTo;

  if (isBeforeStart || isAfterEnd || rule.status === 'expired' || rule.approvalStatus !== 'approved') {
    let dateErrReason = '';
    if (rule.approvalStatus !== 'approved') {
      dateErrReason = `Rule status is ${rule.approvalStatus} (not yet authorized by Business Manager).`;
    } else if (isBeforeStart) {
      dateErrReason = `Campaign starts on ${rule.validFrom}. Current system date is ${today}.`;
    } else {
      dateErrReason = `Campaign expired on ${rule.validTo}. Current system date is ${today}.`;
    }

    guardChecks.push({
      stepNumber: 5,
      title: 'Validity Date Range & Approval',
      passed: false,
      message: `Discount rule "${rule.name}" is outside its valid active window.`,
      detail: dateErrReason,
    });

    return {
      isEligible: false,
      originalAmount: orderTotal,
      discountAmount: 0,
      finalAmount: orderTotal,
      appliedCoupon: coupon,
      appliedRule: rule,
      statusMessage: `Promotion invalid or expired (${dateErrReason})`,
      maxCapApplied: false,
      guardChecks,
    };
  }

  guardChecks.push({
    stepNumber: 5,
    title: 'Validity Date Range & Approval',
    passed: true,
    message: `Active campaign window verified (${rule.validFrom} to ${rule.validTo}).`,
  });

  // Guard 6: Order does not meet the rule's minimum order value
  const minOrder = rule.minOrderValue || 0;
  if (orderTotal < minOrder) {
    guardChecks.push({
      stepNumber: 6,
      title: 'Minimum Order Value Requirement',
      passed: false,
      message: `Minimum order value of ₹${minOrder.toLocaleString('en-IN')} required. Current subtotal is ₹${orderTotal.toLocaleString('en-IN')}.`,
      detail: `Add ₹${(minOrder - orderTotal).toLocaleString('en-IN')} more to qualify for this discount.`,
    });

    return {
      isEligible: false,
      originalAmount: orderTotal,
      discountAmount: 0,
      finalAmount: orderTotal,
      appliedCoupon: coupon,
      appliedRule: rule,
      statusMessage: `Min order value not met (requires ₹${minOrder.toLocaleString('en-IN')})`,
      maxCapApplied: false,
      guardChecks,
    };
  }

  guardChecks.push({
    stepNumber: 6,
    title: 'Minimum Order Value Requirement',
    passed: true,
    message: `Order value ₹${orderTotal.toLocaleString('en-IN')} meets or exceeds minimum ₹${minOrder.toLocaleString('en-IN')}.`,
  });

  // Guard 7: Order does not meet the rule's minimum quantity
  const minQty = rule.minQuantity || 1;
  if (totalQuantity < minQty) {
    guardChecks.push({
      stepNumber: 7,
      title: 'Minimum Quantity Requirement',
      passed: false,
      message: `Minimum item quantity of ${minQty} units required. Current quantity is ${totalQuantity}.`,
      detail: `Add ${minQty - totalQuantity} more item(s) to activate this discount.`,
    });

    return {
      isEligible: false,
      originalAmount: orderTotal,
      discountAmount: 0,
      finalAmount: orderTotal,
      appliedCoupon: coupon,
      appliedRule: rule,
      statusMessage: `Min quantity not met (requires ${minQty} items)`,
      maxCapApplied: false,
      guardChecks,
    };
  }

  guardChecks.push({
    stepNumber: 7,
    title: 'Minimum Quantity Requirement',
    passed: true,
    message: `Order quantity (${totalQuantity} items) satisfies requirement (minimum ${minQty}).`,
  });

  // Product / Category Eligibility Check (From Section 1.5 & 1.9)
  let eligibleSubtotal = orderTotal;
  if (rule.applicableCategory && rule.applicableCategory !== 'All Categories') {
    const categoryItems = cartItems.filter(
      (item) => item.product.category.toLowerCase() === rule.applicableCategory.toLowerCase()
    );
    const categorySubtotal = categoryItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    if (categorySubtotal <= 0) {
      guardChecks.push({
        stepNumber: 8,
        title: 'Category Eligibility Filter',
        passed: false,
        message: `Discount applies only to items in "${rule.applicableCategory}".`,
        detail: 'No items in the cart match this category.',
      });

      return {
        isEligible: false,
        originalAmount: orderTotal,
        discountAmount: 0,
        finalAmount: orderTotal,
        appliedCoupon: coupon,
        appliedRule: rule,
        statusMessage: `Coupon only valid for ${rule.applicableCategory} items.`,
        maxCapApplied: false,
        guardChecks,
      };
    }

    // Category discount applies to items within that category
    eligibleSubtotal = categorySubtotal;
    guardChecks.push({
      stepNumber: 8,
      title: 'Category Eligibility Filter',
      passed: true,
      message: `Matched ${categoryItems.length} item(s) in category "${rule.applicableCategory}" (Eligible value: ₹${categorySubtotal.toLocaleString('en-IN')}).`,
    });
  }

  // All 7 Guards Passed! Compute calculated discount amount
  let calculatedDiscount = 0;
  if (rule.discountType === 'percentage') {
    calculatedDiscount = Math.round((eligibleSubtotal * rule.discountValue) / 100);
  } else {
    // flat amount
    calculatedDiscount = rule.discountValue;
  }

  // Enforce Maximum Discount Cap (if defined)
  let maxCapApplied = false;
  if (rule.maxDiscountCap && calculatedDiscount > rule.maxDiscountCap) {
    calculatedDiscount = rule.maxDiscountCap;
    maxCapApplied = true;
  }

  // Discount cannot exceed order total
  if (calculatedDiscount > orderTotal) {
    calculatedDiscount = orderTotal;
  }

  const finalAmount = Math.max(0, orderTotal - calculatedDiscount);

  return {
    isEligible: true,
    originalAmount: orderTotal,
    discountAmount: calculatedDiscount,
    finalAmount,
    appliedCoupon: coupon,
    appliedRule: rule,
    discountCategory: rule.discountCategory,
    statusMessage: `Success! ${rule.name} applied: saved ₹${calculatedDiscount.toLocaleString('en-IN')}${
      maxCapApplied ? ` (Capped at maximum ₹${rule.maxDiscountCap?.toLocaleString('en-IN')})` : ''
    }.`,
    maxCapApplied,
    guardChecks,
  };
}
