import datetime
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from academic.models import Kelas, MataPelajaran
from attendance.models import AbsensiSiswa
from learning.models import Tugas, Submission
from journals.models import JurnalPertemuan

User = get_user_model()

class ReportAPITests(APITestCase):
    """Integration API tests for the Reports app."""

    def setUp(self):
        # 1. Users
        self.admin = User.objects.create_superuser(
            email="admin@corelasi.test",
            password="adminpassword",
            name="Admin Test"
        )
        self.teacher = User.objects.create_user(
            email="guru@corelasi.test",
            password="gurupassword",
            name="Guru Test",
            role="guru"
        )
        self.siswa = User.objects.create_user(
            email="siswa@corelasi.test",
            password="siswapassword",
            name="Siswa Test",
            role="siswa"
        )

        # 2. Academic Objects
        self.kelas = Kelas.objects.create(name="XI-A", tingkat="XI", wali_kelas=self.teacher)
        self.mapel = MataPelajaran.objects.create(name="Fisika", kode="MP-PHYS")

        # Assign student to kelas
        self.siswa.kelas = self.kelas
        self.siswa.save()

        # URLs
        self.attendance_report_url = "/api/reports/attendance/"
        self.grades_report_url = "/api/reports/grades/"
        self.operational_report_url = "/api/reports/operational/"

    def test_student_cannot_access_reports(self):
        self.client.force_authenticate(user=self.siswa)
        
        response = self.client.get(self.attendance_report_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        response = self.client.get(self.grades_report_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        response = self.client.get(self.operational_report_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_access_attendance_report(self):
        # Create some attendance records
        AbsensiSiswa.objects.create(
            siswa=self.siswa,
            kelas=self.kelas,
            tanggal="2026-06-08",
            status="Hadir"
        )
        AbsensiSiswa.objects.create(
            siswa=self.siswa,
            kelas=self.kelas,
            tanggal="2026-06-09",
            status="Alpa"
        )

        self.client.force_authenticate(user=self.teacher)
        response = self.client.get(self.attendance_report_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        
        data = response.data["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["siswaName"], "Siswa Test")
        self.assertEqual(data[0]["hadir"], 1)
        self.assertEqual(data[0]["alpa"], 1)
        self.assertEqual(data[0]["percentage"], 50) # 1 hadir, 1 alpa -> 50%

    def test_teacher_can_access_grades_report(self):
        # Create a published assignment
        tugas = Tugas.objects.create(
            title="Tugas Termodinamika",
            description="Kerjakan bab 4",
            due_date=datetime.date.today() + datetime.timedelta(days=1),
            kelas=self.kelas,
            mapel=self.mapel,
            guru=self.teacher,
            status="Dipublikasikan"
        )
        # Create graded submission
        Submission.objects.create(
            tugas=tugas,
            siswa=self.siswa,
            grade=90,
            status="Terkumpul"
        )

        self.client.force_authenticate(user=self.teacher)
        response = self.client.get(self.grades_report_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["average"], 90)
        self.assertEqual(len(data[0]["grades"]), 1)
        self.assertEqual(data[0]["grades"][0]["score"], 90)

    def test_operational_report_metrics(self):
        # Create sample data
        JurnalPertemuan.objects.create(
            date="2026-06-08",
            kelas=self.kelas,
            mapel=self.mapel,
            guru=self.teacher,
            agenda="KBM 1",
            material_summary="Summary...",
            present_count=30,
            absent_count=0
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.operational_report_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data["data"]
        self.assertEqual(data["totalSiswa"], 1)
        self.assertEqual(data["totalGuru"], 1)
        self.assertEqual(data["totalKelas"], 1)
        self.assertEqual(data["attendanceRate"], 0.0)
        self.assertEqual(data["journalCompletionRate"], min(100.0, round((1 / 15) * 100, 1)))

    def test_teacher_reports_are_scoped_and_operational_report_is_admin_only(self):
        unrelated_class = Kelas.objects.create(name="XII-C", tingkat="XII")
        unrelated_student = User.objects.create_user(
            email="other-student@corelasi.test",
            password="password123",
            name="Other Student",
            role="siswa",
            kelas=unrelated_class,
        )
        AbsensiSiswa.objects.create(
            siswa=unrelated_student,
            kelas=unrelated_class,
            tanggal="2026-06-08",
            status="Hadir",
        )
        self.client.force_authenticate(user=self.teacher)

        attendance_response = self.client.get(self.attendance_report_url)
        operational_response = self.client.get(self.operational_report_url)

        returned_ids = {row["siswaId"] for row in attendance_response.data["data"]}
        self.assertIn(self.siswa.id, returned_ids)
        self.assertNotIn(unrelated_student.id, returned_ids)
        self.assertEqual(operational_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_empty_reports_do_not_fabricate_attendance_or_grades(self):
        self.client.force_authenticate(user=self.admin)

        attendance_response = self.client.get(self.attendance_report_url)
        grades_response = self.client.get(self.grades_report_url)

        self.assertEqual(attendance_response.data["data"][0]["hadir"], 0)
        self.assertEqual(attendance_response.data["data"][0]["percentage"], 0)
        self.assertEqual(grades_response.data["data"][0]["average"], 0)


class AttendanceSubjectFilterTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_user(email="admin-subject@test.local", name="Admin", role="admin")
        cls.teacher = User.objects.create_user(email="teacher-subject@test.local", name="Guru", role="guru")
        cls.kelas = Kelas.objects.create(name="X-A", tingkat="X", wali_kelas=cls.teacher)
        cls.other_class = Kelas.objects.create(name="X-B", tingkat="X")
        cls.student = User.objects.create_user(email="subject@test.local", name="Ani", role="siswa", kelas=cls.kelas)
        cls.empty_student = User.objects.create_user(email="empty@test.local", name="Budi", role="siswa", kelas=cls.kelas)
        cls.other_student = User.objects.create_user(email="other@test.local", name="Citra", role="siswa", kelas=cls.other_class)
        cls.subject = MataPelajaran.objects.create(name="Matematika")
        cls.other_subject = MataPelajaran.objects.create(name="Fisika")
        cls.empty_subject = MataPelajaran.objects.create(name="Kimia")
        for subject, value in [(cls.subject, "Hadir"), (cls.other_subject, "Alpa"), (None, "Sakit")]:
            AbsensiSiswa.objects.create(siswa=cls.student, kelas=cls.kelas, mapel=subject,
                                        tanggal="2026-06-08", status=value)
        AbsensiSiswa.objects.create(siswa=cls.other_student, kelas=cls.other_class,
                                    mapel=cls.subject, tanggal="2026-06-08", status="Izin")

    def setUp(self):
        self.url = "/api/reports/attendance/"
        self.client.force_authenticate(self.admin)

    def test_all_subjects_includes_records_without_subject(self):
        for params in [{}, {"mapelId": ""}]:
            with self.subTest(params=params):
                response = self.client.get(self.url, params)
                self.assertEqual(response.status_code, 200)
                row = next(row for row in response.data["data"] if row["siswaId"] == self.student.id)
                self.assertEqual((row["hadir"], row["sakit"], row["alpa"], row["percentage"]), (1, 1, 1, 33))

    def test_subject_filters_records_before_counts_and_percentage(self):
        response = self.client.get(self.url, {"mapelId": self.subject.id})
        self.assertEqual(response.status_code, 200)
        row = next(row for row in response.data["data"] if row["siswaId"] == self.student.id)
        self.assertEqual((row["hadir"], row["sakit"], row["izin"], row["alpa"], row["percentage"]), (1, 0, 0, 0, 100))

    def test_class_and_subject_preserve_roster_without_attendance(self):
        response = self.client.get(self.url, {"kelasId": self.kelas.id, "mapelId": self.subject.id})
        rows = {row["siswaId"]: row for row in response.data["data"]}
        self.assertEqual(set(rows), {self.student.id, self.empty_student.id})
        self.assertEqual(rows[self.student.id]["hadir"], 1)
        self.assertEqual(rows[self.empty_student.id]["percentage"], 0)

    def test_existing_subject_without_records_returns_zero_counts(self):
        response = self.client.get(self.url, {"mapelId": self.empty_subject.id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["data"]), 3)
        for row in response.data["data"]:
            self.assertEqual([row[key] for key in ("hadir", "sakit", "izin", "alpa", "percentage")], [0] * 5)

    def test_invalid_subject_returns_standard_bad_request(self):
        for value in ["abc", "0", "-1", "1.0", "+1", " 1", "999999999", "9" * 100, "9223372036854775808"]:
            with self.subTest(value=value):
                response = self.client.get(self.url, {"mapelId": value})
                self.assertEqual(response.status_code, 400)
                self.assertFalse(response.data["success"])
                self.assertIn("mapelId", response.data["errors"])

    def test_subject_filter_preserves_teacher_scope(self):
        self.client.force_authenticate(self.teacher)
        response = self.client.get(self.url, {"mapelId": self.subject.id})
        self.assertEqual({row["siswaId"] for row in response.data["data"]}, {self.student.id, self.empty_student.id})
        response = self.client.get(self.url, {"kelasId": self.other_class.id, "mapelId": self.subject.id})
        self.assertEqual(response.data["data"], [])

    def test_subject_filter_preserves_authentication_and_student_denial(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.url, {"mapelId": self.subject.id}).status_code, 401)
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get(self.url, {"mapelId": self.subject.id}).status_code, 403)


class AttendancePercentageFilterTests(APITestCase):
    @classmethod
    def add_attendance(cls, student, subject, present, total):
        AbsensiSiswa.objects.bulk_create([
            AbsensiSiswa(
                siswa=student, kelas=student.kelas, mapel=subject,
                tanggal=datetime.date(2026, 1, 1) + datetime.timedelta(days=index),
                status="Hadir" if index < present else "Alpa",
            )
            for index in range(total)
        ])

    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_user(email="percentage-admin@test.local", name="Admin", role="admin")
        cls.teacher = User.objects.create_user(email="percentage-teacher@test.local", name="Guru", role="guru")
        cls.kelas = Kelas.objects.create(name="XI-A", tingkat="XI", wali_kelas=cls.teacher)
        cls.other_class = Kelas.objects.create(name="XI-B", tingkat="XI")
        cls.subject = MataPelajaran.objects.create(name="Matematika")
        cls.other_subject = MataPelajaran.objects.create(name="Fisika")
        cls.empty_subject = MataPelajaran.objects.create(name="Kimia")
        for label, present, total in [
            ("low", 4, 5), ("boundary", 9, 10), ("full", 5, 5),
            ("zero", 0, 5), ("empty", 0, 0), ("rounded", 112, 125),
        ]:
            student = User.objects.create_user(
                email=f"{label}@percentage.test", name=label, role="siswa", kelas=cls.kelas,
            )
            setattr(cls, label, student)
            cls.add_attendance(student, cls.subject, present, total)
        cls.add_attendance(cls.low, cls.other_subject, 5, 5)
        cls.add_attendance(cls.full, cls.other_subject, 0, 5)
        cls.outside = User.objects.create_user(
            email="outside@percentage.test", name="Outside", role="siswa", kelas=cls.other_class,
        )
        cls.add_attendance(cls.outside, cls.subject, 4, 5)

    def setUp(self):
        self.url = "/api/reports/attendance/"
        self.client.force_authenticate(self.admin)
        self.params = {"kelasId": self.kelas.id, "mapelId": self.subject.id}

    def rows_for(self, category):
        response = self.client.get(self.url, {**self.params, "attendanceStatus": category})
        self.assertEqual(response.status_code, 200)
        return {row["siswaId"]: row for row in response.data["data"]}

    def test_all_omitted_and_empty_categories_include_students_without_data(self):
        baseline = self.client.get(self.url, self.params).data["data"]
        self.assertEqual(len(baseline), 6)
        for category in ["", "all"]:
            self.assertEqual(list(self.rows_for(category).values()), baseline)
        row = self.rows_for("all")[self.empty.id]
        self.assertEqual([row[key] for key in ("hadir", "sakit", "izin", "alpa", "percentage")], [0] * 5)

    def test_below_90_includes_80_and_real_zero_but_not_missing_data(self):
        rows = self.rows_for("below_90")
        self.assertEqual(set(rows), {self.low.id, self.zero.id})
        self.assertEqual(rows[self.low.id]["percentage"], 80)
        self.assertEqual(rows[self.zero.id]["percentage"], 0)
        self.assertEqual(rows[self.zero.id]["alpa"], 5)

    def test_at_least_90_includes_exactly_90_and_100(self):
        rows = self.rows_for("at_least_90")
        self.assertEqual(set(rows), {self.boundary.id, self.full.id, self.rounded.id})
        self.assertEqual(rows[self.boundary.id]["percentage"], 90)
        self.assertEqual(rows[self.full.id]["percentage"], 100)

    def test_category_uses_reported_percentage_after_rounding(self):
        # 112/125 is 89.6%, reported as 90%, so it belongs in >= 90%.
        row = self.rows_for("at_least_90")[self.rounded.id]
        self.assertEqual((row["hadir"], row["alpa"], row["percentage"]), (112, 13, 90))
        self.assertNotIn(self.rounded.id, self.rows_for("below_90"))

    def test_rounding_keeps_existing_python_half_to_even_behavior(self):
        for present, expected in [(177, 88), (179, 90), (181, 90)]:
            with self.subTest(present=present):
                student = User.objects.create_user(
                    email=f"rounding-{present}@percentage.test", name="Rounding", role="siswa", kelas=self.kelas,
                )
                self.add_attendance(student, self.subject, present, 200)
                category = "below_90" if expected < 90 else "at_least_90"
                self.assertEqual(self.rows_for(category)[student.id]["percentage"], expected)

    def test_category_is_applied_after_subject_filter(self):
        self.assertIn(self.low.id, self.rows_for("below_90"))
        self.params["mapelId"] = self.other_subject.id
        self.assertEqual(set(self.rows_for("at_least_90")), {self.low.id})
        self.assertEqual(set(self.rows_for("below_90")), {self.full.id})

    def test_subject_without_attendance_only_matches_all(self):
        self.params["mapelId"] = self.empty_subject.id
        self.assertEqual(len(self.rows_for("all")), 6)
        self.assertEqual(self.rows_for("below_90"), {})
        self.assertEqual(self.rows_for("at_least_90"), {})

    def test_unknown_category_returns_standard_bad_request(self):
        for category in ["under90", "90", "ALL", " below_90", "none"]:
            with self.subTest(category=category):
                response = self.client.get(self.url, {**self.params, "attendanceStatus": category})
                self.assertEqual(response.status_code, 400)
                self.assertFalse(response.data["success"])
                self.assertIn("attendanceStatus", response.data["errors"])

    def test_category_preserves_teacher_scope_and_access_restrictions(self):
        self.params.pop("kelasId")
        self.client.force_authenticate(self.teacher)
        self.assertEqual(set(self.rows_for("below_90")), {self.low.id, self.zero.id})
        self.params["kelasId"] = self.other_class.id
        self.assertEqual(self.rows_for("below_90"), {})
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.url, {**self.params, "attendanceStatus": "below_90"}).status_code, 401)
        self.client.force_authenticate(self.low)
        self.assertEqual(self.client.get(self.url, {**self.params, "attendanceStatus": "below_90"}).status_code, 403)


class AttendanceReportSortingTests(APITestCase):
    @classmethod
    def add_attendance(cls, student, subject, present, total):
        AbsensiSiswa.objects.bulk_create([
            AbsensiSiswa(
                siswa=student, kelas=student.kelas, mapel=subject,
                tanggal=datetime.date(2026, 1, 1) + datetime.timedelta(days=index),
                status="Hadir" if index < present else "Alpa",
            )
            for index in range(total)
        ])

    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_user(email="sort-admin@test.local", name="Admin", role="admin")
        cls.teacher = User.objects.create_user(email="sort-teacher@test.local", name="Guru", role="guru")
        cls.kelas = Kelas.objects.create(name="X-A", tingkat="X", wali_kelas=cls.teacher)
        cls.other_class = Kelas.objects.create(name="X-B", tingkat="X")
        cls.subject = MataPelajaran.objects.create(name="Matematika")
        cls.other_subject = MataPelajaran.objects.create(name="Fisika")
        cls.empty_subject = MataPelajaran.objects.create(name="Kimia")
        for student_id, name, present, total in [
            (120, "Budi", 4, 5), (103, "Citra", 9, 10), (130, "Ani", 5, 5),
            (110, "Ani", 4, 5), (150, "Dedi", 0, 5), (107, "Ayu", 0, 0),
            (109, "Ayu", 0, 0), (115, "ani", 5, 5),
        ]:
            student = User.objects.create_user(
                id=student_id, email=f"sort-{student_id}@test.local", name=name, role="siswa", kelas=cls.kelas,
            )
            cls.add_attendance(student, cls.subject, present, total)
        cls.add_attendance(User.objects.get(pk=120), cls.other_subject, 0, 5)
        cls.add_attendance(User.objects.get(pk=110), cls.other_subject, 5, 5)
        cls.outside = User.objects.create_user(
            id=180, email="sort-outside@test.local", name="Outside", role="siswa", kelas=cls.other_class,
        )
        cls.add_attendance(cls.outside, cls.subject, 5, 5)

    def setUp(self):
        self.url = "/api/reports/attendance/"
        self.client.force_authenticate(self.admin)
        self.params = {"kelasId": self.kelas.id, "mapelId": self.subject.id}

    def sorted_rows(self, **sorting):
        response = self.client.get(self.url, {**self.params, **sorting})
        self.assertEqual(response.status_code, 200)
        return response.data["data"]

    def test_name_defaults_and_empty_parameters_are_ascending(self):
        expected = [110, 115, 130, 107, 109, 120, 103, 150]
        for params in [{}, {"sortBy": "", "sortOrder": ""}, {"sortBy": "name", "sortOrder": "asc"}]:
            with self.subTest(params=params):
                self.assertEqual([row["siswaId"] for row in self.sorted_rows(**params)], expected)

    def test_name_descending_keeps_ids_ascending_for_equal_names(self):
        rows = self.sorted_rows(sortBy="name", sortOrder="desc")
        self.assertEqual([row["siswaId"] for row in rows], [150, 103, 120, 107, 109, 110, 115, 130])

    def test_percentage_ascending_is_numeric_and_places_missing_data_last(self):
        rows = self.sorted_rows(sortBy="percentage", sortOrder="asc")
        self.assertEqual([row["siswaId"] for row in rows], [150, 110, 120, 103, 115, 130, 107, 109])
        self.assertEqual([row["percentage"] for row in rows], [0, 80, 80, 90, 100, 100, 0, 0])
        self.assertEqual(rows[0]["alpa"], 5)

    def test_percentage_descending_keeps_missing_data_last_and_ties_name_then_id(self):
        rows = self.sorted_rows(sortBy="percentage", sortOrder="desc")
        self.assertEqual([row["siswaId"] for row in rows], [115, 130, 103, 110, 120, 150, 107, 109])

    def test_equal_values_use_stable_ids_after_a_later_insert(self):
        student = User.objects.create_user(
            id=105, email="sort-later@test.local", name="ANI", role="siswa", kelas=self.kelas,
        )
        self.add_attendance(student, self.subject, 5, 5)
        first = self.sorted_rows(sortBy="percentage", sortOrder="desc")
        self.assertEqual([row["siswaId"] for row in first[:3]], [105, 115, 130])
        self.assertEqual(self.sorted_rows(sortBy="percentage", sortOrder="desc"), first)

    def test_sorting_uses_the_filtered_class_subject_and_category(self):
        rows = self.sorted_rows(sortBy="percentage", sortOrder="desc", attendanceStatus="below_90")
        self.assertEqual([row["siswaId"] for row in rows], [110, 120, 150])
        self.params["mapelId"] = self.other_subject.id
        rows = self.sorted_rows(sortBy="percentage", sortOrder="desc", attendanceStatus="below_90")
        self.assertEqual([row["siswaId"] for row in rows], [120])
        self.assertEqual(rows[0]["percentage"], 0)
        self.params["mapelId"] = self.empty_subject.id
        self.assertEqual(self.sorted_rows(sortBy="percentage", attendanceStatus="below_90"), [])

    def test_unknown_sort_fields_and_orders_return_standard_bad_request(self):
        for field, value in [("sortBy", "nis"), ("sortBy", "name,-id"), ("sortOrder", "ASC"), ("sortOrder", "random")]:
            with self.subTest(field=field, value=value):
                response = self.client.get(self.url, {**self.params, field: value})
                self.assertEqual(response.status_code, 400)
                self.assertFalse(response.data["success"])
                self.assertIn(field, response.data["errors"])

    def test_sorting_preserves_teacher_scope(self):
        self.params.pop("kelasId")
        self.client.force_authenticate(self.teacher)
        rows = self.sorted_rows(sortBy="percentage", sortOrder="desc")
        self.assertEqual([row["siswaId"] for row in rows], [115, 130, 103, 110, 120, 150, 107, 109])
        self.params["kelasId"] = self.other_class.id
        self.assertEqual(self.sorted_rows(sortBy="name", sortOrder="desc"), [])
