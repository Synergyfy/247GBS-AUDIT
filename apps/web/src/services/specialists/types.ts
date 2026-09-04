export interface Specialist {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  expertise: string[];
  status: 'Available' | 'In Call' | 'Out of Office';
  experience: string;
  image: string;
}

export interface SpecialistStats {
  verifiedExperts: string;
  successfulDeployments: string;
  globalReach: string;
  avgResponseTime: string;
}

export default Specialist;
