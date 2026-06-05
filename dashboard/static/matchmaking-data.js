/* =============================================
   SoulSync AI - Dummy Matchmaking Pool
   Inserted before script.js in index.html.
   ============================================= */

const statusTags = [
  'New Lead',
  'Profile Review',
  'Active Search',
  'Matches Sent',
  'Meeting Scheduled',
  'Engagement In Progress',
  'On Hold',
  'Closed'
];

const maleFirstNames = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Ayaan','Krishna','Ishaan','Shaurya','Atharv','Advait','Pranav','Kabir','Rohan','Karan','Rahul','Nikhil','Siddharth'];
const femaleFirstNames = ['Aadhya','Ananya','Diya','Ira','Kavya','Meera','Priya','Riya','Saanvi','Anika','Sneha','Naina','Pooja','Aisha','Tanya','Neha','Isha','Avni','Kiara','Shruti'];
const lastNames = ['Sharma','Mehta','Iyer','Singh','Desai','Kapoor','Reddy','Joshi','Nair','Bose','Patel','Chatterjee','Malhotra','Rao','Agarwal','Menon','Gupta','Bhat','Kulkarni','Saxena'];
const indianCities = [
  ['Mumbai','Maharashtra'], ['Pune','Maharashtra'], ['Delhi','Delhi'], ['Bengaluru','Karnataka'],
  ['Hyderabad','Telangana'], ['Chennai','Tamil Nadu'], ['Ahmedabad','Gujarat'], ['Jaipur','Rajasthan'],
  ['Kolkata','West Bengal'], ['Kochi','Kerala'], ['Lucknow','Uttar Pradesh'], ['Chandigarh','Punjab']
];
const religions = ['Hindu','Muslim','Sikh','Christian','Jain','Buddhist'];
const castes = ['Brahmin','Khatri','Kayastha','Agarwal','Maratha','Reddy','Iyer','Nair','Patel','Rajput'];
const educationList = ['B.Tech','MBA','MBBS','CA','M.Tech','B.Com','M.Com','B.Arch','LLB','PhD'];
const companies = ['TCS','Infosys','HDFC Bank','Deloitte','Google India','Reliance','ICICI Bank','Zomato','Wipro','Tata Steel'];
const designations = ['Product Manager','Software Engineer','Consultant','Financial Analyst','Doctor','Architect','Marketing Lead','Data Scientist','Chartered Accountant','HR Manager'];
const languagesPool = ['Hindi','English','Tamil','Telugu','Marathi','Gujarati','Bengali','Malayalam','Kannada','Punjabi'];

function buildProfile(id, gender, firstNames) {
  const city = indianCities[id % indianCities.length];
  const firstName = firstNames[id % firstNames.length];
  const lastName = lastNames[(id * 3) % lastNames.length];
  const age = 25 + (id % 16);
  const statusTag = statusTags[id % statusTags.length];

  return {
    id: `${gender === 'Male' ? 'M' : 'F'}${String(id + 1).padStart(3, '0')}`,
    firstName,
    lastName,
    gender,
    age,
    city: city[0],
    state: city[1],
    religion: religions[id % religions.length],
    caste: castes[(id * 2) % castes.length],
    height: gender === 'Male' ? `${5 + Math.floor((8 + id % 6) / 12)}'${(8 + id % 6) % 12}"` : `5'${2 + (id % 7)}"`,
    education: educationList[id % educationList.length],
    company: companies[(id * 2) % companies.length],
    designation: designations[(id * 4) % designations.length],
    income: `Rs ${8 + (id % 30)}-${12 + (id % 35)} LPA`,
    maritalStatus: id % 9 === 0 ? 'Divorced' : 'Never Married',
    languages: [languagesPool[id % languagesPool.length], 'English'],
    wantsKids: ['Yes','No','Maybe'][id % 3],
    openToRelocate: ['Yes','No','Maybe'][(id + 1) % 3],
    openToPets: ['Yes','No','Maybe'][(id + 2) % 3],
    statusTag
  };
}

const maleProfiles = Array.from({ length: 100 }, (_, i) => buildProfile(i, 'Male', maleFirstNames));
const femaleProfiles = Array.from({ length: 100 }, (_, i) => buildProfile(i, 'Female', femaleFirstNames));

window.statusTags = statusTags;
window.maleProfiles = maleProfiles;
window.femaleProfiles = femaleProfiles;
