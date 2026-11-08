from rest_framework import serializers

from academic.models import MataPelajaran


class AttendanceReportQuerySerializer(serializers.Serializer):
    sortBy = serializers.ChoiceField(
        choices=("name", "percentage"), required=False, default="name", allow_blank=True,
    )
    sortOrder = serializers.ChoiceField(
        choices=("asc", "desc"), required=False, default="asc", allow_blank=True,
    )
    attendanceStatus = serializers.ChoiceField(
        choices=("all", "below_90", "at_least_90"),
        required=False, default="all", allow_blank=True,
    )
    mapelId = serializers.RegexField(
        regex=r"\A[0-9]+\Z", required=False, allow_blank=True, max_length=19,
        trim_whitespace=False,
    )

    def validate_attendanceStatus(self, value):
        return value or "all"

    def validate_sortBy(self, value):
        return value or "name"

    def validate_sortOrder(self, value):
        return value or "asc"

    def validate_mapelId(self, value):
        if value == "":
            return None
        mapel_id = int(value)
        if not 0 < mapel_id <= 9223372036854775807:
            raise serializers.ValidationError("ID mata pelajaran tidak valid.")
        if not MataPelajaran.objects.filter(pk=mapel_id).exists():
            raise serializers.ValidationError("Mata pelajaran tidak ditemukan.")
        return mapel_id
