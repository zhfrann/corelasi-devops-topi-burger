from django.urls import path, include
from rest_framework.routers import SimpleRouter
from learning.views import (
    MateriViewSet,
    TugasViewSet,
    SubmissionViewSet,
    FileUploadView,
    StudentGradesView,
)

router = SimpleRouter()
router.register("materi", MateriViewSet, basename="materi")
router.register("tugas", TugasViewSet, basename="tugas")
router.register("submissions", SubmissionViewSet, basename="submissions")

urlpatterns = [
    path("upload/", FileUploadView.as_view(), name="file-upload"),
    path("my-grades/", StudentGradesView.as_view(), name="student-grades"),
    path("", include(router.urls)),
]
