import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_comprehensive_check():
    print("=" * 70)
    print("       IELTS MOCK PLATFORMASI: TO'LIQ AUDIT VA TEKSHIRUV")
    print("=" * 70)

    # 1. Tizim holati (Healthcheck)
    print("\n[1/10] Tizim holatini (Healthcheck) tekshirish...")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    assert res.json()["status"] == "online"
    print("  [OK] Backend onlayn va to'g'ri javob bermoqda:", res.json())

    # 2. Autentifikatsiya va rollar (Auth & Roles)
    print("\n[2/10] Foydalanuvchilar autentifikatsiyasi va JWT nazorati...")
    # Talaba login
    res = client.post("/api/v1/auth/login", json={"email": "student@ielts.uz", "password": "student123"})
    assert res.status_code == 200, f"Talaba logini xato: {res.text}"
    student_token = res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    
    # /auth/me talaba tekshiruvi
    me_res = client.get("/api/v1/auth/me", headers=student_headers)
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "student"
    print(f"  [OK] Talaba muvaffaqiyatli tizimga kirdi: {me_res.json()['full_name']} (Role: student)")

    # Admin login
    admin_res = client.post("/api/v1/auth/login", json={"email": "admin@ielts.uz", "password": "admin123"})
    assert admin_res.status_code == 200, f"Admin logini xato: {admin_res.text}"
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    admin_me = client.get("/api/v1/auth/me", headers=admin_headers)
    assert admin_me.status_code == 200
    assert admin_me.json()["role"] == "admin"
    print(f"  [OK] Admin muvaffaqiyatli tizimga kirdi: {admin_me.json()['full_name']} (Role: admin)")

    # 3. Test yaratish
    print("\n[3/10] Yangi Test sessiyasini ochish...")
    test_res = client.post("/api/v1/tests", headers=student_headers)
    assert test_res.status_code == 200
    test_id = test_res.json()["id"]
    print(f"  [OK] Yangi test ochildi: Test ID #{test_id}")

    # 4. Set 1 va Set 2 savollarini tekshirish (Reading, Listening, Writing, Speaking)
    print("\n[4/10] Set 1 va Set 2 savollarining bazadagi mavjudligi va formati...")
    # Set 1
    r1_qs = client.get(f"/api/v1/tests/{test_id}/reading/questions?set_number=1", headers=student_headers).json()
    l1_qs = client.get(f"/api/v1/tests/{test_id}/listening/questions?set_number=1", headers=student_headers).json()
    w1_qs = client.get(f"/api/v1/tests/{test_id}/writing/topics?set_number=1", headers=student_headers).json()
    s1_qs = client.get(f"/api/v1/tests/{test_id}/speaking/topics?set_number=1", headers=student_headers).json()
    assert len(r1_qs) >= 10, f"Set 1 Reading kutilgan kamida 10, olindi {len(r1_qs)}"
    assert len(l1_qs) >= 10, f"Set 1 Listening kutilgan kamida 10, olindi {len(l1_qs)}"
    assert len(w1_qs) == 2, f"Set 1 Writing kutilgan 2, olindi {len(w1_qs)}"
    assert len(s1_qs) == 3, f"Set 1 Speaking kutilgan 3, olindi {len(s1_qs)}"
    print(f"  [OK] Cambridge Set #1 savollari to'liq: R={len(r1_qs)}, L={len(l1_qs)}, W={len(w1_qs)}, S={len(s1_qs)}")

    # Set 2
    r2_qs = client.get(f"/api/v1/tests/{test_id}/reading/questions?set_number=2", headers=student_headers).json()
    l2_qs = client.get(f"/api/v1/tests/{test_id}/listening/questions?set_number=2", headers=student_headers).json()
    w2_qs = client.get(f"/api/v1/tests/{test_id}/writing/topics?set_number=2", headers=student_headers).json()
    s2_qs = client.get(f"/api/v1/tests/{test_id}/speaking/topics?set_number=2", headers=student_headers).json()
    assert len(r2_qs) >= 10, f"Set 2 Reading kutilgan kamida 10, olindi {len(r2_qs)}"
    assert len(l2_qs) >= 10, f"Set 2 Listening kutilgan kamida 10, olindi {len(l2_qs)}"
    assert len(w2_qs) == 2, f"Set 2 Writing kutilgan 2, olindi {len(w2_qs)}"
    assert len(s2_qs) == 3, f"Set 2 Speaking kutilgan 3, olindi {len(s2_qs)}"
    print(f"  [OK] Cambridge Set #2 savollari to'liq: R={len(r2_qs)}, L={len(l2_qs)}, W={len(w2_qs)}, S={len(s2_qs)}")

    # 5. Reading baholash algoritmi (Scoring, Normalizatsiya va 0.0 holatlari)
    print("\n[5/10] Reading bo'limi aniq baholash shkalasi (0.0 dan 9.0 gacha)...")
    # A) 100% to'g'ri javoblar
    perfect_answers = [
        {"question_id": r1_qs[0]["id"], "user_answer": "Emperor Shennong"},
        {"question_id": r1_qs[1]["id"], "user_answer": "true"},
        {"question_id": r1_qs[2]["id"], "user_answer": "Lu Yu"},
        {"question_id": r1_qs[3]["id"], "user_answer": "false"},
        {"question_id": r1_qs[4]["id"], "user_answer": "darjeeling"},
        {"question_id": r1_qs[5]["id"], "user_answer": "Camellia sinensis"},
        {"question_id": r1_qs[6]["id"], "user_answer": "antioxidant"},
        {"question_id": r1_qs[7]["id"], "user_answer": "false"},
        {"question_id": r1_qs[8]["id"], "user_answer": "East India Company"},
        {"question_id": r1_qs[9]["id"], "user_answer": "false"},
    ]
    sub1 = client.post(f"/api/v1/tests/{test_id}/reading/submit", headers=student_headers, json={"answers": perfect_answers}).json()
    assert sub1["score"] == 9.0, f"10/10 to'g'ri javob uchun 9.0 kutilgan edi, olindi: {sub1['score']}"
    print(f"  [OK] 10/10 to'g'ri javob uchun: {sub1['score']} (Band 9.0 tasdiqlandi)")

    # B) 0 ta to'g'ri javob (Loophole tekshiruvi: 0 ta to'g'riga 0.0 berilishi shart)
    zero_answers = [
        {"question_id": r1_qs[0]["id"], "user_answer": "x"},
        {"question_id": r1_qs[1]["id"], "user_answer": "y"},
    ]
    sub0 = client.post(f"/api/v1/tests/{test_id}/reading/submit", headers=student_headers, json={"answers": zero_answers}).json()
    assert sub0["score"] == 0.0, f"0 to'g'ri javob uchun 0.0 kutilgan edi, olindi: {sub0['score']}"
    print(f"  [OK] 0/10 to'g'ri javob uchun: {sub0['score']} (Qat'iy 0.0 tasdiqlandi)")

    # 6. Listening baholash algoritmi
    print("\n[6/10] Listening bo'limi baholash va son normalizatsiyasi...")
    l_answers = [
        {"question_id": l1_qs[0]["id"], "user_answer": "Registering for a library membership card"},
        {"question_id": l1_qs[3]["id"], "user_answer": "6 pm"}, # '6' yoki 'six' ekvivalenti
    ]
    sub_l = client.post(f"/api/v1/tests/{test_id}/listening/submit", headers=student_headers, json={"answers": l_answers}).json()
    assert sub_l["score"] >= 2.0
    print(f"  [OK] Listening 2 ta to'g'ri javob uchun ball: {sub_l['score']} (Sinonim '6 pm' to'g'ri qabul qilindi)")

    # 7. Writing AI Baholash va Hajm Jarimalari
    print("\n[7/10] Writing AI baholash va soxta/1 harfli insholarga 0.0 berish...")
    # A) 1 harfli soxta insho ("a" yoki "def")
    fake_w1 = client.post(f"/api/v1/tests/{test_id}/writing/submit", headers=student_headers, json={"task_number": 1, "user_text": "a"}).json()
    assert fake_w1["ai_analysis"]["ai_score"] == 0.0, f"1 harf uchun 0.0 kutilgan edi, olindi: {fake_w1['ai_analysis']['ai_score']}"
    print(f"  [OK] 1 harfli insho ('a') uchun ball: {fake_w1['ai_analysis']['ai_score']} (Qat'iy 0.0 qaytarildi)")

    # B) Haqiqiy akademik insho
    real_text_1 = """The supplied bar chart illustrates the employment proportion of recent university alumni across three distinct European jurisdictions over a decade-long period spanning from 2010 to 2020. Overall, a positive upward trajectory is evident in full-time employment acquisition across all scrutinized countries. Country A maintained the predominant position throughout the entire survey duration, whilst Country C exhibited the most pronounced proportional growth despite starting from the lowest baseline figure."""
    real_w1 = client.post(f"/api/v1/tests/{test_id}/writing/submit", headers=student_headers, json={"task_number": 1, "user_text": real_text_1}).json()
    assert real_w1["ai_analysis"]["ai_score"] >= 2.0
    print(f"  [OK] Mazmunli Task 1 inshosi uchun AI bahosi: {real_w1['ai_analysis']['ai_score']}")

    real_text_2 = """In contemporary educational discourse, the unprecedented progression of artificial intelligence and educational technology has triggered heated debate concerning the longevity of traditional pedagogical institutions. Proponents of digital disruption argue that automated adaptive algorithms can provide personalized pacing and instantaneous diagnostic evaluations far surpassing human capacity. Conversely, traditionalists firmly maintain that human educators provide indispensable psychological scaffolding, moral guidance, and empathic mentorship that no algorithmic model can replicate. In my view, technology should serve strictly as a pedagogical accelerator rather than a wholesale replacement for educators."""
    real_w2 = client.post(f"/api/v1/tests/{test_id}/writing/submit", headers=student_headers, json={"task_number": 2, "user_text": real_text_2}).json()
    assert real_w2["ai_analysis"]["ai_score"] >= 2.0
    print(f"  [OK] Mazmunli Task 2 inshosi uchun AI bahosi: {real_w2['ai_analysis']['ai_score']}")

    # 8. Anti-Cheat xavfsizlik nazorati (Tab switch, Fullscreen exit, Paste attempt)
    print("\n[8/10] Anti-Cheat xavfsizlik tizimi va avtomatik Flaglash...")
    # Fullscreen chiqish hodisasi
    ac1 = client.post(f"/api/v1/tests/{test_id}/anticheat-event", headers=student_headers, json={"event_type": "fullscreen_exit", "details": "Foydalanuvchi to'liq ekrandan chiqdi"}).json()
    assert ac1["tab_switches"] >= 1
    print(f"  [OK] 'fullscreen_exit' hodisasi qayd etildi: Tab switches={ac1['tab_switches']}")

    # Tab almashtirish hodisasi
    ac2 = client.post(f"/api/v1/tests/{test_id}/anticheat-event", headers=student_headers, json={"event_type": "tab_switch", "details": "Boshqa vkladkaga o'tildi"}).json()
    
    # 3-marta qoidabuzarlik -> Flag qilish
    ac3 = client.post(f"/api/v1/tests/{test_id}/anticheat-event", headers=student_headers, json={"event_type": "tab_switch", "details": "Yana boshqa tabga o'tildi"}).json()
    assert ac3["is_flagged_cheating"] is True
    print(f"  [OK] 3-qoidabuzarlikdan so'ng avtomatik chiterlik qayd etildi: is_flagged_cheating={ac3['is_flagged_cheating']}")

    # 9. Yakuniy Natijalar va Feedback (/feedback)
    print("\n[9/10] Yakuniy hisob-kitob, savolma-savol tahlil va IELTS Band Score...")
    fb_res = client.get(f"/api/v1/tests/{test_id}/feedback", headers=student_headers)
    assert fb_res.status_code == 200
    fb = fb_res.json()
    print(f"  [OK] Reading Score : {fb['reading_score']}")
    print(f"  [OK] Listening Score: {fb['listening_score']}")
    print(f"  [OK] Writing Score  : {fb['writing_score']}")
    print(f"  [OK] Speaking Score : {fb['speaking_score']}")
    print(f"  [OK] OVERALL BAND   : {fb['overall_band']}")
    assert "reading_details" in fb and len(fb["reading_details"]) > 0
    assert "listening_details" in fb and len(fb["listening_details"]) > 0
    assert fb["anti_cheat"]["is_flagged_cheating"] is True
    print(f"  [OK] Savolma-savol Reading tahlillari: {len(fb['reading_details'])} ta")
    print(f"  [OK] Savolma-savol Listening tahlillari: {len(fb['listening_details'])} ta")

    # 10. Admin Panel va Statistika
    print("\n[10/10] Admin panel nazorati va ko'rib chiqish navbati...")
    stats = client.get("/api/v1/admin/stats", headers=admin_headers).json()
    assert "total_students" in stats and "total_tests" in stats
    print(f"  [OK] Admin statistikasi: Talabalar={stats['total_students']}, Testlar={stats['total_tests']}, Navbatdagilar={stats['pending_reviews']}")
    
    students = client.get("/api/v1/admin/students", headers=admin_headers).json()
    assert len(students) > 0
    print(f"  [OK] Admin talabalar ro'yxati olindi: {len(students)} nafar talaba")

    pending = client.get("/api/v1/admin/pending-reviews", headers=admin_headers).json()
    assert "writing_pending" in pending and "speaking_pending" in pending
    print(f"  [OK] Admin tekshiruv navbati: Writing={len(pending['writing_pending'])}, Speaking={len(pending['speaking_pending'])}")

    print("\n" + "=" * 70)
    print("   BARCHA 10 TA TIZIMIY MODUL VA ALGORITM 100% MUVAFFAQITYATLI O'TDI! [OK]")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    run_comprehensive_check()
