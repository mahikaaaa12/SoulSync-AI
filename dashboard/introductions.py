"""
Deterministic, template-based match introduction generator.

Produces natural, professional introduction copy from profile fields.
No external AI services — same inputs always yield the same output.
"""


def generate_match_introduction(customer, candidate, score=None, explanations=None):
    """Build a personalised introduction paragraph for a customer–candidate pair."""
    pair_key = f"{getattr(customer, 'customer_id', customer.pk)}:{getattr(candidate, 'customer_id', candidate.pk)}"
    first_name = candidate.first_name or candidate.name.split()[0]

    sentences = [
        _opening_sentence(first_name, candidate.name, pair_key),
        _education_profession_sentence(first_name, candidate, pair_key),
        _family_preference_sentence(customer, candidate, pair_key),
        _relocation_sentence(customer, candidate, pair_key),
        _language_sentence(customer, candidate, pair_key),
        _closing_sentence(first_name, score, pair_key),
    ]

    return ' '.join(s for s in sentences if s)


def _pick_variant(key, options):
    if not options:
        return ''
    index = sum(ord(char) for char in key) % len(options)
    return options[index]


def _opening_sentence(first_name, full_name, pair_key):
    templates = [
        "We're pleased to introduce {name} as a thoughtfully curated match for your client.",
        "We'd like to present {name} as a compelling introduction that aligns well with your client's preferences.",
        "Our team recommends {name} as a strong candidate worth bringing to your client's attention.",
    ]
    return _pick_variant(f"{pair_key}:open", templates).format(name=full_name)


def _education_profession_sentence(first_name, candidate, pair_key):
    education = _clean(candidate.education)
    designation = _clean(candidate.designation)
    company = _clean(candidate.company)
    city = _clean(candidate.city)

    if education and designation and company:
        templates = [
            "{first} holds a {education} and works as a {role} at {company}, bringing a solid professional foundation to this introduction.",
            "{first} combines a {education} background with their experience as a {role} at {company}.",
            "Professionally, {first} is a {role} at {company} with a {education} qualification.",
        ]
        return _pick_variant(f"{pair_key}:edu", templates).format(
            first=first_name,
            education=education,
            role=designation,
            company=company,
        )

    if education and designation:
        templates = [
            "{first} holds a {education} and works as a {role}, reflecting a well-established career path.",
            "With a {education} and experience as a {role}, {first} offers a balanced professional profile.",
        ]
        return _pick_variant(f"{pair_key}:edu", templates).format(
            first=first_name,
            education=education,
            role=designation,
        )

    if education:
        templates = [
            "{first} is a {education} graduate based in {city}.",
            "{first} brings an academic foundation in {education} to this match.",
        ]
        return _pick_variant(f"{pair_key}:edu", templates).format(
            first=first_name,
            education=education,
            city=city or 'their current city',
        )

    if designation:
        return f"{first_name} works as a {designation}, offering relevant professional experience for this introduction."

    return ''


def _family_preference_sentence(customer, candidate, pair_key):
    customer_wants = _normalize_option(customer.wants_kids)
    candidate_wants = _normalize_option(candidate.wants_kids)

    if not customer_wants or not candidate_wants:
        return ''

    if customer_wants == candidate_wants == 'yes':
        templates = [
            "Both profiles reflect a shared desire to build a family, which is an encouraging foundation for long-term compatibility.",
            "Family planning appears well aligned, with both individuals open to raising children together.",
        ]
        return _pick_variant(f"{pair_key}:family", templates)

    if customer_wants == candidate_wants == 'no':
        templates = [
            "Both individuals are aligned in prioritising a lifestyle without immediate parenting plans.",
            "Their family preferences are in step, with neither profile indicating a near-term focus on children.",
        ]
        return _pick_variant(f"{pair_key}:family", templates)

    if customer_wants == candidate_wants == 'maybe':
        templates = [
            "Both remain thoughtfully open on family planning, allowing room for a natural conversation as the match progresses.",
            "On family preferences, both profiles suggest a flexible and considerate approach to future planning.",
        ]
        return _pick_variant(f"{pair_key}:family", templates)

    if _is_flexible(customer_wants) or _is_flexible(candidate_wants):
        templates = [
            "Their views on family and children appear compatible, with enough flexibility to explore shared expectations over time.",
            "Family preferences suggest a workable alignment, with openness on at least one side to finding common ground.",
        ]
        return _pick_variant(f"{pair_key}:family", templates)

    templates = [
        "Family preferences differ slightly and may be worth discussing early to ensure expectations are clearly understood.",
        "While their stances on children are not identical, an open conversation could help assess whether priorities align.",
    ]
    return _pick_variant(f"{pair_key}:family", templates)


