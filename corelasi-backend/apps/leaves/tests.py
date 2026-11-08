from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from leaves.models import StudentLeave

User = get_user_model()

class LeaveRequestTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.siswa = User.objects.create_user(
            email="siswa.test@corelasi.test",
            name="Siswa Firga",
            password="password123",
            role="siswa"
        )
        self.guru = User.objects.create_user(
            email="guru.test@corelasi.test",
            name="Guru Firga",
            password="password123",
            role="guru"
        )

    def test_siswa_create_leave_request(self):
        self.client.force_authenticate(user=self.siswa)
        payload = {
            "jenis_izin": "SAKIT",
            "tanggal_mulai": "2026-06-01",
            "tanggal_selesai": "2026-06-03",
            "alasan": "Demam berdarah dan perlu rawat inap"
        }
        response = self.client.post("/api/leaves/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StudentLeave.objects.count(), 1)
        leave = StudentLeave.objects.first()
        self.assertEqual(leave.student, self.siswa)
        self.assertEqual(leave.status, "pending")

    def test_guru_list_and_update_leave_request(self):
        leave = StudentLeave.objects.create(
            student=self.siswa,
            leave_type="IZIN",
            start_date="2026-06-05",
            end_date="2026-06-06",
            reason="Acara keluarga mendesak",
            status="pending"
        )
        self.client.force_authenticate(user=self.guru)
        response = self.client.patch(f"/api/leaves/{leave.id}/", {"status": "APPROVED"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        leave.refresh_from_db()
        self.assertEqual(leave.status, "approved")

    def test_invalid_date_range(self):
        self.client.force_authenticate(user=self.siswa)
        payload = {
            "jenis_izin": "SAKIT",
            "tanggal_mulai": "2026-06-10",
            "tanggal_selesai": "2026-06-05",
            "alasan": "Tanggal invalid"
        }
        response = self.client.post("/api/leaves/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
