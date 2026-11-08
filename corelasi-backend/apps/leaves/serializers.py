from rest_framework import serializers
from .models import StudentLeave

class StudentLeaveSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = StudentLeave
        fields = [
            'id', 'student', 'student_name', 
            'leave_type', 'start_date', 'end_date', 'reason', 
            'attachment', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'student', 'status', 'created_at']