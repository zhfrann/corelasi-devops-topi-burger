import openpyxl
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import login_required, permission_required
from reportlab.pdfgen import canvas
import io

# 1. Fitur Export Laporan ke Excel
@login_required
@permission_required('auth.view_user', raise_exception=True)
def export_excel_report(request):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Laporan Topi Burger"

    # Header Tabel
    ws.append(['ID', 'Kategori / Aktivitas', 'Dilakukan Oleh', 'Tanggal'])

    # Contoh data dummy (bisa diganti queryset database asli)
    data_rows = [
        [1, 'Manajemen Pengguna', 'Super Admin', '2026-11-08'],
        [2, 'Statistik Dashboard', 'Manager', '2026-11-08']
    ]
    for row in data_rows:
        ws.append(row)

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    response['Content-Disposition'] = 'attachment; filename="Laporan_Topi_Burger.xlsx"'
    wb.save(response)
    return response

# 2. Fitur Export Laporan ke PDF (Menggunakan ReportLab)
@login_required
@permission_required('auth.view_user', raise_exception=True)
def export_pdf_report(request):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)
    
    p.drawString(100, 750, "Laporan Ringkasan Operasional - Topi Burger")
    p.drawString(100, 730, "Dicetak otomatis oleh Sistem Django Backend")
    p.showPage()
    p.save()

    buffer.seek(0)
    return HttpResponse(buffer, content_type='application/pdf', headers={
        'Content-Disposition': 'attachment; filename="Laporan_Topi_Burger.pdf"'
    })

# 3. Fitur Dashboard Utama & Statistik Analitik
@login_required
def dashboard_analytics_api(request):
    # Logika agregasi statistik data
    stats_data = {
        "summary": {
            "totalUsers": 150,
            "totalTransactions": 1240,
            "activeStaff": 12
        },
        "chartTrends": [
            {"date": "2026-11-01", "count": 45},
            {"date": "2026-11-02", "count": 70},
            {"date": "2026-11-03", "count": 95},
            {"date": "2026-11-04", "count": 110}
        ]
    }
    return JsonResponse({"success": True, "data": stats_data})