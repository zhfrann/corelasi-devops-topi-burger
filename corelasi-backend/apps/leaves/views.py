from rest_framework import viewsets, permissions
from .models import StudentLeave
from .serializers import StudentLeaveSerializer

# Samakan dengan nilai field `role` di model User kamu
GURU_ROLES = ('guru', 'admin')


def is_guru(user):
    return getattr(user, 'role', None) in GURU_ROLES


class IsGuruOrReadCreate(permissions.BasePermission):
    """Siswa hanya boleh lihat & membuat izin. Ubah/hapus hanya guru."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if view.action in ('list', 'retrieve', 'create'):
            return True
        return is_guru(user)


class StudentLeaveViewSet(viewsets.ModelViewSet):
    serializer_class = StudentLeaveSerializer
    permission_classes = [IsGuruOrReadCreate]

    def get_queryset(self):
        qs = StudentLeave.objects.select_related('student').order_by('-created_at')
        if is_guru(self.request.user):
            return qs
        return qs.filter(student=self.request.user)

    def perform_create(self, serializer):
        # status dipaksa pending, siswa tidak bisa langsung approve
        serializer.save(student=self.request.user, status='pending')