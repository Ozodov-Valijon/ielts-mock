import re

def normalize_text(text: str) -> str:
    """Matnni tinish belgilari va ortiqcha bo'shliqlardan tozalash"""
    if not text:
        return ""
    # Tinish belgilarini bo'shliq bilan almashtiramiz
    cleaned = re.sub(r'[^\w\s]', ' ', text.strip().lower())
    # Ortiqcha ketma-ket bo'shliqlarni bitta bo'shliqqa aylantiramiz
    return re.sub(r'\s+', ' ', cleaned).strip()

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
    variants = re.split(r'[/;|]', correct_answer)
    
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

        # Raqamlar ekvivalenti: "6" == "six", "6 pm" == "6:00 pm"
        user_no_pm = re.sub(r'\b(pm|am|o clock)\b', '', norm_user).strip()
        var_no_pm = re.sub(r'\b(pm|am|o clock)\b', '', norm_var).strip()
        if user_no_pm == var_no_pm:
            return True

        # Raqam so'z shakli
        if norm_user in number_words and number_words[norm_user] == norm_var:
            return True
        if norm_var in number_words and number_words[norm_var] == norm_user:
            return True

    return False

def _score_by_percentage(percentage: float) -> float:
    """
    Rasmiy Cambridge / British Council IELTS ball shkalasi (foizga moslashtirilgan):
    88%+ -> 9.0
    83%-87% -> 8.5
    78%-82% -> 8.0
    73%-77% -> 7.5
    68%-72% -> 7.0
    60%-67% -> 6.5
    52%-59% -> 6.0
    43%-51% -> 5.5
    35%-42% -> 5.0
    28%-34% -> 4.5
    20%-27% -> 4.0
    13%-19% -> 3.5
    8%-12% -> 3.0
    0%-7% -> 2.5
    """
    if percentage >= 0.88: return 9.0
    if percentage >= 0.82: return 8.5
    if percentage >= 0.77: return 8.0
    if percentage >= 0.72: return 7.5
    if percentage >= 0.67: return 7.0
    if percentage >= 0.59: return 6.5
    if percentage >= 0.51: return 6.0
    if percentage >= 0.42: return 5.5
    if percentage >= 0.34: return 5.0
    if percentage >= 0.27: return 4.5
    if percentage >= 0.19: return 4.0
    if percentage >= 0.12: return 3.5
    if percentage >= 0.05: return 3.0
    if percentage > 0.0:  return 2.5
    return 2.0

def calculate_reading_score(correct_count: int, total_questions: int = 40) -> float:
    """
    IELTS Reading ballini savollar soniga mutanosib (proporsional) hisoblash.
    Agar testda 5 ta savol bo'lsa va 5 tasi to'g'ri bo'lsa -> Band 9.0 bo'ladi!
    """
    if total_questions <= 0 or correct_count <= 0:
        return 2.0
    
    # 40 talik to'liq test bo'lsa rasmiy jadval
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
        if correct_count >= 1:  return 2.5
        return 2.0

    percentage = min(correct_count / total_questions, 1.0)
    return _score_by_percentage(percentage)

def calculate_listening_score(correct_count: int, total_questions: int = 40) -> float:
    """
    IELTS Listening ballini savollar soniga mutanosib hisoblash.
    """
    if total_questions <= 0 or correct_count <= 0:
        return 2.0
        
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
        if correct_count >= 1:  return 2.5
        return 2.0

    percentage = min(correct_count / total_questions, 1.0)
    return _score_by_percentage(percentage)

def calculate_overall_band(scores: list[float]) -> float:
    """
    IELTS qoidasiga ko'ra umumiy Band Score hisoblash:
    4 ta bo'lim o'rtachasi 0.25 va 0.75 chegaralari bo'yicha eng yaqin 0.5 ga yaxlitlanadi.
    Masalan:
    6.25 -> 6.5
    6.75 -> 7.0
    6.125 -> 6.0
    """
    valid = [s for s in scores if s is not None and s > 0]
    if not valid:
        return 2.0
    
    avg = sum(valid) / len(valid)
    decimal_part = avg - int(avg)
    
    if decimal_part < 0.25:
        return float(int(avg))
    elif decimal_part < 0.75:
        return float(int(avg)) + 0.5
    else:
        return float(int(avg)) + 1.0
