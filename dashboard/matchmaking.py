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
    Return a 0-100 matchmaking score, human-readable explanation, and score breakdown.

    The engine uses only fields currently available on the Customer model.
    """
    gender = _normalize(getattr(customer, 'gender', None))
    if gender == 'male':
        return _calculate_male_compatibility(customer, candidate)
    elif gender == 'female':
        return _calculate_female_compatibility(customer, candidate)
    else:
        return _calculate_default_compatibility(customer, candidate)


def _parse_height_inches(height_str):
    if not height_str:
        return None
    h = str(height_str).strip()
    match = re.match(r"^(\d+)'\s*(\d+)?\"?$", h)
    if match:
        feet = int(match.group(1))
        inches = int(match.group(2)) if match.group(2) else 0
        return feet * 12 + inches
    digits = re.findall(r'\d+', h)
    if len(digits) >= 2:
        return int(digits[0]) * 12 + int(digits[1])
    elif len(digits) == 1:
        val = int(digits[0])
        if val > 100:
            return val / 2.54
        else:
            return val * 12
    return None


def _calculate_male_compatibility(customer, candidate):
    explanation = []
    breakdown = {}

    # 1. Religion (weight=10)
    religion_score = _score_exact_text(
        customer.religion,
        candidate.religion,
        weight=10,
        reason='Same religion',
        explanation=explanation,
    )
    breakdown['religion'] = religion_score

    # 2. Caste (weight=5)
    caste_score = _score_exact_text(
        customer.caste,
        candidate.caste,
        weight=5,
        reason='Same caste',
        explanation=explanation,
    )
    breakdown['caste'] = caste_score

    # 3. Age (weight=15) - Prefer younger females
    age_score = 0
    candidate_gender = getattr(candidate, 'gender', None)
    if _normalize(candidate_gender) == 'female':
        if candidate.age < customer.age:
            diff = customer.age - candidate.age
            if diff <= 3:
                age_score = 15
                explanation.append('Preferred younger age range')
            elif diff <= 6:
                age_score = 12
                explanation.append('Acceptable younger age range')
            else:
                age_score = 8
                explanation.append('Slightly larger age gap (younger)')
        elif candidate.age == customer.age:
            age_score = 5
            explanation.append('Same age')
        else:
            age_score = 0
            explanation.append('Older age range')
    else:
        age_score = _score_age(customer.age, candidate.age, explanation)
    breakdown['age'] = age_score

    # 4. Height (weight=10) - Prefer shorter females
    height_score = 0
    if _normalize(candidate_gender) == 'female':
        cust_height = _parse_height_inches(customer.height)
        cand_height = _parse_height_inches(candidate.height)
        if cust_height is not None and cand_height is not None:
            if cand_height < cust_height:
                height_score = 10
                explanation.append('Preferred height difference (shorter candidate)')
            else:
                height_score = 0
                explanation.append('Candidate is not shorter than the customer')
        else:
            height_score = 5
            explanation.append('Height information incomplete')
    else:
        height_score = 0
    breakdown['height'] = height_score

    # 5. Income (weight=10) - Prefer income <= customer income
    income_score = 0
    if _normalize(candidate_gender) == 'female':
        cust_income = _average_income_lpa(customer.income)
        cand_income = _average_income_lpa(candidate.income)
        if cust_income is not None and cand_income is not None:
            if cand_income <= cust_income:
                income_score = 10
                explanation.append('Preferred income range (candidate income is less than or equal)')
            else:
                income_score = 0
                explanation.append("Candidate income is higher than the customer's income")
        else:
            income_score = 5
            explanation.append('Income information incomplete')
    else:
        income_score = 0
    breakdown['income'] = income_score

    # 6. Education (weight=5)
    education_score = 0
    first_norm = _normalize(customer.education)
    second_norm = _normalize(candidate.education)
    if first_norm and first_norm == second_norm:
        explanation.append('Same education')
        education_score = 5
    else:
        first_rank = _education_rank(customer.education)
        second_rank = _education_rank(candidate.education)
        if first_rank and second_rank and abs(first_rank - second_rank) <= 1:
            explanation.append('Similar education')
            education_score = 3
    breakdown['education'] = education_score

    # 7. Location (weight=10)
    location_score = 0
    same_city = _normalize(customer.city) and _normalize(customer.city) == _normalize(candidate.city)
    same_state = _normalize(customer.state) and _normalize(customer.state) == _normalize(candidate.state)
    if same_city:
        explanation.append('Same city')
        location_score = 10
    elif same_state:
        explanation.append('Same state')
        location_score = 7
    elif _is_flexible(customer.open_to_relocate) or _is_flexible(candidate.open_to_relocate):
        explanation.append('Compatible location preferences')
        location_score = 5
    breakdown['location'] = location_score

    # 8. Languages (weight=5)
    languages_score = 0
    first_languages = _language_set(customer.languages)
    second_languages = _language_set(candidate.languages)
    shared = first_languages & second_languages
    if shared:
        if len(shared) >= 2:
            explanation.append('Multiple shared languages')
            languages_score = 5
        else:
            explanation.append('Shared language')
            languages_score = 3
    breakdown['languages'] = languages_score

    # 9. Wants Kids (weight=25) - Agreement on wanting children
    wants_kids_score = 0
    first_norm = _normalize(customer.wants_kids)
    second_norm = _normalize(candidate.wants_kids)
    if first_norm and first_norm == second_norm:
        explanation.append('Strong agreement on wanting children')
        wants_kids_score = 25
    elif _is_flexible(customer.wants_kids) or _is_flexible(candidate.wants_kids):
        explanation.append('Compatible child preferences')
        wants_kids_score = 15
    else:
        explanation.append('Different preferences on wanting children')
    breakdown['wants_kids'] = wants_kids_score

    # 10. Open to pets (weight=3)
    pets_score = _score_preference(
        customer.open_to_pets,
        candidate.open_to_pets,
        weight=3,
        exact_reason='Same pet preference',
        flexible_reason='Flexible pet preference',
        explanation=explanation,
    )
    breakdown['open_to_pets'] = pets_score

    # 11. Open to relocate (weight=2)
    relocate_score = _score_preference(
        customer.open_to_relocate,
        candidate.open_to_relocate,
        weight=2,
        exact_reason='Same relocation preference',
        flexible_reason='Compatible relocation preferences',
        explanation=explanation,
    )
    breakdown['open_to_relocate'] = relocate_score

    score = sum(breakdown.values())
    return {
        'score': max(0, min(100, round(score))),
        'explanation': explanation,
        'breakdown': breakdown,
    }


def _calculate_female_compatibility(customer, candidate):
    explanation = []
    breakdown = {}

    # 1. Profession similarity (weight=20)
    profession_score = 0
    cust_desig = _normalize(customer.designation)
    cand_desig = _normalize(candidate.designation)
    if cust_desig and cust_desig == cand_desig:
        explanation.append('Identical profession/designation')
        profession_score = 20
    elif cust_desig and cand_desig:
        stop_words = {"and", "or", "of", "in", "at", "for", "with", "a", "an", "the", "lead", "manager", "associate", "senior", "junior", "assistant", "executive", "head", "chief", "director"}
        cust_words = {w for w in re.split(r'\s+', cust_desig) if w and w not in stop_words}
        cand_words = {w for w in re.split(r'\s+', cand_desig) if w and w not in stop_words}
        if cust_words & cand_words:
            explanation.append('Similar professional field')
            profession_score = 15
        elif _normalize(customer.company) and _normalize(customer.company) == _normalize(candidate.company):
            explanation.append('Works at the same company')
            profession_score = 10
    elif _normalize(customer.company) and _normalize(customer.company) == _normalize(candidate.company):
        explanation.append('Works at the same company')
        profession_score = 10
    breakdown['profession_similarity'] = profession_score

    # 2. Education compatibility (weight=15)
    education_score = 0
    first_norm = _normalize(customer.education)
    second_norm = _normalize(candidate.education)
    if first_norm and first_norm == second_norm:
        explanation.append('Same education level')
        education_score = 15
    else:
        first_rank = _education_rank(customer.education)
        second_rank = _education_rank(candidate.education)
        if first_rank and second_rank and abs(first_rank - second_rank) <= 1:
            explanation.append('Compatible education levels')
            education_score = 10
    breakdown['education_compatibility'] = education_score

    # 3. Values (weight=15)
    religion_val_score = 0
    if _normalize(customer.religion) and _normalize(customer.religion) == _normalize(candidate.religion):
        explanation.append('Shared religious values')
        religion_val_score += 10
    if _normalize(customer.caste) and _normalize(customer.caste) == _normalize(candidate.caste):
        explanation.append('Shared cultural background/caste')
        religion_val_score += 5
    breakdown['values'] = religion_val_score

    # 4. Relocation preferences (weight=15)
    reloc_pref_score = 0
    first_norm = _normalize(customer.open_to_relocate)
    second_norm = _normalize(candidate.open_to_relocate)
    if first_norm and first_norm == second_norm:
        explanation.append('Aligned relocation preferences')
        reloc_pref_score = 15
    elif _is_flexible(customer.open_to_relocate) or _is_flexible(candidate.open_to_relocate):
        explanation.append('Flexible relocation preferences')
        reloc_pref_score = 10
    breakdown['relocation_preferences'] = reloc_pref_score

    # 5. Lifestyle compatibility (weight=15)
    lifestyle_score = 0
    
    # Pets (5)
    first_pets = _normalize(customer.open_to_pets)
    second_pets = _normalize(candidate.open_to_pets)
    if first_pets and first_pets == second_pets:
        explanation.append('Compatible pet preferences')
        lifestyle_score += 5
    elif _is_flexible(customer.open_to_pets) or _is_flexible(candidate.open_to_pets):
        explanation.append('Flexible pet preferences')
        lifestyle_score += 3
        
    # Languages (5)
    first_languages = _language_set(customer.languages)
    second_languages = _language_set(candidate.languages)
    shared = first_languages & second_languages
    if shared:
        if len(shared) >= 2:
            explanation.append('Shared language lifestyle (multiple)')
            lifestyle_score += 5
        else:
            explanation.append('Shared language lifestyle')
            lifestyle_score += 3
            
    # City/State (5)
    same_city = _normalize(customer.city) and _normalize(customer.city) == _normalize(candidate.city)
    same_state = _normalize(customer.state) and _normalize(customer.state) == _normalize(candidate.state)
    if same_city:
        explanation.append('Same city lifestyle')
        lifestyle_score += 5
    elif same_state:
        explanation.append('Same state lifestyle')
        lifestyle_score += 3
        
    breakdown['lifestyle_compatibility'] = min(15, lifestyle_score)

    # 6. Desire for children (weight=20)
    children_score = 0
    first_norm = _normalize(customer.wants_kids)
    second_norm = _normalize(candidate.wants_kids)
    if first_norm and first_norm == second_norm:
        explanation.append('Aligned desire for children')
        children_score = 20
    elif _is_flexible(customer.wants_kids) or _is_flexible(customer.wants_kids):
        explanation.append('Open/flexible child preferences')
        children_score = 12
    breakdown['desire_for_children'] = children_score

    score = sum(breakdown.values())
    return {
        'score': max(0, min(100, round(score))),
        'explanation': explanation,
        'breakdown': breakdown,
    }


def _calculate_default_compatibility(customer, candidate):
    explanation = []
    religion_score = _score_exact_text(
        customer.religion,
        candidate.religion,
        weight=15,
        reason='Same religion',
        explanation=explanation,
    )
    caste_score = _score_exact_text(
        customer.caste,
        candidate.caste,
        weight=10,
        reason='Same caste',
        explanation=explanation,
    )
    age_score = _score_age(customer.age, candidate.age, explanation)
    education_score = _score_education(customer.education, candidate.education, explanation)
    income_score = _score_income(customer.income, candidate.income, explanation)
    location_score = _score_location(customer, candidate, explanation)
    languages_score = _score_languages(customer.languages, candidate.languages, explanation)
    wants_kids_score = _score_preference(
        customer.wants_kids,
        candidate.wants_kids,
        weight=5,
        exact_reason='Same kids preference',
        flexible_reason='Flexible kids preference',
        explanation=explanation,
    )
    pets_score = _score_preference(
        customer.open_to_pets,
        candidate.open_to_pets,
        weight=5,
        exact_reason='Same pet preference',
        flexible_reason='Flexible pet preference',
        explanation=explanation,
    )
    relocate_score = _score_preference(
        customer.open_to_relocate,
        candidate.open_to_relocate,
        weight=5,
        exact_reason='Same relocation preference',
        flexible_reason='Compatible relocation preferences',
        explanation=explanation,
    )

    score = (
        religion_score + caste_score + age_score + education_score +
        income_score + location_score + languages_score +
        wants_kids_score + pets_score + relocate_score
    )

    breakdown = {
        'religion': religion_score,
        'caste': caste_score,
        'age': age_score,
        'education': education_score,
        'income': income_score,
        'location': location_score,
        'languages': languages_score,
        'wants_kids': wants_kids_score,
        'open_to_pets': pets_score,
        'open_to_relocate': relocate_score,
    }

    return {
        'score': max(0, min(100, round(score))),
        'explanation': explanation,
        'breakdown': breakdown,
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
