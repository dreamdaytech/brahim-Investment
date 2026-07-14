const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldBlock = `                    if (isEditing) {
                      // Update in state
                      setLogs(prev => prev.map(l => ({
                        ...l,
                        fuelCollections: (l.fuelCollections || []).map(fc => fc.id === entryId ? newEntry : fc),
                      })));
                      setViewingFuelCollection(newEntry);
                        id: syntheticLogId,
                        date: entryDate,
                        driverId: standaloneFuelDriverId,
                        vehicleId: standaloneFuelVehicleId,
                        distanceTraveledKm: 0,
                        fuelConsumedLiters: newEntry.liters || 0,
                        fuelIssuedLiters: newEntry.liters || 0,
                        fuelCostPerLiter: newEntry.costPerLiter || 0,
                        incidents: 0, speedingEvents: 0, harshBraking: 0,
                        idlingTimeHours: 0, routeDeviations: 0, policyViolations: 0,
                        maintenanceIssuesLogged: false,
                        fuelCollections: [{ ...newEntry, tripLogId: syntheticLogId }],
                        notes: 'Standalone fuel entry',
                        approvalStatus: 'Pending',
                      };
                      setLogs(prev => [syntheticLog, ...prev]);
                      // Persist: trip log first, then fuel collection
                      supabase.from('trip_logs').insert({`;

const newBlock = `                    if (isEditing) {
                      // Update in state
                      setLogs(prev => prev.map(l => ({
                        ...l,
                        fuelCollections: (l.fuelCollections || []).map(fc => fc.id === entryId ? newEntry : fc),
                      })));
                      setViewingFuelCollection(newEntry);
                      // Persist update to Supabase
                      supabase.from('fuel_collections').update(buildFuelRow(newEntry)).eq('id', entryId)
                        .then(({ error }) => { if (error) console.warn('[Fuel Update]', error.message); });
                    } else if (standaloneFuelTripLogId) {
                      setLogs(prev => prev.map(l => l.id === standaloneFuelTripLogId
                        ? { ...l, fuelCollections: [...(l.fuelCollections || []), newEntry] }
                        : l
                      ));
                      // Persist to Supabase linked to existing trip log
                      supabase.from('fuel_collections').insert(buildFuelRow(newEntry, standaloneFuelTripLogId))
                        .then(({ error }) => { if (error) console.warn('[Fuel Insert (linked)]', error.message); });
                    } else {
                      // Standalone entry — create a synthetic trip log + linked fuel_collection
                      const syntheticLogId = uuidv4();
                      const entryDate = newEntry.date || new Date().toISOString().split('T')[0];
                      const syntheticLog: TripLog = {
                        id: syntheticLogId,
                        date: entryDate,
                        driverId: standaloneFuelDriverId,
                        vehicleId: standaloneFuelVehicleId,
                        distanceTraveledKm: 0,
                        fuelConsumedLiters: newEntry.liters || 0,
                        fuelIssuedLiters: newEntry.liters || 0,
                        fuelCostPerLiter: newEntry.costPerLiter || 0,
                        incidents: 0, speedingEvents: 0, harshBraking: 0,
                        idlingTimeHours: 0, routeDeviations: 0, policyViolations: 0,
                        maintenanceIssuesLogged: false,
                        fuelCollections: [{ ...newEntry, tripLogId: syntheticLogId }],
                        notes: 'Standalone fuel entry',
                        approvalStatus: 'Pending',
                      };
                      _setLogs(prev => [syntheticLog, ...prev]); // Bypasses handleSupabaseSync to prevent race condition
                      // Persist: trip log first, then fuel collection
                      supabase.from('trip_logs').insert({`;

// Since there could be Windows \r\n vs \n issues, let's normalize the string.
const normalize = (str) => str.replace(/\r\n/g, '\n');

if (normalize(content).includes(normalize(oldBlock))) {
  content = normalize(content).split(normalize(oldBlock)).join(normalize(newBlock));
  fs.writeFileSync(filePath, content);
  console.log('✅ Fix applied: Restored code and changed setLogs to _setLogs.');
} else {
  console.log('❌ Could not find the exact oldBlock to replace.');
  // Log a chunk of the actual file to see what's wrong
  const idx = normalize(content).indexOf('setViewingFuelCollection(newEntry);');
  if (idx > -1) {
    console.log('Found setViewingFuelCollection at', idx);
    console.log('Context:', normalize(content).substring(idx, idx + 500));
  }
}
