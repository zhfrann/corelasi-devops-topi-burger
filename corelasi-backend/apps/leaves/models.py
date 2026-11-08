from django.db import models
from django.conf import settings

class StudentLeave(models.Model):
    LEAVE_TYPES = [
        ('SAKIT', 'Sakit'),
        ('IZIN', 'Izin'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Menunggu'),
        ('approved', 'Disetujui'),
        ('rejected', 'Ditolak'),
    ]

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.CharField(max_length=10, choices=LEAVE_TYPES, default='IZIN')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    attachment = models.FileField(upload_to='leaves/attachments/', null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.username} - {self.leave_type} ({self.status})"