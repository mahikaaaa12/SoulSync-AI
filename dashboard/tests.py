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

    def test_male_customer_matchmaker_rules(self):
        # Customer: Male, age 30, height 5'10", income 15 LPA, wants kids
        customer = self._customer(
            gender='Male',
            age=30,
            height="5'10\"",
            income='Rs 15 LPA',
            wants_kids='Yes',
            religion='Hindu',
            caste='Brahmin',
            city='Mumbai',
            state='Maharashtra',
            languages='Hindi, English',
            open_to_pets='Yes',
            open_to_relocate='Yes',
        )

        # Candidate A: Female, age 27 (younger), height 5'5" (shorter), income 12 LPA (less), wants kids (agreed)
        candidate_a = self._customer(
            gender='Female',
            age=27,
            height="5'5\"",
            income='Rs 12 LPA',
            wants_kids='Yes',
            religion='Hindu',
            caste='Brahmin',
            city='Mumbai',
            state='Maharashtra',
            languages='Hindi, English',
            open_to_pets='Yes',
            open_to_relocate='Yes',
        )

        result_a = calculate_compatibility(customer, candidate_a)
        self.assertEqual(result_a['score'], 100)
        self.assertIn('Preferred younger age range', result_a['explanation'])
        self.assertIn('Preferred height difference (shorter candidate)', result_a['explanation'])
        self.assertIn('Preferred income range (candidate income is less than or equal)', result_a['explanation'])
        self.assertIn('Strong agreement on wanting children', result_a['explanation'])
        
        # Verify breakdown
        breakdown_a = result_a['breakdown']
        self.assertEqual(breakdown_a['age'], 15)
        self.assertEqual(breakdown_a['height'], 10)
        self.assertEqual(breakdown_a['income'], 10)
        self.assertEqual(breakdown_a['wants_kids'], 25)

        # Candidate B: Female, age 33 (older), height 6'0" (taller), income 25 LPA (more), wants kids: No (disagreed)
        candidate_b = self._customer(
            gender='Female',
            age=33,
            height="6'0\"",
            income='Rs 25 LPA',
            wants_kids='No',
            religion='Hindu',
            caste='Brahmin',
            city='Mumbai',
            state='Maharashtra',
            languages='Hindi, English',
            open_to_pets='Yes',
            open_to_relocate='Yes',
        )

        result_b = calculate_compatibility(customer, candidate_b)
        # 100 - 15 (age older=0) - 10 (height taller=0) - 10 (income higher=0) - 25 (wants_kids diff=0) = 40
        self.assertEqual(result_b['score'], 40)
        self.assertIn('Older age range', result_b['explanation'])
        self.assertIn('Candidate is not shorter than the customer', result_b['explanation'])
        self.assertIn("Candidate income is higher than the customer's income", result_b['explanation'])
        self.assertIn('Different preferences on wanting children', result_b['explanation'])

    def test_female_customer_matchmaker_rules(self):
        # Customer: Female, Software Engineer at Google, MBA, wants kids
        customer = self._customer(
            gender='Female',
            designation='Software Engineer',
            company='Google',
            education='MBA',
            religion='Hindu',
            caste='Brahmin',
            open_to_relocate='Yes',
            open_to_pets='Yes',
            languages='Hindi, English',
            city='Mumbai',
            state='Maharashtra',
            wants_kids='Yes',
        )

        # Candidate C: Male, Software Engineer at Microsoft, MBA, wants kids
        candidate_c = self._customer(
            gender='Male',
            designation='Software Engineer',
            company='Microsoft',
            education='MBA',
            religion='Hindu',
            caste='Brahmin',
            open_to_relocate='Yes',
            open_to_pets='Yes',
            languages='Hindi, English',
            city='Mumbai',
            state='Maharashtra',
            wants_kids='Yes',
        )

        result_c = calculate_compatibility(customer, candidate_c)
        # Check breakdown
        breakdown_c = result_c['breakdown']
        self.assertIn('profession_similarity', breakdown_c)
        self.assertIn('education_compatibility', breakdown_c)
        self.assertIn('values', breakdown_c)
        self.assertIn('relocation_preferences', breakdown_c)
        self.assertIn('lifestyle_compatibility', breakdown_c)
        self.assertIn('desire_for_children', breakdown_c)
        
        # Identical designation: 20
        self.assertEqual(breakdown_c['profession_similarity'], 20)
        # Same education level: 15
        self.assertEqual(breakdown_c['education_compatibility'], 15)
        # Aligned desire for children: 20
        self.assertEqual(breakdown_c['desire_for_children'], 20)
        self.assertEqual(result_c['score'], 100)

        # Candidate D: Male, Financial Analyst at Microsoft (different profession), B.Com (rank difference > 1), wants kids: No
        candidate_d = self._customer(
            gender='Male',
            designation='Financial Analyst',
            company='Microsoft',
            education='B.Com',
            religion='Muslim',
            caste='Khan',
            open_to_relocate='No',
            open_to_pets='No',
            languages='Urdu',
            city='Delhi',
            state='Delhi',
            wants_kids='No',
        )
        result_d = calculate_compatibility(customer, candidate_d)
        # Verify no hard filters: score is computed but lower, and explanations list why
        self.assertLess(result_d['score'], 15)
        self.assertIsInstance(result_d['explanation'], list)

    def _customer(self, **overrides):
        defaults = {
            'gender': '',
            'age': 30,
            'height': '',
            'designation': '',
            'company': '',
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
