import sys
import traceback
from django.contrib.auth import authenticate, get_user_model
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication
from django.middleware.csrf import CsrfViewMiddleware
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import update_last_login

from core import api_exceptions
from core.constants import ERROR_CODES, DUPLICATE
from core.firebase_utils import verify_id_token_custom


class CSRFCheck(CsrfViewMiddleware):
    def _reject(self, request, reason):
        # Return the failure reason instead of an HttpResponse
        return reason


class FirebaseTokenAuth(BaseAuthentication):

    def authenticate(self, request):

        User = get_user_model()
        authorization_header = request.headers.get('Authorization')

        if not authorization_header:
            return None

        try:
            # header = 'Token xxxxxxxxxxxxxxxxxxxxxxxx'
            identifier, access_token = authorization_header.split(' ', 1)
            if not identifier == 'Token':
                raise exceptions.AuthenticationFailed("Invalid token prefix")
            verified, obj = verify_id_token_custom(access_token)
            if not verified:
                raise exceptions.AuthenticationFailed(obj)
            payload = {
                'username': obj['uid'],
                'phone_number': obj['phone_number']
            }

        except IndexError:
            raise exceptions.AuthenticationFailed('Token prefix missing')

        except Exception as e:
            traceback.print_exception(*sys.exc_info())
            raise exceptions.AuthenticationFailed(e.__cause__)
        try:
            user = get_or_create_user(payload, User)
        except Exception as e:
            traceback.print_exception(*sys.exc_info())
            raise exceptions.AuthenticationFailed(e.__cause__)

        if user is None:
            raise exceptions.AuthenticationFailed('User not found')

        if not user.is_active:
            raise exceptions.AuthenticationFailed('User is inactive')

        # self.enforce_csrf(request)
        update_last_login(FirebaseTokenAuth.__class__, user)
        return user, None

    def enforce_csrf(self, request):
        """
        Enforce CSRF validation for session based authentication.
        """

        def dummy_get_response(request):  # pragma: no cover
            return None

        check = CSRFCheck(dummy_get_response)
        # populates request.META['CSRF_COOKIE'], which is used in process_view()
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            # CSRF failed, bail with explicit error message
            raise exceptions.PermissionDenied('CSRF Failed: %s' % reason)


def get_or_create_user(payload, UserModel):
    try:
        user = UserModel.objects.get(username = payload['username'])
        return user
    except UserModel.DoesNotExist:
        if UserModel.objects.filter(phone_number=payload.get('phone_number')).count() > 0:
            raise api_exceptions.AppApiException(
                detail=f'User with phone:{payload.get("phone_number")} exists already',
                code=ERROR_CODES[DUPLICATE]
            )
        user = UserModel.objects.create_user(username=payload['username'], phone_number=payload['phone_number'].strip(' +'))
        return user
