from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    def __str__(self):
        return self.name
    

class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    def __str__(self):
        return self.name

class DiscountRule(models.Model):
    name = models.CharField(max_length = 100)
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('flat', 'Flat Amount'),]
    DISCOUNT_CATEGORY_CHOICES = [
    ('quantity', 'Quantity Discount'),
    ('seasonal', 'Seasonal Discount'),
    ('trade', 'Trade/Functional Discount'),
    ('cash', 'Cash Discount'),
    ('clearance', 'Clearance Discount'),
    ('rebate', 'Rebate Discount'),
    ('special_offer', 'Special Offer Discount'),
    ]
    discount_type = models.CharField(max_length=15, choices=DISCOUNT_TYPE_CHOICES)
    discount_category = models.CharField(max_length=20, choices=DISCOUNT_CATEGORY_CHOICES, default='cash')
    discount_value = models.DecimalField(max_digits = 10, decimal_places = 2)
    category = models.ForeignKey(Category, on_delete = models.CASCADE)
    valid_from = models.DateField()
    valid_to = models.DateField()
    min_quantity = models.PositiveIntegerField(null=True, blank=True)
    min_order_value = models.DecimalField(max_digits = 10, decimal_places = 2, null=True, blank=True)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    def __str__(self):
        return f"{self.name} ({self.discount_value} {self.discount_type})"

class Coupon(models.Model):
    code = models.CharField(max_length = 20, unique = True)
    discount_rule = models.ForeignKey(DiscountRule, on_delete = models.CASCADE)
    usage_limit = models.PositiveIntegerField()
    times_used = models.PositiveIntegerField(default = 0)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return self.code


class Profile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('sales_staff', 'Sales Staff'),
        ('customer', 'Customer'),
        ('marketing', 'Marketing Team'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')