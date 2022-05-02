from storages.backends.s3boto3 import S3Boto3Storage


class MediaStorage(S3Boto3Storage):
    location = 'public/media'
    file_overwrite = False


class PrivateMediaStorage(S3Boto3Storage):
    location = 'private/media'
    file_overwrite = False
    default_acl = 'private'
    custom_domain = True
    AWS_S3_CUSTOM_DOMAIN = 'fms-cdn-secure.dev.yashkulshreshtha.me'
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
    AWS_S3_REGION_NAME = 'ap-south-1'
    AWS_S3_SIGNATURE_VERSION = 's3v4'