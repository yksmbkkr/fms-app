import datetime

from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone

from core.custom_validators import validate_phone_number

APP_LABEL = 'core'


class CustomBaseModel(models.Model):
    class Meta:
        abstract = True
        app_label = APP_LABEL


class User(AbstractUser):
    phone_number = models.BigIntegerField(null=True, validators=[validate_phone_number])
    is_new_user = models.BooleanField(default=True)
    is_email_verified = models.BooleanField(default=False)


class OtpRecord(CustomBaseModel):
    requested_by = models.ForeignKey(to=User, on_delete=models.CASCADE)
    updated = models.DateTimeField(auto_now=True)
    otp = models.IntegerField(validators=[MinValueValidator(100000), MaxValueValidator(999999)], editable=False, default=100000)
    is_used = models.BooleanField(default=True)
    valid_upto = models.DateTimeField(default=timezone.now)

    class Meta:
        abstract = False


class UserFile(CustomBaseModel):
    uploader = models.ForeignKey(to=User, on_delete=models.PROTECT)
    filepath = models.CharField(max_length=1500)
    display_name = models.CharField(max_length=200, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    file_uid = models.UUIDField(unique=True)

    def __str__(self):
        return f'{self.uploader.first_name} {self.uploader.last_name} | {self.display_name}'

    class Meta:
        abstract = False


class FileAccessUser(CustomBaseModel):
    file = models.ForeignKey(to=UserFile, on_delete=models.CASCADE)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} | {self.file.filepath.rsplit("/", 1)[1]}'

    class Meta:
        abstract = False