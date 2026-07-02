export interface Vehicle {
  id: string;
  name: string;
  type: '4WD' | 'Heavy SUV' | 'Mid SUV' | 'Truck';
  transmission: 'Automatic' | 'Manual';
  fuel: 'Diesel' | 'Petrol';
  features: string[];
  imageUrl?: string;
  galleryUrls?: string[];
  seats: number;
  engine: string;
  pricePerDay: number;
  description: string;
  detailedSpecs: {
    engineSize: string;
    drivetrain: string;
    groundClearance: string;
    fuelCapacity: string;
    bestFor: string;
  };
}

export interface Inquiry {
  id: string;
  fullName: string;
  organization: string;
  email: string;
  phone: string;
  serviceType: 'Self-Drive Fleet' | 'Chauffeur Driven' | 'Custom Logistics' | 'Event Transport';
  startDate: string;
  endDate: string;
  preferredVehicle: string;
  vehiclesNeeded: number;
  pickupLocation: string;
  dropoffLocation: string;
  specialRequirementsDet?: string;
  status: 'Pending' | 'Approved' | 'Declined';
  createdAt: string;
}

export interface ClientItem {
  id: string;
  name: string;
  service?: string;
  status: 'Ongoing' | 'Completed' | 'Pending' | string;
  isDraft?: boolean;
  shortCode?: string;
  isPartner?: boolean;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  headOfficeAddress?: string;
  city?: string;
  country?: string;
  accountNumber?: string;
  contractRef?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  creditLimit?: number;
  totalPurchases?: number;
  totalVolume?: number;
  notes?: string;
  logoUrl?: string;
  createdAt?: string;
}

export type ActiveTab = 'home' | 'fleet' | 'services' | 'about' | 'contact' | 'admin' | 'team' | 'clients' | 'performance';

export interface FuelCity {
  id: string;
  name: string;
  region?: string;
  created_at?: string;
}

export interface FuelStation {
  id: string;
  name: string;
  city_id?: string;
  is_partner?: boolean;
  supplier?: string;
  created_at?: string;
}