def _relocation_sentence(customer, candidate, pair_key):
    customer_reloc = _normalize_option(customer.open_to_relocate)
    candidate_reloc = _normalize_option(candidate.open_to_relocate)

    if not customer_reloc or not candidate_reloc:
        return ''

    same_city = _clean(customer.city) and _clean(customer.city).lower() == _clean(candidate.city).lower()

    if customer_reloc == candidate_reloc == 'yes':
        templates = [
            "Both are open to relocating, which adds valuable flexibility as the match develops.",
            "Relocation preferences are aligned, with both profiles indicating willingness to move for the right partnership.",
        ]
        return _pick_variant(f"{pair_key}:reloc", templates)

    if customer_reloc == candidate_reloc == 'no':
        if same_city:
            return "Both prefer to remain in their current city, and they are already based in the same location."
        templates = [
            "Both prefer to remain settled in their current locations, making geography an important factor to weigh carefully.",
            "Neither profile indicates strong openness to relocation, so proximity will be central to this match.",
        ]
        return _pick_variant(f"{pair_key}:reloc", templates)

    if _is_flexible(customer_reloc) and _is_flexible(candidate_reloc):
        templates = [
            "Relocation preferences appear flexible on both sides, leaving room to shape practical next steps together.",
            "Both show measured openness to relocation, which should make logistical planning more straightforward.",
        ]
        return _pick_variant(f"{pair_key}:reloc", templates)

    if _is_flexible(customer_reloc) or _is_flexible(candidate_reloc):
        templates = [
            "Relocation preferences show some flexibility, which may help bridge any geographic differences between the profiles.",
            "At least one profile is open to relocation, offering a practical path if geography becomes a consideration.",
        ]
        return _pick_variant(f"{pair_key}:reloc", templates)

    templates = [
        "Relocation preferences are more fixed on both sides, so geography should be reviewed carefully before proceeding.",
        "Both profiles suggest limited flexibility on relocation, making location alignment especially important here.",
    ]
    return _pick_variant(f"{pair_key}:reloc", templates)


def _language_sentence(customer, candidate, pair_key):
    shared = _shared_languages(customer.languages, candidate.languages)
    if not shared:
        return ''

    if len(shared) >= 2:
        language_list = _format_list(shared)
        templates = [
            f"With {language_list} in common, everyday communication should feel natural and comfortable.",
            f"Shared fluency in {language_list} offers a strong basis for easy conversation and cultural rapport.",
        ]
        return _pick_variant(f"{pair_key}:lang", templates)

    language = shared[0]
    templates = [
        f"A shared command of {language} should help both sides connect with ease from the very first conversation.",
        f"Both communicate in {language}, which supports clear dialogue and a more relaxed introduction.",
    ]
    return _pick_variant(f"{pair_key}:lang", templates).format(language=language)


def _closing_sentence(first_name, score, pair_key):
    if score is None:
        templates = [
            f"We believe {first_name}'s profile merits a closer look and would be a worthwhile introduction for your client.",
            f"Overall, {first_name} represents a promising match that deserves thoughtful consideration.",
        ]
        return _pick_variant(f"{pair_key}:close", templates)

    if score >= 85:
        templates = [
            "With an overall compatibility of {score}%, this pairing ranks as an exceptional introduction worth prioritising.",
            "At {score}% compatibility, this is an outstanding match that we recommend presenting without delay.",
        ]
    elif score >= 70:
        templates = [
            "With a compatibility score of {score}%, this introduction offers meaningful alignment across several important areas.",
            "At {score}% compatibility, this match reflects a strong fit that your client may find genuinely promising.",
        ]
    elif score >= 55:
        templates = [
            "At {score}% compatibility, this profile presents a good match with several encouraging points of overlap.",
            "A compatibility score of {score}% suggests a solid introduction with enough alignment to explore further.",
        ]
    else:
        templates = [
            "At {score}% compatibility, this introduction is more moderate in fit but may still be worth exploring with an open conversation.",
            "With {score}% compatibility, this match is softer in alignment yet may offer value in selected areas of overlap.",
        ]

    return _pick_variant(f"{pair_key}:close", templates).format(score=score)


def _shared_languages(first, second):
    first_set = _language_set(first)
    second_set = _language_set(second)
    return [_title(language) for language in sorted(first_set & second_set)]


def _language_set(value):
    return {
        _normalize(language)
        for language in (value or '').split(',')
        if _normalize(language)
    }


def _format_list(items):
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return f"{', '.join(items[:-1])}, and {items[-1]}"


def _normalize_option(value):
    return str(value or '').strip().lower()


def _is_flexible(value):
    return value in {'maybe', 'yes'}


def _clean(value):
    return str(value or '').strip()


def _normalize(value):
    return str(value or '').strip().lower()


def _title(value):
    return value[:1].upper() + value[1:] if value else value


__all__ = ['generate_match_introduction']
