from django.test import TestCase
from types import SimpleNamespace

from .matchmaking import calculate_compatibility


class CompatibilityEngineTests(TestCase):
    def test_high_compatibility_profile_pair(self):
        customer = self._customer(
            age=31,
            city='Mumbai',
            state='Maharashtra',
            religion='Hindu',
            caste='Brahmin',
            education='MBA',
            income='Rs 18-22 LPA',
            languages='Hindi, English',
            wants_kids='Yes',
            open_to_pets='Maybe',
            open_to_relocate='Yes',
        )
        candidate = self._customer(
            age=34,
            city='Mumbai',
            state='Maharashtra',
            religion='Hindu',
            caste='Brahmin',
            education='M.Tech',
            income='Rs 20-26 LPA',
            languages='Hindi, English',
            wants_kids='Yes',
            open_to_pets='Yes',
            open_to_relocate='Maybe',
        )

        result = calculate_compatibility(customer, candidate)

        self.assertGreaterEqual(result['score'], 90)
        self.assertIn('Same religion', result['explanation'])
        self.assertIn('Similar education', result['explanation'])
        self.assertIn('Same city', result['explanation'])

    def test_low_compatibility_profile_pair(self):
        customer = self._customer(
            age=26,
            city='Delhi',
            state='Delhi',
            religion='Hindu',
            caste='Brahmin',
            education='B.Com',
            income='Rs 8-12 LPA',
            languages='Hindi',
            wants_kids='Yes',
            open_to_pets='No',
            open_to_relocate='No',
        )
        candidate = self._customer(
            age=40,
            city='Kochi',
            state='Kerala',
            religion='Christian',
            caste='Nair',
            education='PhD',
            income='Rs 35-45 LPA',
            languages='Malayalam',
            wants_kids='No',
            open_to_pets='Yes',
            open_to_relocate='No',
        )

        result = calculate_compatibility(customer, candidate)

        self.assertLess(result['score'], 20)
        self.assertIsInstance(result['explanation'], list)

    def _customer(self, **overrides):
        defaults = {
            'age': 30,
            'city': '',
            'state': '',
            'religion': '',
            'caste': '',
            'education': '',
            'income': '',
            'languages': '',
            'wants_kids': 'Maybe',
            'open_to_pets': 'Maybe',
            'open_to_relocate': 'Maybe',
        }
        defaults.update(overrides)
        return SimpleNamespace(**defaults)
