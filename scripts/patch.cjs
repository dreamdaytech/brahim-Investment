const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Inject imports
if (!content.includes("import { supabase }")) {
  content = content.replace(
    "import { mockAccounts } from './CorporateBilling';",
    "import { mockAccounts } from './CorporateBilling';\nimport { supabase } from '../lib/supabase';\nimport { handleSupabaseSync } from '../lib/syncHelpers';\nimport { v4 as uuidv4 } from 'uuid';"
  );
}

// 2. Replace Date.now() based ID generation with uuidv4()
content = content.replace(/\`d\$\{Date\.now\(\)\}\`/g, "uuidv4()");
content = content.replace(/\`v\$\{Date\.now\(\)\}\`/g, "uuidv4()");
content = content.replace(/\`disp-\$\{Date\.now\(\)\}\`/g, "uuidv4()");
content = content.replace(/\`maint-\$\{Date\.now\(\)\}\`/g, "uuidv4()");
content = content.replace(/\`log-\$\{dateStr\}-\$\{driverId\}\`/g, "uuidv4()");

// 3. Inject state sync intercepts
const stateSearch = `  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [logs, setLogs] = useState<TripLog[]>(initialLogs);
  const [activeDispatches, setActiveDispatches] = useState<ActiveDispatch[]>([
    {
      id: 'disp-1',
      driverId: 'd1',
      vehicleId: 'v1',
      dispatchTime: new Date().toISOString(),
      odometerOut: 154017,
      fuelLevelOut: 'Full',
      conditionOut: 'Excellent - Washed',
      expectedReturnDate: new Date(new Date().getTime() + 86400000).toISOString().split('T')[0]
    }
  ]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([
    {
      id: 'maint-1',
      vehicleId: 'v3',
      startDate: new Date(new Date().getTime() - 86400000 * 2).toISOString().split('T')[0],
      expectedCompletionDate: new Date(new Date().getTime() + 86400000 * 3).toISOString().split('T')[0],
      issuesFound: 'Brake pad replacement and full synthetic oil change',
      cost: 4500,
      status: 'In Progress',
      mechanicOrShop: 'CFAO Motors Freetown',
      mechanicContact: '076 123 456',
      mechanicAddress: '123 Main Road, Freetown'
    }
  ]);`;

const stateReplacement = `  const [drivers, _setDrivers] = useState<Driver[]>([]);
  const [vehicles, _setVehicles] = useState<Vehicle[]>([]);
  const [logs, _setLogs] = useState<TripLog[]>([]);
  const [activeDispatches, _setActiveDispatches] = useState<ActiveDispatch[]>([]);
  const [maintenanceRecords, _setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);

  // Initialize data from Supabase
  React.useEffect(() => {
    const fetchData = async () => {
      const [driversRes, vehiclesRes, dispatchesRes, maintenanceRes, tripLogsRes] = await Promise.all([
        supabase.from('drivers').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('active_dispatches').select('*'),
        supabase.from('maintenance_records').select('*'),
        supabase.from('trip_logs').select('*, fuel_collections(*)')
      ]);

      if (driversRes.data) _setDrivers(driversRes.data.map(d => ({
        id: d.id, name: d.name, imgUrl: d.img_url, status: d.status, licenseExpiry: d.license_expiry, awards: d.awards
      })));

      if (vehiclesRes.data) _setVehicles(vehiclesRes.data.map(v => ({
        id: v.id, makeModel: v.make_model, year: v.year, odometer: 0, plateNumber: v.plate_number,
        insuranceExpiry: v.insurance_expiry, condition: v.condition, isCompanyRegistered: v.is_company_registered,
        type: 'SUV', status: v.status
      })));

      if (dispatchesRes.data) _setActiveDispatches(dispatchesRes.data.map(d => ({
        id: d.id, driverId: d.driver_id, vehicleId: d.vehicle_id, corporateAccountId: d.corporate_account_id,
        dispatchTime: d.dispatch_time, odometerOut: Number(d.odometer_out), fuelLevelOut: d.fuel_level_out,
        conditionOut: d.condition_out, expectedReturnDate: d.expected_return_date
      })));

      if (maintenanceRes.data) _setMaintenanceRecords(maintenanceRes.data.map(m => ({
        id: m.id, vehicleId: m.vehicle_id, startDate: m.start_date, expectedCompletionDate: m.expected_completion_date,
        completionDate: m.status === 'Completed' ? m.expected_completion_date : undefined,
        issuesFound: m.issues_found, cost: Number(m.cost), status: m.status, mechanicOrShop: m.mechanic_or_shop,
        mechanicContact: m.mechanic_contact, mechanicAddress: m.mechanic_address
      })));

      if (tripLogsRes.data) _setLogs(tripLogsRes.data.map(l => ({
        id: l.id, date: l.date, driverId: l.driver_id, vehicleId: l.vehicle_id, corporateAccountId: l.corporate_account_id,
        distanceTraveledKm: Number(l.distance_traveled_km), fuelConsumedLiters: Number(l.fuel_consumed_liters),
        incidents: l.incidents, speedingEvents: l.speeding_events, harshBraking: l.harsh_braking, idlingTimeHours: Number(l.idling_time_hours),
        routeDeviations: l.route_deviations, policyViolations: l.policy_violations, maintenanceIssuesLogged: l.maintenance_issues_logged,
        notes: l.notes,
        fuelCollections: l.fuel_collections?.map((fc: any) => ({
           id: fc.id, stationName: fc.station_name, location: fc.location, liters: Number(fc.liters),
           costPerLiter: Number(fc.cost_per_liter), receiptNumber: fc.receipt_number
        })),
        fuelIssuedLiters: 0, fuelCostPerLiter: 0 // legacy mapped fields
      })));
    };
    fetchData();
  }, []);

  // Intercepting State Updates for Cloud Sync
  const setDrivers = (action: React.SetStateAction<Driver[]>) => {
    _setDrivers(prev => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      handleSupabaseSync('drivers', prev, next, d => ({
        id: d.id, name: d.name, img_url: d.imgUrl, status: d.status, license_expiry: d.licenseExpiry, awards: d.awards
      }));
      return next;
    });
  };

  const setVehicles = (action: React.SetStateAction<Vehicle[]>) => {
    _setVehicles(prev => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      handleSupabaseSync('vehicles', prev, next, v => ({
        id: v.id, make_model: v.makeModel, year: v.year, plate_number: v.plateNumber, status: v.status,
        insurance_expiry: v.insuranceExpiry, condition: v.condition, is_company_registered: v.isCompanyRegistered
      }));
      return next;
    });
  };

  const setActiveDispatches = (action: React.SetStateAction<ActiveDispatch[]>) => {
    _setActiveDispatches(prev => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      handleSupabaseSync('active_dispatches', prev, next, d => ({
        id: d.id, driver_id: d.driverId, vehicle_id: d.vehicleId, corporate_account_id: d.corporateAccountId,
        dispatch_time: d.dispatchTime, odometer_out: d.odometerOut, fuel_level_out: d.fuelLevelOut,
        condition_out: d.conditionOut, expected_return_date: d.expectedReturnDate
      }));
      return next;
    });
  };

  const setMaintenanceRecords = (action: React.SetStateAction<MaintenanceRecord[]>) => {
    _setMaintenanceRecords(prev => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      handleSupabaseSync('maintenance_records', prev, next, m => ({
        id: m.id, vehicle_id: m.vehicleId, start_date: m.startDate, expected_completion_date: m.expectedCompletionDate,
        issues_found: m.issuesFound, cost: m.cost, status: m.status, mechanic_or_shop: m.mechanicOrShop,
        mechanic_contact: m.mechanicContact, mechanic_address: m.mechanicAddress
      }));
      return next;
    });
  };

  const setLogs = (action: React.SetStateAction<TripLog[]>) => {
    _setLogs(prev => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      handleSupabaseSync('trip_logs', prev, next, l => ({
        id: l.id, date: l.date, driver_id: l.driverId, vehicle_id: l.vehicleId, corporate_account_id: l.corporateAccountId,
        distance_traveled_km: l.distanceTraveledKm, fuel_consumed_liters: l.fuelConsumedLiters, incidents: l.incidents,
        speeding_events: l.speedingEvents, harsh_braking: l.harshBraking, idling_time_hours: l.idlingTimeHours,
        route_deviations: l.routeDeviations, policy_violations: l.policyViolations, maintenance_issues_logged: l.maintenanceIssuesLogged,
        notes: l.notes
      }));
      return next;
    });
  };`;

content = content.replace(stateSearch, stateReplacement);

fs.writeFileSync(filePath, content);
console.log('✅ PerformanceSection.tsx patched for Supabase!');
