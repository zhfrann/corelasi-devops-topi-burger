from rest_framework import viewsets, permissions
from .models import StudentLeave
from .serializers import StudentLeaveSerializer

class StudentLeaveViewSet(viewsets.ModelViewSet):
    serializer_class = StudentLeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Jika role user adalah siswa, tampilkan izin miliknya saja
        if hasattr(user, 'role') and user.role == 'siswa':
            return StudentLeave.objects.filter(student=user).order_by('-created_at')
        # Jika guru/admin, tampilkan semua pengajuan izin
        return StudentLeave.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)