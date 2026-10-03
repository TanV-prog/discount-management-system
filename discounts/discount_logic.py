from .models import Coupon
from django.utils import timezone

def calculate_discount(order_total, coupon_code=None, quantity=None):
    if not coupon_code:
        return {"final_price": order_total, "discount_amount": 0, "valid": True, "message": "No coupon applied"}

    try:
        coupon = Coupon.objects.get(code=coupon_code)
    except Coupon.DoesNotExist:
        return {"final_price": order_total, "discount_amount": 0, "valid": False, "message": "Invalid coupon code"}

    if not coupon.is_active:
        return {"final_price": order_total, "discount_amount": 0, "valid": False, "message": "Coupon is inactive"}

    if coupon.times_used >= coupon.usage_limit:
        return {"final_price": order_total, "discount_amount": 0, "valid": False, "message": "Coupon usage limit reached"}

    rule = coupon.discount_rule

    if not (rule.valid_from <= timezone.now().date() <= rule.valid_to):
        return {"final_price": order_total, "discount_amount": 0, "valid": False, "message": "Coupon is not valid at this time"}

    if rule.min_order_value is not None and order_total < rule.min_order_value:
        return {"final_price": order_total, "discount_amount": 0, "valid": False, "message": f"Minimum order value is {rule.min_order_value}"}

    if rule.min_quantity is not None and (quantity is None or quantity < rule.min_quantity):
        return {"final_price": order_total, "discount_amount": 0, "valid": False, "message": f"Minimum quantity is {rule.min_quantity}"}

    if rule.discount_type == 'percentage':
        discount_amount = order_total * rule.discount_value / 100
    else:  # 'flat'
        discount_amount = rule.discount_value
    if rule.max_discount_amount is not None:
        discount_amount = min(discount_amount, rule.max_discount_amount)
    
    final_price = max(order_total - discount_amount, 0)

    coupon.times_used += 1
    coupon.save()

    return {
        "final_price": final_price,
        "discount_amount": discount_amount,
        "valid": True,
        "message": f"Coupon applied successfully. You saved {discount_amount:.2f}!",
        "category": rule.get_discount_category_display(),
    }