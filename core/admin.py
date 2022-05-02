from django.contrib import admin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as OriginalUserAdmin

# Register your models here.

from core.forms import CustomUserCreationForm, CustomUserChangeForm
from core.models import User, OtpRecord, UserFile, FileAccessUser


class UserAdmin(OriginalUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    add_fieldsets = OriginalUserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'phone_number', 'is_staff', 'is_active')}
         ),
    )
    fieldsets = OriginalUserAdmin.fieldsets + (
        ('More Personal Info', {'fields': ('phone_number',)}),
        ('Additional Flags', {'fields': ('is_new_user', 'is_email_verified')}),
    )
    # pass

admin.site.register(User, UserAdmin)

admin.site.register(OtpRecord)

admin.site.register(UserFile)

admin.site.register(FileAccessUser)