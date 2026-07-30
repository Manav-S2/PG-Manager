export type Step = 'where' | 'checkin' | 'sharing' | 'who' | null;

type LocationCategory = 'University' | 'City' | 'Office District' | 'Locality';

export interface LocationInfo {
  id: number;
  title: string;
  subtitle: string;
  trust: string;
  icon: string;
  category: LocationCategory;
  aliases: string[];
  rent: string;
  distance?: string;
  image: string;
}

export const LOCATIONS: LocationInfo[] = [
  { 
    id: 1, 
    title: 'Lovely Professional University', 
    subtitle: 'Phagwara, Punjab', 
    trust: '18 verified PGs nearby', 
    icon: 'book-open',
    category: 'University',
    aliases: ['lpu', 'lovely', 'lovely professional'],
    rent: '₹5,500/mo',
    distance: '5 min walk',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 2, 
    title: 'Chandigarh University', 
    subtitle: 'Mohali, Punjab', 
    trust: '12 verified PGs nearby', 
    icon: 'book-open',
    category: 'University',
    aliases: ['cu', 'chandigarh'],
    rent: '₹6,000/mo',
    distance: '10 min walk',
    image: 'https://images.unsplash.com/photo-1592285896110-8d88b5b3a5d8?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 3, 
    title: 'Electronic City', 
    subtitle: 'Bengaluru, Karnataka', 
    trust: '24 verified PGs nearby', 
    icon: 'map-pin',
    category: 'Office District',
    aliases: ['ecity', 'electronic'],
    rent: '₹8,500/mo',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 4, 
    title: 'Sector 62', 
    subtitle: 'Noida, UP', 
    trust: '15 verified PGs nearby', 
    icon: 'map-pin',
    category: 'Locality',
    aliases: ['sec 62', 'sector 62'],
    rent: '₹7,000/mo',
    distance: 'Near Metro',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 5, 
    title: 'Whitefield', 
    subtitle: 'Bengaluru, Karnataka', 
    trust: '30 verified PGs nearby', 
    icon: 'map-pin',
    category: 'Office District',
    aliases: ['white field'],
    rent: '₹9,000/mo',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 6, 
    title: 'Koramangala', 
    subtitle: 'Bengaluru, Karnataka', 
    trust: '45 verified PGs nearby', 
    icon: 'map-pin',
    category: 'Locality',
    aliases: ['kora'],
    rent: '₹10,000/mo',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 7, 
    title: 'Cyber City', 
    subtitle: 'Gurgaon, Haryana', 
    trust: '20 verified PGs nearby', 
    icon: 'briefcase',
    category: 'Office District',
    aliases: ['cyber', 'cybercity'],
    rent: '₹12,000/mo',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 8,
    title: 'Pune',
    subtitle: 'Maharashtra',
    trust: '120 verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['pune city'],
    rent: '₹6,500/mo',
    image: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 9, 
    title: 'Delhi University', 
    subtitle: 'New Delhi, Delhi', 
    trust: '50 verified PGs nearby', 
    icon: 'book-open',
    category: 'University',
    aliases: ['du', 'delhi'],
    rent: '₹8,000/mo',
    distance: 'Near Metro',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 10, 
    title: 'Amity University', 
    subtitle: 'Noida, UP', 
    trust: '35 verified PGs nearby', 
    icon: 'book-open',
    category: 'University',
    aliases: ['amity', 'noida'],
    rent: '₹9,500/mo',
    distance: '10 min walk',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=100&q=80'
  },
  { 
    id: 11, 
    title: 'VIT Vellore', 
    subtitle: 'Vellore, Tamil Nadu', 
    trust: '40 verified PGs nearby', 
    icon: 'book-open',
    category: 'University',
    aliases: ['vit', 'vellore'],
    rent: '₹6,500/mo',
    distance: '15 min walk',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 12,
    title: 'Mumbai',
    subtitle: 'Maharashtra',
    trust: '210 verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['mumbai city', 'bombay'],
    rent: '₹12,000/mo',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 13,
    title: 'Hyderabad',
    subtitle: 'Telangana',
    trust: '180 verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['hyd'],
    rent: '₹7,500/mo',
    image: 'https://images.unsplash.com/photo-1590489950346-646df7c0a969?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 14,
    title: 'Chennai',
    subtitle: 'Tamil Nadu',
    trust: '145 verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['madras'],
    rent: '₹7,000/mo',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 15,
    title: 'Ahmedabad',
    subtitle: 'Gujarat',
    trust: '90 verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['ahd'],
    rent: '₹6,000/mo',
    image: 'https://images.unsplash.com/photo-1594998782337-33d7d74f266c?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 16,
    title: 'Kolkata',
    subtitle: 'West Bengal',
    trust: '110 verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['calcutta'],
    rent: '₹5,500/mo',
    image: 'https://images.unsplash.com/photo-1558231336-db189aa941cb?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 17,
    title: 'Delhi',
    subtitle: 'NCR',
    trust: '500+ verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['new delhi', 'ncr'],
    rent: '₹8,000/mo',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 18,
    title: 'Noida',
    subtitle: 'Uttar Pradesh',
    trust: '300+ verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['greater noida'],
    rent: '₹7,500/mo',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 19,
    title: 'Bangalore',
    subtitle: 'Karnataka',
    trust: '800+ verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['bengaluru', 'blr'],
    rent: '₹9,000/mo',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 20,
    title: 'Gurgaon',
    subtitle: 'Haryana',
    trust: '400+ verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['gurugram', 'ggn'],
    rent: '₹10,000/mo',
    image: 'https://images.unsplash.com/photo-1605335525992-05a8f50b2c12?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 21,
    title: 'Jaipur',
    subtitle: 'Rajasthan',
    trust: '300+ verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['pink city'],
    rent: '₹6,000/mo',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 22,
    title: 'Chandigarh',
    subtitle: 'Punjab',
    trust: '250+ verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['chd'],
    rent: '₹7,500/mo',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 23,
    title: 'Lucknow',
    subtitle: 'Uttar Pradesh',
    trust: '200+ verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['lko'],
    rent: '₹5,500/mo',
    image: 'https://images.unsplash.com/photo-1588656606041-0268579d4df8?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 24,
    title: 'Indore',
    subtitle: 'Madhya Pradesh',
    trust: '350+ verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['indore'],
    rent: '₹6,500/mo',
    image: 'https://images.unsplash.com/photo-1622308644420-a61622616f73?auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 25,
    title: 'Kochi',
    subtitle: 'Kerala',
    trust: '150+ verified PGs',
    icon: 'map',
    category: 'City',
    aliases: ['cochin'],
    rent: '₹6,500/mo',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=100&q=80'
  }
];
