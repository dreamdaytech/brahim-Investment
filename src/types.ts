export type ActiveTab = 'home' | 'fleet' | 'services' | 'contact' | 'admin' | string;

export interface Vehicle {
  id: string;
  name: string;
  type: '4WD' | 'Heavy SUV' | 'Mid SUV' | 'Truck';
  transmission: 'Automatic' | 'Manual';
  fuel: 'Diesel' | 'Petrol';
  features: string[];
  imageUrl?: string;
  galleryUrls?: string[];
  documents?: { name: string; url: string; expiryDate?: string }[];
  seats: number;
  engine: string;
  pricePerDay: number;
  description: string;
  make_model?: string;
  plate_number?: string;
  specEngineSize?: string;
  specDrivetrain?: string;
  specGroundClearance?: string;
  specFuelCapacity?: string;
  specBestFor?: string;
  detailedSpecs: {
    engineSize: string;
    drivetrain: string;
    groundClearance: string;
    fuelCapacity: string;
    bestFor: string;
  };
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  supplier_id?: string;
  driver_id?: string;
  start_date?: string;
  expected_completion_date?: string;
  completion_date?: string;
  service_date?: string;
  spares_description?: string;
  quantity?: number;
  cost: number;
  odometer_reading?: number;
  notes?: string;
  status?: string;
  issues_found?: string;
  mechanic_or_shop?: string;
  mechanic_contact?: string;
  mechanic_address?: string;
  created_at?: string;
  supplier?: Supplier;
  vehicle?: Vehicle;
  driver?: Driver;
  spares?: MaintenanceSpare[];
}

export interface MaintenanceSpare {
  id?: string;
  maintenance_record_id?: string;
  description: string;
  quantity: number;
  unit_cost: number;
  created_at?: string;
}

export interface SparesPurchase {
  id: string;
  vehicle_id: string;
  supplier_id?: string;
  purchase_date?: string;
  status?: string;
  notes?: string;
  cost: number;
  created_at?: string;
  vehicle?: Vehicle;
  supplier?: Supplier;
  items?: SparesItem[];
}

export interface SparesItem {
  id?: string;
  spares_purchase_id?: string;
  description: string;
  quantity: number;
  unit_cost: number;
  created_at?: string;
}

export interface Driver {
  id: string;
  name: string;
  imgUrl?: string;
  status?: string;
  licenseExpiry?: string;
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

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string;
  driver_id?: string;
  vehicle_id?: string;
  payment_method?: string;
  status: 'Pending' | 'Approved' | 'Paid';
  expense_date: string;
  paid_date?: string;
  logged_by?: string;
  approved_by?: string;
  notes?: string;
  created_at?: string;
  driver?: { id: string; name: string };
  vehicle?: { id: string; make_model: string; plate_number: string };
}

export interface DriverPayroll {
  id: string;
  driver_id: string;
  month: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  payment_method?: string;
  status: 'Pending' | 'Approved' | 'Paid';
  logged_by?: string;
  approved_by?: string;
  paid_date?: string;
  notes?: string;
  created_at?: string;
  driver?: { id: string; name: string };
}
