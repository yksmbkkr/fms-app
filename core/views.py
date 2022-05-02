import random
import re
import uuid
from datetime import timedelta

from django.db.models import Q, F
from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.
from django.template.loader import render_to_string
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework import status as ResponseStatus
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from core.api_utils import format_api_response
from core import serializers as core_serializers
from core import constants as core_constants
from core import api_exceptions
from core.aws_utils import boto_test, get_file_upload_url, get_cloudfront_signed_cookies
from core.constants import ERROR_CODES, VALIDATION_ERROR, TPIN_NOT_MATCH
from core.models import User
from core import utils as core_utils
from core import models as core_models
from core.utils import create_file_object


def mail_test(request):
    from django.core.mail import send_mail

    send_mail(
        'Subject here',
        'Here is the message.',
        'test@mail.devtest.blazepe.com',
        ['jswealthdev@gmail.com'],
        fail_silently=False,
    )

    return JsonResponse({'code': 200})


@ensure_csrf_cookie
@api_view(['GET'])
def get_profile(request):
    serializer = core_serializers.UserSerializer(request.user)
    response_data = format_api_response(success=True, data=serializer.data)
    return Response(response_data)


@ensure_csrf_cookie
@api_view(['POST'])
def update_profile(request):
    serializer = core_serializers.NewProfileSerializer(request.user, request.data, context={'request': request})
    if not serializer.is_valid():
        raise api_exceptions.AppApiException(
            detail='VALIDATION ERROR',
            code=core_constants.ERROR_CODES[core_constants.VALIDATION_ERROR]
        )
    serializer.save()
    response_data = format_api_response(success=True, data=serializer.data)
    return Response(response_data)


@ensure_csrf_cookie
@api_view(['GET', 'POST'])
def email_verification(request):
    error_msg = 'Invalid OTP'
    if request.method == 'POST':
        serializer = core_serializers.OtpSerializer(data=request.data)
        if serializer.is_valid():
            otp = serializer.data.get('otp')
            try:
                otp_obj = core_models.OtpRecord.objects.get(requested_by=request.user)
            except Exception as e:
                return Response(format_api_response(success=False, error_code=ERROR_CODES[VALIDATION_ERROR],
                                                    error_msg=error_msg))
            if otp_obj.otp == otp and not otp_obj.is_used and otp_obj.valid_upto > timezone.now():
                otp_obj.is_used = True
                otp_obj.save(update_fields=['is_used'])
                request.user.is_email_verified = True
                request.user.save(update_fields=['is_email_verified'])
                return Response(format_api_response(success=True, data={'message': 'OTP Validated'}))
            if otp_obj.is_used:
                error_msg = 'OTP revoked !'
            if otp_obj.valid_upto <= timezone.now():
                error_msg = 'OTP expired !'
        return Response(
            format_api_response(success=False, error_code=ERROR_CODES[VALIDATION_ERROR], error_msg=error_msg))

    if request.method == 'GET':

        otp = random.randint(100000, 999999)
        otp_record_obj = core_models.OtpRecord.objects.get_or_create(
            requested_by=request.user
        )[0]
        now = timezone.now()
        if otp_record_obj.valid_upto > now and not otp_record_obj.is_used:
            otp = otp_record_obj.otp
        else:
            otp_record_obj.is_used = False
            otp_record_obj.otp = otp
            otp_record_obj.valid_upto = timezone.now() + timedelta(minutes=5)
            otp_record_obj.save(update_fields=['is_used', 'otp', 'valid_upto'])

        email_context = {
            'user': request.user,
            'otp': otp
        }

        subject = 'Email Verification'
        to_address = request.user.email
        text_content = render_to_string(template_name='emails/email-verification-otp.txt', context=email_context)
        html_content = render_to_string(template_name='emails/email-verification-otp.html', context=email_context)
        core_utils.send_email(
            subject=subject,
            to_address=to_address,
            text_content=text_content,
            html_content=html_content
        )

        return Response(format_api_response(success=True, data={'message': 'Sent OTP'}))


@ensure_csrf_cookie
@api_view(['POST'])
@permission_classes([IsAdminUser])
def file_upload(request):
    if request.method == 'POST':
        error_msg = 'Invalid File'
        serializer = core_serializers.FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            file_uid = uuid.uuid4()
            file_object = create_file_object(filename=serializer.data.get('file_name'),
                                             filehexname=file_uid.hex,
                                             filesize=serializer.data.get('file_size'))
            user_file_obj = core_models.UserFile.objects.create(
                uploader=request.user,
                filepath=file_object['filename'],
                file_uid=file_uid,
                display_name=serializer.data.get('file_name')
            )

            pattern = re.compile(r"[0-9]{10}")
            uid_list_phone = []
            uid_list_email = []
            for u in serializer.data.get('share_list'):
                if re.fullmatch(pattern, u['uid']):
                    uid_list_phone.append('91'+u['uid'])
                else:
                    uid_list_email.append(u['uid'])

            uid_list = User.objects.filter(
                Q(phone_number__in=uid_list_phone) | Q(email__in=uid_list_email)
            )
            for obj in uid_list:
                core_models.FileAccessUser.objects.get_or_create(
                    user=obj,
                    file=user_file_obj
                )

            resp = get_file_upload_url(file_object)
            file_object['hex'] = file_uid.hex
            return Response(format_api_response(success=True, data={'message': 'Valid File', 'post_object': resp, 'formatted_file_data':file_object}))
        return Response(
            format_api_response(success=False, error_code=ERROR_CODES[VALIDATION_ERROR], error_msg=error_msg))


def boto3_test(request):
    boto_test()
    return JsonResponse({
        'message': 'message'
    })


@ensure_csrf_cookie
@api_view(['GET'])
def my_files_list(request):
    if request.method == 'GET':
        my_files = request.user.userfile_set.all().values(
            'display_name', 'filepath', 'created_on', 'file_uid',
            uploader_fname=F('uploader__first_name'),
            uploader_lname=F('uploader__last_name'),
            ).union(
            request.user.fileaccessuser_set.all().values(
                display_name=F('file__display_name'),
                filepath=F('file__filepath'),
                created_on=F('file__created_on'),
                file_uid=F('file__file_uid'),
                uploader_fname=F('file__uploader__first_name'),
                uploader_lname=F('file__uploader__last_name'))
        )
        serializer = core_serializers.UserFilesListSerializer(my_files, many=True)
        response_data = format_api_response(success=True, data=serializer.data)
        return Response(response_data)


@ensure_csrf_cookie
@api_view(['GET'])
def get_file_view(request, file_uid: str):
    try:
        file_obj = core_models.FileAccessUser.objects.get(
            user=request.user,
            file__file_uid=file_uid
        )
        file_path = file_obj.file.filepath

    except core_models.FileAccessUser.DoesNotExist:
        file_obj = None
        file_path = None
        queryset = request.user.userfile_set.filter(file_uid=file_uid)
        if len(queryset) > 0:
            file_obj = queryset[0]
            file_path = file_obj.filepath
    if not file_obj:
        return Response(
            format_api_response(success=False, error_code=ERROR_CODES[VALIDATION_ERROR],
                                error_msg='Invalid File'))
    signed_cookies, file_url = get_cloudfront_signed_cookies(file_path)
    response = Response(format_api_response(success=True, data={'file_url': file_url}))
    response['Access-Control-Expose-Headers'] = 'set-cookie'
    for cookie in signed_cookies.keys():
        response.set_cookie(key=cookie,
                            value=signed_cookies[cookie],
                            httponly=True,
                            secure=True,
                            samesite='None',
                            domain='.dev.yashkulshreshtha.me'
                            )

    return response
