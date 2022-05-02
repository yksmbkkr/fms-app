from rest_framework import serializers

from core.custom_validators import file_validator, share_user_uid_validator
from core.models import User, UserFile
from core import utils


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone_number', 'is_staff',
                  'is_new_user', 'is_email_verified', 'is_active']


class NewProfileSerializer(serializers.Serializer):

    first_name = serializers.CharField(required=True, max_length=50)
    last_name = serializers.CharField(required=True, max_length=50)
    email = serializers.EmailField(required=True)

    def create(self, validated_data):
        request = self.context.get('request')
        return utils.add_new_profile(validated_data, request)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        return utils.add_new_profile(validated_data, request)


class OtpSerializer(serializers.Serializer):
    otp = serializers.IntegerField(min_value=100000, max_value=999999)


class ShareUserSerializer(serializers.Serializer):
    uid = serializers.CharField(validators=[share_user_uid_validator])


class FileUploadSerializer(serializers.Serializer):
    file_name = serializers.CharField(validators=[file_validator])
    file_size = serializers.IntegerField(min_value=10, max_value=5*1024*1024)
    share_list = ShareUserSerializer(many=True, required=False, allow_null=True)


class UserFilesListSerializer(serializers.ModelSerializer):
    def get_uploader_name(self, obj):
        return f"{obj['uploader_fname']} {obj['uploader_lname']}"

    uploader_name = serializers.SerializerMethodField(method_name='get_uploader_name')
    class Meta:
        model = UserFile
        fields = ['display_name', 'filepath', 'created_on', 'file_uid', 'uploader_name']


class SearchFileSerializer(serializers.Serializer):
    file_id = serializers.CharField()