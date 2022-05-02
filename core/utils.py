import uuid

from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from rest_framework import exceptions
from django.contrib.auth.hashers import PBKDF2PasswordHasher

from core import api_exceptions
from core.constants import *
from core.models import User
from core import serializers as core_serializers
from core import models as db_models


def add_new_profile(profile_obj, request):
    request.user.first_name = profile_obj.get('first_name')
    request.user.last_name = profile_obj.get('last_name')
    request.user.is_new_user = False
    updated_fields = ['first_name', 'last_name', 'is_new_user']
    if User.objects.filter(email=profile_obj.get('email')).count() > 0 and request.user.email != profile_obj.get('email'):
        raise api_exceptions.AppApiException(
            detail=f'User with email:{profile_obj.get("email")} exists already',
            code=ERROR_CODES[DUPLICATE]
        )
    if not request.user.email == profile_obj.get('email'):
        request.user.is_email_verified = False
        updated_fields.append('is_email_verified')
    request.user.email = profile_obj.get('email')
    updated_fields.append('email')
    request.user.save(update_fields = updated_fields)
    return request.user


def send_email(subject, to_address, from_address='Dev Yash (Do not reply)<no-reply@dev-mail.yashkulshreshtha.me>', reply_to = None, text_content = None, html_content = None):

    email_obj = EmailMultiAlternatives(
        subject=subject,
        from_email=from_address,
        reply_to=[reply_to if reply_to else from_address],
        to=[to_address],
        body=text_content
    )
    email_obj.attach_alternative(html_content, "text/html")
    email_obj.send(fail_silently=False)


def verify_otp(request, OTPData):
    serializer = core_serializers.OtpSerializer(data=OTPData)
    error_msg = "Invalid OTP"
    if serializer.is_valid():
        otp = serializer.data.get('otp')
        try:
            otp_obj = db_models.OtpRecord.objects.get(requested_by=request.user)
        except Exception as e:
            return False, "Invalid OTP"
        if otp_obj.otp == otp and not otp_obj.is_used and otp_obj.valid_upto > timezone.now():
            otp_obj.is_used = True
            otp_obj.save(update_fields=['is_used'])
            return True, "OTP Validated"
        if otp_obj.is_used:
            error_msg = 'OTP revoked !'
        if otp_obj.valid_upto <= timezone.now():
            error_msg = 'OTP expired !'
    return False, error_msg


def set_tpin(tpin, user: db_models.User):
    try:
        tpin = int(tpin)
    except Exception as e:
        return False, "Invalid TPIN !"

    if tpin < 100000 or tpin > 999999:
        return False, "TPIN must be exactly 6 digit long !"

    hasher = PBKDF2PasswordHasher()
    tpin = hasher.encode(password=str(tpin), salt=user.username)

    user.tpin = tpin
    user.tpin_updated = timezone.now()
    user.save(update_fields=['tpin', 'tpin_updated'])

    return True, "TPIN Set !"


def create_file_object(filename, filehexname, filesize):
    file_ext = filename.rsplit('.', 1)[1].lower()
    return {
        'filename': f'private/media/{filehexname}.{file_ext}',
        'filesize': f'{filesize}',
        'ext': file_ext
    }
