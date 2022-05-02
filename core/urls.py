from django.urls import path
from core import views

app_name = 'core'
api_v1 = 'apis/v1/'

apiurlpatterns = [
    path('apis/v1/profile/', views.get_profile, name='get_profile'),
    path('apis/v1/files/', views.my_files_list, name='files_list'),
    path('apis/v1/file/<str:file_uid>/', views.get_file_view, name='get_file'),
    path('apis/v1/upload/', views.file_upload, name='get_upload_url'),
    path('apis/v1/save-profile/', views.update_profile, name='save_profile'),
    path('apis/v1/email-verification/', views.email_verification, name='email_verifiaction'),
]

urlpatterns = apiurlpatterns + [
    path('mailtest/', views.mail_test),
    path('boto-test/', views.boto3_test)
]