import re

import phonenumbers
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def is_phone_number_valid(phone_number):
    num = f"+{phone_number}"
    num = phonenumbers.parse(num, None)
    return phonenumbers.is_valid_number(num)


def validate_phone_number(phone_number):
    if not is_phone_number_valid(phone_number):
        raise ValidationError(
            _('%(value)s is not a valid phone number'),
            params={'value': f"+{phone_number}"},
        )


def file_validator(filename: str):
    file_ext = filename.split('.')[-1].lower()
    if file_ext != 'docx' and file_ext != 'pptx' and file_ext != 'xlsx':
        raise ValidationError(
            _('Only DOCX/PPTX/XLSX files are allowed')
        )


def share_user_uid_validator(uid: str):
    pattern = re.compile(r"[0-9]{10}")
    email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')

    if not re.fullmatch(pattern, uid) and not re.fullmatch(email_pattern, uid):
        raise ValidationError(
            _('Invalid UID')
        )