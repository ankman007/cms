from django.contrib import admin
from django.urls import path, include
from cms.views import ApiOverview
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="DevFlow CMS API",
        default_version="v1",
        description="API documentation for DevFlow: CMS",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('', ApiOverview.as_view(), name='api-overview'),
    path('admin/', admin.site.urls),
    path('user/', include("account.urls")),
    path('articles/', include("blog.urls")),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
