export interface StayData {
  title: string;
  price: string;
  rating: string;
  seatsRemaining?: number;
}

export interface CityData {
  name: string;
  stays: StayData[];
}

export const CITIES: CityData[] = [
  {
    name: 'Bengaluru',
    stays: [
      { title: 'Koramangala Co-live', price: '₹14,500', rating: '4.9', seatsRemaining: 3 },
      { title: 'Indiranagar Premium', price: '₹16,000', rating: '4.8' },
      { title: 'HSR Layout Hub', price: '₹12,800', rating: '4.7', seatsRemaining: 4 },
      { title: 'Whitefield Suites', price: '₹11,500', rating: '4.5' },
      { title: 'BTM Layout Base', price: '₹10,500', rating: '4.6', seatsRemaining: 2 },
      { title: 'Marathahalli Stay', price: '₹9,800', rating: '4.4' },
      { title: 'Jayanagar Haven', price: '₹15,000', rating: '4.9' },
      { title: 'Bellandur Central', price: '₹13,500', rating: '4.7' },
    ],
  },
  {
    name: 'Pune',
    stays: [
      { title: 'Viman Nagar Comforts', price: '₹11,500', rating: '4.8' },
      { title: 'Hinjewadi IT Stay', price: '₹9,000', rating: '4.5' },
      { title: 'Koregaon Park Elite', price: '₹16,000', rating: '4.9', seatsRemaining: 2 },
      { title: 'Kothrud Nest', price: '₹10,500', rating: '4.6' },
      { title: 'Baner Balewadi', price: '₹12,000', rating: '4.7', seatsRemaining: 4 },
      { title: 'Wakad Premium', price: '₹9,500', rating: '4.4' },
      { title: 'Kharadi Connect', price: '₹10,800', rating: '4.6' },
      { title: 'Aundh Avenue', price: '₹13,500', rating: '4.8', seatsRemaining: 1 },
    ],
  },
  {
    name: 'Hyderabad',
    stays: [
      { title: 'Gachibowli Suites', price: '₹12,500', rating: '4.8' },
      { title: 'HITEC City Premium', price: '₹14,000', rating: '4.9', seatsRemaining: 2 },
      { title: 'Madhapur Comfort', price: '₹11,000', rating: '4.5' },
      { title: 'Kondapur Haven', price: '₹13,500', rating: '4.7', seatsRemaining: 5 },
      { title: 'Jubilee Hills Stay', price: '₹18,000', rating: '4.9' },
      { title: 'Banjara Hills Nest', price: '₹16,500', rating: '4.6' },
      { title: 'Kukatpally Base', price: '₹9,500', rating: '4.4' },
      { title: 'Miyapur Connect', price: '₹8,500', rating: '4.3' },
    ],
  },
  {
    name: 'Delhi',
    stays: [
      { title: 'Delhi South Ex', price: '₹18,000', rating: '4.9' },
      { title: 'Delhi Mukherji Nagar', price: '₹8,500', rating: '4.4' },
      { title: 'Lajpat Nagar Comfort', price: '₹15,000', rating: '4.7', seatsRemaining: 2 },
      { title: 'Rajouri Garden Hub', price: '₹12,500', rating: '4.5' },
      { title: 'Saket Premium', price: '₹16,000', rating: '4.8', seatsRemaining: 3 },
      { title: 'Hauz Khas Village Stay', price: '₹19,000', rating: '4.9' },
      { title: 'Kamla Nagar Base', price: '₹10,000', rating: '4.3' },
      { title: 'Karol Bagh Suites', price: '₹11,500', rating: '4.6' },
    ],
  },
  {
    name: 'Noida',
    stays: [
      { title: 'Noida Sector 44', price: '₹12,000', rating: '4.8' },
      { title: 'Expressway Premium', price: '₹15,000', rating: '4.9' },
      { title: 'Sector 15 Hub', price: '₹9,500', rating: '4.5', seatsRemaining: 2 },
      { title: 'Noida City Center', price: '₹11,500', rating: '4.6' },
      { title: 'Sector 137 Suites', price: '₹13,000', rating: '4.7' },
      { title: 'Greater Noida West', price: '₹8,500', rating: '4.3', seatsRemaining: 4 },
      { title: 'Sector 50 Elite', price: '₹16,500', rating: '4.9', seatsRemaining: 3 },
      { title: 'Sector 104 Stay', price: '₹10,800', rating: '4.6' },
    ],
  },
  {
    name: 'Chennai',
    stays: [
      { title: 'OMR IT Corridor Stay', price: '₹10,500', rating: '4.7' },
      { title: 'Velachery Comforts', price: '₹12,000', rating: '4.5', seatsRemaining: 3 },
      { title: 'Anna Nagar Premium', price: '₹15,500', rating: '4.8' },
      { title: 'T Nagar Hub', price: '₹14,000', rating: '4.6' },
      { title: 'Thoraipakkam Suites', price: '₹9,500', rating: '4.4', seatsRemaining: 5 },
      { title: 'Guindy Elite', price: '₹13,000', rating: '4.7' },
      { title: 'Adyar Haven', price: '₹16,000', rating: '4.9' },
      { title: 'Sholinganallur Base', price: '₹8,500', rating: '4.3' },
    ],
  },
  {
    name: 'Mumbai',
    stays: [
      { title: 'Andheri West Premium', price: '₹22,000', rating: '4.8' },
      { title: 'Bandra Hub', price: '₹28,000', rating: '4.9', seatsRemaining: 1 },
      { title: 'Powai Comforts', price: '₹18,500', rating: '4.7' },
      { title: 'Malad Suites', price: '₹15,000', rating: '4.5' },
      { title: 'Goregaon Base', price: '₹14,500', rating: '4.4', seatsRemaining: 4 },
      { title: 'Navi Mumbai Haven', price: '₹12,000', rating: '4.6' },
      { title: 'Thane Elite', price: '₹11,000', rating: '4.5' },
      { title: 'Dadar Central Stay', price: '₹19,000', rating: '4.7' },
    ],
  },
  {
    name: 'Chandigarh',
    stays: [
      { title: 'Sector 17 Premium', price: '₹14,000', rating: '4.8' },
      { title: 'Sector 22 Comforts', price: '₹11,500', rating: '4.5', seatsRemaining: 3 },
      { title: 'Sector 35 Hub', price: '₹12,000', rating: '4.6' },
      { title: 'Mohali Phase 8 Suites', price: '₹10,500', rating: '4.7' },
      { title: 'Zirakpur Haven', price: '₹8,500', rating: '4.4', seatsRemaining: 6 },
      { title: 'Sector 43 Base', price: '₹11,000', rating: '4.5' },
      { title: 'IT Park Stay', price: '₹13,500', rating: '4.9' },
      { title: 'Panchkula Elite', price: '₹10,000', rating: '4.6' },
    ],
  },
  {
    name: 'Jaipur',
    stays: [
      { title: 'Malviya Nagar Comfort', price: '₹9,500', rating: '4.7' },
      { title: 'Mansarovar Hub', price: '₹8,000', rating: '4.5', seatsRemaining: 4 },
      { title: 'C-Scheme Premium', price: '₹12,500', rating: '4.8' },
      { title: 'Vaishali Nagar Suites', price: '₹10,000', rating: '4.6' },
      { title: 'Raja Park Base', price: '₹9,000', rating: '4.4' },
      { title: 'Jagatpura Haven', price: '₹7,500', rating: '4.3', seatsRemaining: 2 },
      { title: 'Tonk Road Stay', price: '₹11,000', rating: '4.7' },
      { title: 'Bani Park Elite', price: '₹13,000', rating: '4.9' },
    ],
  },
  {
    name: 'Ahmedabad',
    stays: [
      { title: 'SG Highway Premium', price: '₹11,500', rating: '4.8' },
      { title: 'Navrangpura Comforts', price: '₹10,000', rating: '4.6', seatsRemaining: 3 },
      { title: 'Satellite Hub', price: '₹12,000', rating: '4.7' },
      { title: 'Vastrapur Suites', price: '₹13,500', rating: '4.9' },
      { title: 'Bopal Haven', price: '₹9,500', rating: '4.5' },
      { title: 'Prahlad Nagar Base', price: '₹14,000', rating: '4.8', seatsRemaining: 1 },
      { title: 'Chandkheda Stay', price: '₹8,000', rating: '4.3' },
      { title: 'Gota Elite', price: '₹8,500', rating: '4.4' },
    ],
  },
  {
    name: 'Jalandhar',
    stays: [
      { title: 'Model Town Premium', price: '₹9,500', rating: '4.8' },
      { title: 'Jalandhar Cantt Hub', price: '₹8,000', rating: '4.5' },
      { title: 'Phagwara Gate Stay', price: '₹7,500', rating: '4.4' },
      { title: 'Adarsh Nagar Elite', price: '₹11,000', rating: '4.9' },
      { title: 'Urban Estate Comfort', price: '₹10,500', rating: '4.7' },
      { title: 'Nakodar Road PG', price: '₹6,500', rating: '4.2' },
      { title: 'Ladowali Road Base', price: '₹8,500', rating: '4.6' },
      { title: 'Civil Lines Haven', price: '₹12,000', rating: '4.8' },
    ],
  },
];
