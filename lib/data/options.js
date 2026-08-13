// Predefined option lists for the profile form's dropdowns. Kept as plain
// arrays (not DB-driven) since these are fixed reference data, not content
// that changes at runtime.

export const PASSING_YEARS = (() => {
  const years = [];
  for (let y = new Date().getFullYear(); y >= 1947; y--) years.push(y);
  return years;
})();

export const DEPARTMENTS = [
  "Arts",
  "Commerce",
  "Science",
  "Law",
  "Management",
  "Computer Science",
  "Education",
  "Other",
];

export const COURSES = [
  "B.A.",
  "B.Sc.",
  "B.Com.",
  "BBA",
  "BCA",
  "B.Tech",
  "LLB",
  "M.A.",
  "M.Sc.",
  "M.Com.",
  "MBA",
  "MCA",
  "M.Tech",
  "LLM",
  "Ph.D.",
  "Diploma",
  "Other",
];

export const PROFESSIONS = [
  "Civil Services (IAS / IPS / IFS / Other)",
  "Doctor / Medical Professional",
  "Lawyer / Judiciary",
  "Engineer",
  "Teacher / Professor",
  "Government Officer",
  "Banking & Finance",
  "Chartered Accountant",
  "Business Owner / Entrepreneur",
  "IT / Software Professional",
  "Journalist / Media",
  "Armed Forces / Defence",
  "Artist / Creative",
  "Consultant",
  "Homemaker",
  "Student",
  "Retired",
  "Other",
];

export const HOSTEL_STATUS = ["Hosteller", "Day Scholar"];

export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Canada",
  "Australia",
  "Singapore",
  "Germany",
  "Other",
];

// State -> a handful of major cities. Not exhaustive — good enough for a
// dropdown default; "Other" on either list falls back to free text.
export const INDIA_STATES_AND_CITIES = {
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
  "Arunachal Pradesh": ["Itanagar"],
  Assam: ["Guwahati", "Dibrugarh", "Silchar"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  Chandigarh: ["Chandigarh"],
  Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur"],
  Delhi: ["New Delhi", "Delhi"],
  Goa: ["Panaji", "Margao"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  Haryana: ["Gurugram", "Faridabad", "Panipat", "Hisar"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
  "Jammu and Kashmir": ["Srinagar", "Jammu"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode"],
  Ladakh: ["Leh"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
  Manipur: ["Imphal"],
  Meghalaya: ["Shillong"],
  Mizoram: ["Aizawl"],
  Nagaland: ["Kohima", "Dimapur"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
  Puducherry: ["Puducherry"],
  Punjab: ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
  Sikkim: ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  Telangana: ["Hyderabad", "Warangal"],
  Tripura: ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Agra", "Varanasi", "Prayagraj"],
  Uttarakhand: ["Dehradun", "Haridwar", "Nainital"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur"],
  Other: [],
};

export const INDIA_STATES = Object.keys(INDIA_STATES_AND_CITIES);
