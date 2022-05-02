from django.http import JsonResponse
from rest_framework.views import exception_handler

from core.api_exceptions import AppApiException
from core.constants import ERROR_CODES, DATA_FORMAT_FAILURE


def custom_exception_handler(exec, context):
    response = exception_handler(exec, context)

    if response is not None and isinstance(exec, AppApiException):
        response.data['success'] = False
        response.data['error'] = {}
        if exec.code:
            response.data['error']['code'] = exec.code
        if exec.error_msg:
            response.data['error']['msg'] = exec.error_msg
        if exec.errors:
            response.data['error']['errors'] = exec.errors

    return response


def format_api_response(success=False, error_code=None, error_msg='', data=None, errors=None):
    if success and data:
        return {
            'success': success,
            'data': data
        }

    elif not success:
        response_obj = {
            'success': success,
            'error': {}
        }

        if error_code:
            response_obj['error']['code'] = error_code

        if error_msg:
            response_obj['error']['msg'] = error_msg

        if errors:
            response_obj['error']['errors'] = errors

        return response_obj

    else:
        return {
            'success': False,
            'error': {
                'code': ERROR_CODES[DATA_FORMAT_FAILURE],
                'msg': 'Function to format api response got success but no data'
            }
        }