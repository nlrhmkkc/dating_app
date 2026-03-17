from django.urls import path
from api import views

urlpatterns = [
    path('people/', views.people_list),
    path('auto-responses/', views.auto_responses),
    path('messages/<str:conversation>/', views.messages),
]