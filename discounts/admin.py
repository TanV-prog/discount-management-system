from django.contrib import admin
from .models import Category, Product, DiscountRule, Coupon, Profile

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(DiscountRule)
admin.site.register(Coupon)
admin.site.register(Profile)
