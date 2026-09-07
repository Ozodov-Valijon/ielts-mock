def check_answer(user_answer: str, correct_answer: str) -> bool:
    return user_answer.strip().lower() == correct_answer.strip().lower()

def calculate_reading_score(correct_count: int) -> float:
    # Simplified mock table
    if correct_count >= 39: return 9.0
    if correct_count >= 37: return 8.5
    if correct_count >= 35: return 8.0
    if correct_count >= 33: return 7.5
    if correct_count >= 30: return 7.0
    if correct_count >= 27: return 6.5
    if correct_count >= 23: return 6.0
    if correct_count >= 19: return 5.5
    if correct_count >= 15: return 5.0
    return 4.0

def calculate_listening_score(correct_count: int) -> float:
    return calculate_reading_score(correct_count)

def calculate_overall_band(scores: list[float]) -> float:
    valid = [s for s in scores if s is not None]
    if not valid: return 0.0
    avg = sum(valid) / len(valid)
    return round(avg * 2) / 2
