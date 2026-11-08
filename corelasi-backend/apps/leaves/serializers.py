from rest_framework import serializers
from .models import StudentLeave

VALID_STATUS = {choice[0] for choice in StudentLeave.STATUS_CHOICES}


class StudentLeaveSerializer(serializers.ModelSerializer):
    # Nama field mengikuti yang dipakai frontend
    nama_siswa = serializers.SerializerMethodField()
    kelas = serializers.SerializerMethodField()
    jenis_izin = serializers.ChoiceField(
        source='leave_type', choices=StudentLeave.LEAVE_TYPES
    )
    tanggal_mulai = serializers.DateField(source='start_date')
    tanggal_selesai = serializers.DateField(source='end_date')
    alasan = serializers.CharField(source='reason')
    bukti = serializers.FileField(
        source='attachment', required=False, write_only=True
    )
    bukti_url = serializers.SerializerMethodField()
    status = serializers.CharField(required=False)

    class Meta:
        model = StudentLeave
        fields = [
            'id', 'nama_siswa', 'kelas', 'jenis_izin',
            'tanggal_mulai', 'tanggal_selesai', 'alasan',
            'bukti', 'bukti_url', 'status', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def get_nama_siswa(self, obj):
        s = obj.student
        return s.get_full_name() or getattr(s, 'nama', None) or s.get_username()

    def get_kelas(self, obj):
        kelas = getattr(obj.student, 'kelas', None)
        return str(kelas) if kelas else ''

    def get_bukti_url(self, obj):
        if not obj.attachment:
            return None
        request = self.context.get('request')
        url = obj.attachment.url
        return request.build_absolute_uri(url) if request else url

    def validate_status(self, value):
        value = value.lower()  # frontend kirim "APPROVED", DB simpan "approved"
        if value not in VALID_STATUS:
            raise serializers.ValidationError("Status tidak valid.")
        return value

    def validate(self, attrs):
        start = attrs.get('start_date')
        end = attrs.get('end_date')
        if start and end and end < start:
            raise serializers.ValidationError(
                "Tanggal selesai tidak boleh sebelum tanggal mulai."
            )
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['status'] = (instance.status or '').upper()  # "PENDING" dst
        return data