from django.shortcuts import render, redirect
from .discount_logic import calculate_discount
from decimal import Decimal
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.views import LoginView
from django.utils import timezone
from .models import DiscountRule, Coupon
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.contrib import messages
from django.db.models import F

def role_required(*allowed_roles):
    def decorator(view_func):
        @login_required
        def wrapper(request, *args, **kwargs):
            if request.user.profile.role not in allowed_roles:
                return HttpResponseForbidden("You don't have permission to view this page.")
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

def offers(request):
    today = timezone.now().date()
    active_offers = Coupon.objects.filter(
        is_active=True,
        discount_rule__valid_from__lte=today,
        discount_rule__valid_to__gte=today,
        times_used__lt=F('usage_limit'),
    ).select_related('discount_rule', 'discount_rule__category')

    return render(request, 'offers.html', {'offers': active_offers})


def style_form(form):
    for field in form.fields.values():
        field.widget.attrs.update({'class': 'form-input'})
    return form


def checkout(request):
    if request.method == 'POST':
        order_total = Decimal(request.POST.get('order_total'))
        coupon_code = request.POST.get('coupon_code')
        quantity = int(request.POST.get('quantity', 0))
        result = calculate_discount(order_total, coupon_code, quantity)
        return render(request, 'checkout.html', {'result': result, 'quantity': quantity})
    return render(request, 'checkout.html', {})


class CustomLoginView(LoginView):
    template_name = 'auth.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['login_form'] = style_form(context['form'])
        context['register_form'] = style_form(UserCreationForm())
        return context


def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Account created successfully! Please log in.")
            return redirect('login')
    else:
        form = UserCreationForm()
    style_form(form)
    return render(request, 'auth.html', {
        'login_form': style_form(AuthenticationForm()),
        'register_form': form,
    })
    

@role_required('admin', 'sales_staff')
def reports(request):
    today = timezone.now().date()

    active_rules = DiscountRule.objects.filter(valid_from__lte=today, valid_to__gte=today)
    expired_rules = DiscountRule.objects.filter(valid_to__lt=today)
    coupons = Coupon.objects.all()

    return render(request, 'reports.html', {
        'active_rules': active_rules,
        'expired_rules': expired_rules,
        'coupons': coupons,
    })