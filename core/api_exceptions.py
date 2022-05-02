from rest_framework import exceptions, status

from core.constants import *


class AppApiException(exceptions.APIException):
    status_code = status.HTTP_200_OK
    default_detail = 'Service temporarily unavailable, try again later.'
    default_code = ERROR_CODES[SERVICE_UNAVAILABLE]

    def __init__(self, detail=None, code=None, errors = None):
        if detail is None:
            self.detail = self.default_detail
        if code is None:
            self.code = self.default_code

        self.error_msg = detail
        self.detail = detail
        self.code = code
        self.errors = errors

    def get_error_obj(self):
        return {
            'code': self.code,
            'msg': self.error_msg,
            'errors': self.errors
        }
