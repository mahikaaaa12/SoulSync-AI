import datetime

from django.core.management.base import BaseCommand
from django.db import transaction
from dashboard.models import Customer

class Command(BaseCommand):
    help = 'Seeds 100 male and 100 female customer profiles into the database'

    def handle(self, *args, **options):
        status_tags = [
            'New Lead', 'Profile Review', 'Active Search', 'Matches Sent',
            'Meeting Scheduled', 'Engagement In Progress', 'On Hold', 'Closed'
        ]
        male_first_names = [
            'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh',
            'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advait',
            'Pranav', 'Kabir', 'Rohan', 'Karan', 'Rahul', 'Nikhil',
            'Siddharth', 'Dev', 'Armaan', 'Yash', 'Manav', 'Varun'
        ]
        female_first_names = [
            'Aadhya', 'Ananya', 'Diya', 'Ira', 'Kavya', 'Meera', 'Priya',
            'Riya', 'Saanvi', 'Anika', 'Sneha', 'Naina', 'Pooja', 'Aisha',
            'Tanya', 'Neha', 'Isha', 'Avni', 'Kiara', 'Shruti', 'Mira',
            'Rhea', 'Anushka', 'Tanvi', 'Suhani'
        ]
        last_names = [
            'Sharma', 'Mehta', 'Iyer', 'Singh', 'Desai', 'Kapoor', 'Reddy',
            'Joshi', 'Nair', 'Bose', 'Patel', 'Chatterjee', 'Malhotra', 'Rao',
            'Agarwal', 'Menon', 'Gupta', 'Bhat', 'Kulkarni', 'Saxena',
            'Mukherjee', 'Pillai', 'Khan', 'Shetty', 'Chopra'
        ]
        indian_cities = [
            ['Mumbai','Maharashtra'], ['Pune','Maharashtra'], ['Delhi','Delhi'], ['Bengaluru','Karnataka'],
            ['Hyderabad','Telangana'], ['Chennai','Tamil Nadu'], ['Ahmedabad','Gujarat'], ['Jaipur','Rajasthan'],
            ['Kolkata','West Bengal'], ['Kochi','Kerala'], ['Lucknow','Uttar Pradesh'], ['Chandigarh','Punjab'],
            ['Indore','Madhya Pradesh'], ['Surat','Gujarat'], ['Noida','Uttar Pradesh'], ['Gurugram','Haryana']
        ]
        religions = ['Hindu','Muslim','Sikh','Christian','Jain','Buddhist']
        castes = ['Brahmin','Khatri','Kayastha','Agarwal','Maratha','Reddy','Iyer','Nair','Patel','Rajput','Menon','Baniya']
        education_list = ['B.Tech','MBA','MBBS','CA','M.Tech','B.Com','M.Com','B.Arch','LLB','PhD','MCA','BDS']
        companies = ['TCS','Infosys','HDFC Bank','Deloitte','Google India','Reliance','ICICI Bank','Zomato','Wipro','Tata Steel','Accenture','Mahindra']
        designations = ['Product Manager','Software Engineer','Consultant','Financial Analyst','Doctor','Architect','Marketing Lead','Data Scientist','Chartered Accountant','HR Manager','Lawyer','Professor']
        languages_pool = ['Hindi','English','Tamil','Telugu','Marathi','Gujarati','Bengali','Malayalam','Kannada','Punjabi']
        colleges = ['St. Xavier\'s College','Loyola College','St. Joseph\'s College','Christ University','Lady Shri Ram College','Hindu College','SRCC','Madras Christian College','University of Mumbai','St. Stephen\'s College']
        degrees = ['B.Tech','MBA','MBBS','CA','M.Tech','B.Com','M.Com','B.Arch','LLB','PhD','MCA','BDS','BBA']
        sibling_descriptions = ['No siblings','1 brother','1 sister','2 brothers','2 sisters','1 brother, 1 sister','3 siblings']

        def build_profile(id_val, gender, first_names_list):
            city = indian_cities[id_val % len(indian_cities)]
            first_name = first_names_list[id_val % len(first_names_list)]
            last_name = last_names[(id_val * 3) % len(last_names)]
            age = 25 + (id_val % 16)
            status_tag = status_tags[id_val % len(status_tags)]

            customer_id = f"{'M' if gender == 'Male' else 'F'}{str(id_val + 1).zfill(3)}"

            if gender == 'Male':
                height_inches = 8 + (id_val % 6)
                height = f"{5 + (height_inches // 12)}'{height_inches % 12}\""
            else:
                height = f"5'{2 + (id_val % 7)}\""

            birth_year = datetime.date.today().year - age
            birth_month = (id_val % 12) + 1
            birth_day = (id_val % 28) + 1
            date_of_birth = datetime.date(birth_year, birth_month, birth_day)

            return Customer(
                customer_id=customer_id,
                first_name=first_name,
                last_name=last_name,
                gender=gender,
                age=age,
                city=city[0],
                state=city[1],
                country='India',
                religion=religions[id_val % len(religions)],
                caste=castes[(id_val * 2) % len(castes)],
                height=height,
                education=education_list[id_val % len(education_list)],
                degree=degrees[id_val % len(degrees)],
                undergraduate_college=colleges[id_val % len(colleges)],
                company=companies[(id_val * 2) % len(companies)],
                designation=designations[(id_val * 4) % len(designations)],
                income=f"Rs {8 + (id_val % 30)}-{12 + (id_val % 35)} LPA",
                marital_status='Divorced' if (id_val % 9 == 0) else 'Never Married',
                languages=f"{languages_pool[id_val % len(languages_pool)]}, English",
                date_of_birth=date_of_birth,
                phone_number=f"+91{9000000000 + id_val}",
                siblings=sibling_descriptions[id_val % len(sibling_descriptions)],
                wants_kids=['Yes','No','Maybe'][id_val % 3],
                open_to_relocate=['Yes','No','Maybe'][(id_val + 1) % 3],
                open_to_pets=['Yes','No','Maybe'][(id_val + 2) % 3],
                status_tag=status_tag,
                email=f"{first_name.lower()}.{last_name.lower()}{id_val + 1}@soulsync.ai"
            )

        with transaction.atomic():
            self.stdout.write("Deleting existing customer profiles...")
            Customer.objects.all().delete()

            self.stdout.write("Generating male profiles...")
            male_profiles = [build_profile(i, 'Male', male_first_names) for i in range(100)]
            Customer.objects.bulk_create(male_profiles)

            self.stdout.write("Generating female profiles...")
            female_profiles = [build_profile(i, 'Female', female_first_names) for i in range(100)]
            Customer.objects.bulk_create(female_profiles)

        self.stdout.write(self.style.SUCCESS('Successfully seeded 100 male and 100 female profiles.'))
