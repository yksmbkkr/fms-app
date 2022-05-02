import firebase_admin
from django.conf import Settings
from firebase_admin import auth
from pathlib import Path
from firebase_admin import credentials
from rest_framework import exceptions


def get_firebase_app():
    BASE_DIR = Path(__file__).resolve().parent.parent
    GOOGLE_APPLICATION_CREDENTIALS = BASE_DIR / "fms" / "fms-app-ez-firebase-adminsdk-i2he8-a577aad3b4.json"
    cred = credentials.Certificate(GOOGLE_APPLICATION_CREDENTIALS)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credential=cred)


def verify_id_token_custom(id_token):
    try:
        get_firebase_app()
        decoded_token = auth.verify_id_token(id_token=id_token, check_revoked=True)
    except auth.RevokedIdTokenError:
        return False, 'REVOKED_TOKEN'
    except auth.InvalidIdTokenError:
        return False, 'INVALID_TOKEN'

    return True, decoded_token
