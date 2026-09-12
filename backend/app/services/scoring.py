import re
import unicodedata

def normalize_text(text: str) -> str:
    """Matnni tinish belgilari va ortiqcha bo'shliqlardan tozalash"""
    if not text:
        return ""
    cleaned = unicodedata.normalize("NFKC", text).casefold().replace("’", "'")
    return re.sub(r'\s+', ' ', cleaned).strip().rstrip(".,!?")

def check_answer(user_answer: str, correct_answer: str) -> bool:
    """
    Javobni professional tarzda tekshirish.
    1. Katta-kichik harflar va bo'shliqlar inobatga olinmaydi.
    2. Bir nechta to'g'ri variantlar (/, ;, | bilan ajratilgan) qo'llab-quvvatlanadi.
    3. Raqamlar va ularning yozma shakli (masalan '6' va 'six', '6:00' va '6 pm') tekshiriladi.
    """
    if not user_answer or not correct_answer:
        return False

    norm_user = normalize_text(user_answer)
    if not norm_user:
        return False

    # To'g'ri javoblar ro'yxatini ajratamiz (masalan: "Emperor Shennong / Shennong")
    variants = re.split(r'[;|]|\s+/\s+|(?<!\d)/(?!\d)', correct_answer)
    
    number_words = {
        '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
        '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten'
    }

    for variant in variants:
        norm_var = normalize_text(variant)
        if not norm_var:
            continue

        # To'g'ridan-to'g'ri tenglik
        if norm_user == norm_var:
            return True

        # True / False qisqartmalari (T -> True, F -> False)
        if norm_var == 'true' and norm_user in ['true', 't']:
            return True
        if norm_var == 'false' and norm_user in ['false', 'f']:
            return True
        if norm_var == 'not given' and norm_user in ['not given', 'ng', 'notgiven']:
            return True

        # Preserve AM/PM and decimals: 6 AM must never match 6 PM.
        time_pattern = r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)'
        user_time = re.fullmatch(time_pattern, norm_user)
        correct_time = re.fullmatch(time_pattern, norm_var)
        if user_time and correct_time:
            user_parts = (int(user_time[1]), user_time[2] or '00', user_time[3])
            correct_parts = (int(correct_time[1]), correct_time[2] or '00', correct_time[3])
            if user_parts == correct_parts:
                return True

        # Raqam so'z shakli
        if norm_user in number_words and number_words[norm_user] == norm_var:
            return True
        if norm_var in number_words and number_words[norm_var] == norm_user:
            return True

    return False

def _score_by_percentage(percentage: float) -> float:
    """
    Legacy demo-only approximation; this is not an official IELTS conversion:
    90%-100% -> 9.0
    82%-89%  -> 8.5
    75%-81%  -> 8.0
    68%-74%  -> 7.5
    60%-67%  -> 7.0
    53%-59%  -> 6.5
    45%-52%  -> 6.0
    38%-44%  -> 5.5
    30%-37%  -> 5.0
    23%-29%  -> 4.0
    16%-22%  -> 3.0
    8%-15%   -> 2.0
    1%-7%    -> 1.0
    0%       -> 0.0
    """
    if percentage >= 0.90: return 9.0
    if percentage >= 0.82: return 8.5
    if percentage >= 0.75: return 8.0
    if percentage >= 0.68: return 7.5
    if percentage >= 0.60: return 7.0
    if percentage >= 0.53: return 6.5
    if percentage >= 0.45: return 6.0
    if percentage >= 0.38: return 5.5
    if percentage >= 0.30: return 5.0
    if percentage >= 0.23: return 4.0
    if percentage >= 0.16: return 3.0
    if percentage >= 0.08: return 2.0
    if percentage > 0.0:   return 1.0
    return 0.0

def calculate_reading_score(correct_count: int, total_questions: int = 40) -> float:
    """
    IELTS Reading ballini savollar soniga mutanosib (proporsional) hisoblash.
    Agar bitta ham to'g'ri bo'lmasa -> 0.0 qaytariladi!
    """
    if total_questions <= 0 or correct_count <= 0:
        return 0.0
    
    # Practice conversion; actual IELTS raw-score boundaries vary by test.
    if total_questions == 40:
        if correct_count >= 39: return 9.0
        if correct_count >= 37: return 8.5
        if correct_count >= 35: return 8.0
        if correct_count >= 33: return 7.5
        if correct_count >= 30: return 7.0
        if correct_count >= 27: return 6.5
        if correct_count >= 23: return 6.0
        if correct_count >= 19: return 5.5
        if correct_count >= 15: return 5.0
        if correct_count >= 13: return 4.5
        if correct_count >= 10: return 4.0
        if correct_count >= 6:  return 3.5
        if correct_count >= 4:  return 3.0
        if correct_count >= 2:  return 2.5
        if correct_count >= 1:  return 1.0
        return 0.0

    percentage = min(correct_count / total_questions, 1.0)
    return _score_by_percentage(percentage)

def calculate_listening_score(correct_count: int, total_questions: int = 40) -> float:
    """
    IELTS Listening ballini savollar soniga mutanosib hisoblash.
    Agar bitta ham to'g'ri bo'lmasa -> 0.0 qaytariladi!
    """
    if total_questions <= 0 or correct_count <= 0:
        return 0.0
        
    if total_questions == 40:
        if correct_count >= 39: return 9.0
        if correct_count >= 37: return 8.5
        if correct_count >= 35: return 8.0
        if correct_count >= 32: return 7.5
        if correct_count >= 30: return 7.0
        if correct_count >= 26: return 6.5
        if correct_count >= 23: return 6.0
        if correct_count >= 18: return 5.5
        if correct_count >= 16: return 5.0
        if correct_count >= 13: return 4.5
        if correct_count >= 10: return 4.0
        if correct_count >= 6:  return 3.5
        if correct_count >= 4:  return 3.0
        if correct_count >= 2:  return 2.5
        if correct_count >= 1:  return 1.0
        return 0.0

    percentage = min(correct_count / total_questions, 1.0)
    return _score_by_percentage(percentage)

def calculate_overall_band(scores: list[float]) -> float:
    """
    IELTS qoidasiga ko'ra umumiy Band Score hisoblash:
    4 ta bo'lim o'rtachasi 0.25 va 0.75 chegaralari bo'yicha eng yaqin 0.5 ga yaxlitlanadi.
    Agar hamma bo'limlar 0 bo'lsa yoki topshirilmagan bo'lsa -> 0.0 qaytariladi!
    """
    if not scores or len(scores) == 0:
        return 0.0
        
    clean_scores = [float(s) if s is not None else 0.0 for s in scores]
    if all(s == 0.0 for s in clean_scores):
        return 0.0
    
    # 4 ta bo'lim bo'yicha haqiqiy o'rtacha ball
    avg = sum(clean_scores) / len(clean_scores)
    if avg < 0.25:
        return 0.0
    
    decimal_part = avg - int(avg)
    if decimal_part < 0.25:
        return float(int(avg))
    elif decimal_part < 0.75:
        return float(int(avg)) + 0.5
    else:
        return float(int(avg)) + 1.0
