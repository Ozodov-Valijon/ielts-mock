import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("--- 1. Root & Healthcheck ---")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    print("  [OK] Root endpoint:", res.json())

    print("--- 2. Student Login ---")
    res = client.post("/api/v1/auth/login", json={"email": "student@ielts.uz", "password": "student123"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    student_token = res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("  [OK] Student token olindi")

    print("--- 3. /auth/me ---")
    res = client.get("/api/v1/auth/me", headers=student_headers)
    assert res.status_code == 200, f"/auth/me failed: {res.text}"
    student_data = res.json()
    assert student_data["email"] == "student@ielts.uz"
    print("  [OK] Student profil:", student_data["full_name"])

    print("--- 4. Start New Test ---")
    res = client.post("/api/v1/tests", headers=student_headers)
    assert res.status_code == 200, f"Start test failed: {res.text}"
    test_id = res.json()["id"]
    print(f"  [OK] Yangi test boshlandi: ID = {test_id}")

    print("--- 5. Get Reading Questions ---")
    res = client.get(f"/api/v1/tests/{test_id}/reading/questions", headers=student_headers)
    assert res.status_code == 200, f"Reading questions failed: {res.text}"
    questions = res.json()
    assert len(questions) > 0, "Savollar yo'q!"
    print(f"  [OK] Reading savollari yuklandi: {len(questions)} ta")

    print("--- 6. Submit Reading Answers ---")
    answers = [
        {"question_id": questions[0]["id"], "user_answer": "Emperor Shennong"},
        {"question_id": questions[1]["id"], "user_answer": "True"},
    ]
    res = client.post(f"/api/v1/tests/{test_id}/reading/submit", headers=student_headers, json={"answers": answers})
    assert res.status_code == 200, f"Reading submit failed: {res.text}"
    print("  [OK] Reading natijasi:", res.json()["score"])

    print("--- 7. Get Listening Questions & Submit ---")
    res = client.get(f"/api/v1/tests/{test_id}/listening/questions", headers=student_headers)
    assert res.status_code == 200
    l_questions = res.json()
    l_answers = [
        {"question_id": l_questions[0]["id"], "user_answer": "Registering for a library membership card"}
    ]
    res = client.post(f"/api/v1/tests/{test_id}/listening/submit", headers=student_headers, json={"answers": l_answers})
    assert res.status_code == 200
    print("  [OK] Listening natijasi:", res.json()["score"])

    print("--- 8. Submit Writing Task 1 & Task 2 ---")
    res = client.post(
        f"/api/v1/tests/{test_id}/writing/submit", 
        headers=student_headers, 
        json={"task_number": 1, "user_text": "The provided bar chart compares full-time employment rates among university graduates in three European nations over a ten-year timeframe from 2010 to 2020. Overall, substantial upward trajectories were observed across all scrutinized jurisdictions, with Country A consistently dominating the ranking."}
    )
    assert res.status_code == 200
    print("  [OK] Writing Task 1 qabul qilindi, AI bahosi:", res.json()["ai_analysis"]["ai_score"])

    res = client.post(
        f"/api/v1/tests/{test_id}/writing/submit", 
        headers=student_headers, 
        json={"task_number": 2, "user_text": "In contemporary pedagogical debates, the role of cutting-edge technology and artificial intelligence in education has ignited polarizing viewpoints. While some proponents assert that digital tools can supplant conventional educators, I contend that human mentorship remains entirely irreplaceable due to empathetic engagement and psychological guidance."}
    )
    assert res.status_code == 200
    print("  [OK] Writing Task 2 qabul qilindi, AI bahosi:", res.json()["ai_analysis"]["ai_score"])

    print("--- 9. Anti-Cheat Event Tracking ---")
    # Simulate tab switch and paste events
    for _ in range(3):
        res = client.post(
            f"/api/v1/tests/{test_id}/anticheat-event",
            headers=student_headers,
            json={"event_type": "tab_switch", "details": "Foydalanuvchi boshqa tabga o'tdi"}
        )
        assert res.status_code == 200, f"Anti-cheat event failed: {res.text}"
    
    res = client.post(
        f"/api/v1/tests/{test_id}/anticheat-event",
        headers=student_headers,
        json={"event_type": "paste_attempt", "details": "Nusxa qo'yishga urinildi"}
    )
    assert res.status_code == 200
    ac_status = res.json()
    assert ac_status["tab_switches"] == 3
    assert ac_status["paste_attempts"] == 1
    assert ac_status["is_flagged_cheating"] is True
    print(f"  [OK] Anti-cheat signali qayd etildi: Tab switches={ac_status['tab_switches']}, Flagged={ac_status['is_flagged_cheating']}")

    print("--- 10. Get Overall Feedback & Results Breakdown ---")
    res = client.get(f"/api/v1/tests/{test_id}/feedback", headers=student_headers)
    assert res.status_code == 200
    fb = res.json()
    assert "anti_cheat" in fb
    assert fb["anti_cheat"]["is_flagged_cheating"] is True
    assert "reading_details" in fb
    assert len(fb["reading_details"]) > 0
    print(f"  [OK] Yakuniy Band Score: {fb['overall_band']} (Reading: {fb['reading_score']}, Listening: {fb['listening_score']}, Writing: {fb['writing_score']})")
    print(f"  [OK] Anti-cheat xulosasi: Shubhali={fb['anti_cheat']['is_flagged_cheating']}, Tab switches={fb['anti_cheat']['tab_switches']}")
    print(f"  [OK] Reading savolma-savol tahlil elementlari soni: {len(fb['reading_details'])} ta")

    print("--- 11. Admin Login & Stats ---")
    res = client.post("/api/v1/auth/login", json={"email": "admin@ielts.uz", "password": "admin123"})
    assert res.status_code == 200
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    res = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert res.status_code == 200
    print("  [OK] Admin statistika:", res.json())

    res = client.get("/api/v1/admin/pending-reviews", headers=admin_headers)
    assert res.status_code == 200
    pending = res.json()
    print(f"  [OK] Admin tekshiruv navbati: Writing ({len(pending['writing_pending'])} ta), Speaking ({len(pending['speaking_pending'])} ta)")
    if len(pending["writing_pending"]) > 0:
        first_w = pending["writing_pending"][0]
        print(f"  [OK] Admin writing tekshiruvi anti-cheat ma'lumoti: {first_w.get('student_name')} | Tab switches: {first_w.get('tab_switches')}")

    print("\n=======================================================")
    print("   BARCHA 11 TA INTEGRATION TEST MUVAFFAQITYATLI O'TDI! [OK]")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()
