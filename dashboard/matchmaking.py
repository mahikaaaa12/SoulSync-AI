import re


EDUCATION_RANKS = {
    'B.Com': 1,
    'B.Arch': 2,
    'B.Tech': 3,
    'BDS': 3,
    'LLB': 3,
    'M.Com': 4,
    'M.Tech': 5,
    'MCA': 5,
    'MBA': 5,
    'CA': 5,
    'MBBS': 5,
    'PhD': 6,
}


def calculate_compatibility(customer, candidate):
    """
    Return a 0-100 matchmaking score and human-readable explanation.

    The engine uses only fields currently available on the Customer model.
    """
    score = 0
    explanation = []

    score += _score_exact_text(
        customer.religion,
        candidate.religion,
        weight=15,
        reason='Same religion',
        explanation=explanation,
    )
    score += _score_exact_text(
        customer.caste,
        candidate.caste,
        weight=10,
        reason='Same caste',
        explanation=explanation,
    )
    score += _score_age(customer.age, candidate.age, explanation)
    score += _score_education(customer.education, candidate.education, explanation)
    score += _score_income(customer.income, candidate.income, explanation)
    score += _score_location(customer, candidate, explanation)
    score += _score_languages(customer.languages, candidate.languages, explanation)
    score += _score_preference(
        customer.wants_kids,
        candidate.wants_kids,
        weight=5,
        exact_reason='Same kids preference',
        flexible_reason='Flexible kids preference',
        explanation=explanation,
    )
    score += _score_preference(
        customer.open_to_pets,
        candidate.open_to_pets,
        weight=5,
        exact_reason='Same pet preference',
        flexible_reason='Flexible pet preference',
        explanation=explanation,
    )
    score += _score_preference(
        customer.open_to_relocate,
        candidate.open_to_relocate,
        weight=5,
        exact_reason='Same relocation preference',
        flexible_reason='Compatible relocation preferences',
        explanation=explanation,
    )

    return {
        'score': max(0, min(100, round(score))),
        'explanation': explanation,
    }


def _score_exact_text(first, second, weight, reason, explanation):
    if _normalize(first) and _normalize(first) == _normalize(second):
        explanation.append(reason)
        return weight
    return 0


def _score_age(first_age, second_age, explanation):
    gap = abs(first_age - second_age)
    if gap <= 3:
        explanation.append('Compatible age range')
        return 15
    if gap <= 6:
        explanation.append('Acceptable age range')
        return 10
    if gap <= 10:
        explanation.append('Moderate age gap')
        return 5
    return 0


def _score_education(first, second, explanation):
    first_norm = _normalize(first)
    second_norm = _normalize(second)
    if first_norm and first_norm == second_norm:
        explanation.append('Same education')
        return 10

    first_rank = _education_rank(first)
    second_rank = _education_rank(second)
    if first_rank and second_rank and abs(first_rank - second_rank) <= 1:
        explanation.append('Similar education')
        return 7
    return 0


def _score_income(first, second, explanation):
    first_income = _average_income_lpa(first)
    second_income = _average_income_lpa(second)
    if first_income is None or second_income is None:
        return 0

    difference = abs(first_income - second_income)
    if difference <= 5:
        explanation.append('Similar income range')
        return 10
    if difference <= 12:
        explanation.append('Compatible income range')
        return 6
    return 0


def _score_location(customer, candidate, explanation):
    same_city = _normalize(customer.city) and _normalize(customer.city) == _normalize(candidate.city)
    same_state = _normalize(customer.state) and _normalize(customer.state) == _normalize(candidate.state)

    if same_city:
        explanation.append('Same city')
        return 15
    if same_state:
        explanation.append('Same state')
        return 10
    if _is_flexible(customer.open_to_relocate) or _is_flexible(candidate.open_to_relocate):
        explanation.append('Compatible location preferences')
        return 8
    return 0


def _score_languages(first, second, explanation):
    first_languages = _language_set(first)
    second_languages = _language_set(second)
    shared = first_languages & second_languages

    if not shared:
        return 0
    if len(shared) >= 2:
        explanation.append('Multiple shared languages')
        return 10

    explanation.append('Shared language')
    return 6


def _score_preference(first, second, weight, exact_reason, flexible_reason, explanation):
    first_norm = _normalize(first)
    second_norm = _normalize(second)

    if first_norm and first_norm == second_norm:
        explanation.append(exact_reason)
        return weight
    if _is_flexible(first) or _is_flexible(second):
        explanation.append(flexible_reason)
        return round(weight * 0.6, 2)
    return 0


def _education_rank(value):
    normalized = _normalize(value)
    for label, rank in EDUCATION_RANKS.items():
        if _normalize(label) == normalized:
            return rank
    return None


def _average_income_lpa(value):
    numbers = [float(item) for item in re.findall(r'\d+(?:\.\d+)?', value or '')]
    if not numbers:
        return None
    return sum(numbers) / len(numbers)


def _language_set(value):
    return {
        _normalize(language)
        for language in (value or '').split(',')
        if _normalize(language)
    }


def _is_flexible(value):
    return _normalize(value) in {'maybe', 'yes'}


def _normalize(value):
    return str(value or '').strip().lower()


__all__ = ['calculate_compatibility']
