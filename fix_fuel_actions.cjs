const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/PerformanceSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');
let fixes = 0;

function replace(oldStr, newStr, label) {
  if (content.includes(oldStr)) {
    content = content.split(oldStr).join(newStr);
    console.log(`✅ ${label}`);
    fixes++;
  } else {
    console.log(`❌ ${label} — NOT FOUND`);
  }
}

// ─────────────────────────────────────────────────────────
// Helper: build a DB row from a FuelCollection + tripLogId
// ─────────────────────────────────────────────────────────
const SAVE_HELPER = `
                    // ── Persist to Supabase ──────────────────────────────
                    const buildFuelRow = (e: FuelCollection, logId?: string) => ({
                      id: e.id,
                      trip_log_id: logId || e.tripLogId || null,
                      driver_id: e.driverId || null,
                      vehicle_id: e.vehicleId || null,
                      station_name: e.stationName,
                      location: e.location || 'Juba',
                      date: e.date || new Date().toISOString().split('T')[0],
                      time: e.time || null,
                      supplier: e.supplier || null,
                      is_partner_station: e.isPartnerStation ?? true,
                      district: e.district || null,
                      liters: e.liters || 0,
                      cost_per_liter: e.costPerLiter || 0,
                      total_cost: e.totalAmount || (e.liters * e.costPerLiter) || null,
                      fuel_type: e.fuelType || null,
                      payment_method: e.paymentMethod || null,
                      receipt_number: e.receiptNumber || null,
                      notes: e.nonPartnerReason || null,
                      remarks: e.remarks || null,
                    });
`;

// ═══════════════════════════════════════════════════════════
// FIX 1 — Save handler: inject DB calls for create / edit
// ═══════════════════════════════════════════════════════════
replace(
  `                    const entryId = standaloneFuelEntry.id || \`fc-\${Date.now()}\`;\r\n                    const isEditing = logs.some(l => (l.fuelCollections || []).some(fc => fc.id === entryId));\r\n                    const newEntry: FuelCollection = {\r\n                      ...standaloneFuelEntry as FuelCollection,\r\n                      id: entryId,\r\n                      driverId: standaloneFuelDriverId,\r\n                      vehicleId: standaloneFuelVehicleId,\r\n                      tripLogId: standaloneFuelTripLogId || undefined,\r\n                    };\r\n                    if (isEditing) {\r\n                      // Update existing entry across all logs\r\n                      setLogs(prev => prev.map(l => ({\r\n                        ...l,\r\n                        fuelCollections: (l.fuelCollections || []).map(fc => fc.id === entryId ? newEntry : fc),\r\n                      })));\r\n                      setViewingFuelCollection(newEntry);\r\n                    } else if (standaloneFuelTripLogId) {\r\n                      setLogs(prev => prev.map(l => l.id === standaloneFuelTripLogId\r\n                        ? { ...l, fuelCollections: [...(l.fuelCollections || []), newEntry] }\r\n                        : l\r\n                      ));\r\n                    } else {\r\n                      // Add as orphan entry linked only to driver/vehicle by adding to a synthetic log\r\n                      // For now, create a minimal trip log entry so the fuel appears in the Fuel Logs tab\r\n                      const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });\r\n                      const syntheticLog: TripLog = {\r\n                        id: \`log-fuel-\${Date.now()}\`,\r\n                        date: newEntry.date || new Date().toISOString().split('T')[0],\r\n                        driverId: standaloneFuelDriverId,\r\n                        vehicleId: standaloneFuelVehicleId,\r\n                        distanceTraveledKm: 0,\r\n                        fuelConsumedLiters: newEntry.liters || 0,\r\n                        fuelIssuedLiters: newEntry.liters || 0,\r\n                        fuelCostPerLiter: newEntry.costPerLiter || 0,\r\n                        incidents: 0, speedingEvents: 0, harshBraking: 0,\r\n                        idlingTimeHours: 0, routeDeviations: 0, policyViolations: 0,\r\n                        maintenanceIssuesLogged: false,\r\n                        fuelCollections: [newEntry],\r\n                        notes: \`Standalone fuel entry — \${today}\`,\r\n                        approvalStatus: 'Pending',\r\n                      };\r\n                      setLogs(prev => [syntheticLog, ...prev]);\r\n                    }\r\n                    setIsStandaloneFuelModalOpen(false);\r\n                    // Switch to Fuel Logs subtab so admin can see the new entry\r\n                    setFuelSubTab('fuel');`,
  `                    const entryId = standaloneFuelEntry.id || crypto.randomUUID();\r\n                    const isEditing = logs.some(l => (l.fuelCollections || []).some(fc => fc.id === entryId));\r\n                    const newEntry: FuelCollection = {\r\n                      ...standaloneFuelEntry as FuelCollection,\r\n                      id: entryId,\r\n                      driverId: standaloneFuelDriverId,\r\n                      vehicleId: standaloneFuelVehicleId,\r\n                      tripLogId: standaloneFuelTripLogId || undefined,\r\n                    };\r\n${SAVE_HELPER}\r\n                    if (isEditing) {\r\n                      // Update in state\r\n                      setLogs(prev => prev.map(l => ({\r\n                        ...l,\r\n                        fuelCollections: (l.fuelCollections || []).map(fc => fc.id === entryId ? newEntry : fc),\r\n                      })));\r\n                      setViewingFuelCollection(newEntry);\r\n                      // Persist update to Supabase\r\n                      supabase.from('fuel_collections').update(buildFuelRow(newEntry)).eq('id', entryId)\r\n                        .then(({ error }) => { if (error) console.warn('[Fuel Update]', error.message); });\r\n                    } else if (standaloneFuelTripLogId) {\r\n                      setLogs(prev => prev.map(l => l.id === standaloneFuelTripLogId\r\n                        ? { ...l, fuelCollections: [...(l.fuelCollections || []), newEntry] }\r\n                        : l\r\n                      ));\r\n                      // Persist to Supabase linked to existing trip log\r\n                      supabase.from('fuel_collections').insert(buildFuelRow(newEntry, standaloneFuelTripLogId))\r\n                        .then(({ error }) => { if (error) console.warn('[Fuel Insert (linked)]', error.message); });\r\n                    } else {\r\n                      // Standalone entry — create a synthetic trip log + linked fuel_collection\r\n                      const syntheticLogId = crypto.randomUUID();\r\n                      const entryDate = newEntry.date || new Date().toISOString().split('T')[0];\r\n                      const syntheticLog: TripLog = {\r\n                        id: syntheticLogId,\r\n                        date: entryDate,\r\n                        driverId: standaloneFuelDriverId,\r\n                        vehicleId: standaloneFuelVehicleId,\r\n                        distanceTraveledKm: 0,\r\n                        fuelConsumedLiters: newEntry.liters || 0,\r\n                        fuelIssuedLiters: newEntry.liters || 0,\r\n                        fuelCostPerLiter: newEntry.costPerLiter || 0,\r\n                        incidents: 0, speedingEvents: 0, harshBraking: 0,\r\n                        idlingTimeHours: 0, routeDeviations: 0, policyViolations: 0,\r\n                        maintenanceIssuesLogged: false,\r\n                        fuelCollections: [{ ...newEntry, tripLogId: syntheticLogId }],\r\n                        notes: 'Standalone fuel entry',\r\n                        approvalStatus: 'Pending',\r\n                      };\r\n                      setLogs(prev => [syntheticLog, ...prev]);\r\n                      // Persist: trip log first, then fuel collection\r\n                      supabase.from('trip_logs').insert({\r\n                        id: syntheticLogId,\r\n                        date: entryDate,\r\n                        driver_id: standaloneFuelDriverId,\r\n                        vehicle_id: standaloneFuelVehicleId,\r\n                        distance_traveled_km: 0,\r\n                        fuel_consumed_liters: newEntry.liters || 0,\r\n                        fuel_issued_liters: newEntry.liters || 0,\r\n                        fuel_cost_per_liter: newEntry.costPerLiter || 0,\r\n                        incidents: 0, speeding_events: 0, harsh_braking: 0,\r\n                        idling_time_hours: 0, route_deviations: 0, policy_violations: 0,\r\n                        maintenance_issues_logged: false,\r\n                        notes: 'Standalone fuel entry',\r\n                        approval_status: 'Pending',\r\n                      }).then(({ error: logErr }) => {\r\n                        if (logErr) { console.warn('[Fuel SyntheticLog Insert]', logErr.message); return; }\r\n                        supabase.from('fuel_collections').insert(buildFuelRow({ ...newEntry, tripLogId: syntheticLogId }, syntheticLogId))\r\n                          .then(({ error: fcErr }) => { if (fcErr) console.warn('[Fuel Insert (standalone)]', fcErr.message); });\r\n                      });\r\n                    }\r\n                    setIsStandaloneFuelModalOpen(false);\r\n                    // Switch to Fuel Logs subtab so admin can see the new entry\r\n                    setFuelSubTab('fuel');`,
  'Fix 1: Persist fuel save/edit to Supabase'
);

// ═══════════════════════════════════════════════════════════
// FIX 2 — Delete handler: also delete from Supabase
// ═══════════════════════════════════════════════════════════
replace(
  `                    const idToDelete = deletingFuelCollection.id;\r\n                    setLogs(prev => prev\r\n                      .map(l => ({\r\n                        ...l,\r\n                        fuelCollections: (l.fuelCollections || []).filter(fc => fc.id !== idToDelete),\r\n                      }))\r\n                      // Remove synthetic logs that become empty after deletion\r\n                      .filter(l => !l.id.startsWith('log-fuel-') || (l.fuelCollections || []).length > 0)\r\n                    );`,
  `                    const idToDelete = deletingFuelCollection.id;\r\n                    // Find the parent log to detect synthetic logs that will become empty\r\n                    const parentLog = logs.find(l => (l.fuelCollections || []).some(fc => fc.id === idToDelete));\r\n                    const parentBecomesEmpty = parentLog && (parentLog.fuelCollections || []).length === 1;\r\n                    const isSyntheticLog = parentLog?.id?.startsWith('log-');\r\n                    setLogs(prev => prev\r\n                      .map(l => ({\r\n                        ...l,\r\n                        fuelCollections: (l.fuelCollections || []).filter(fc => fc.id !== idToDelete),\r\n                      }))\r\n                      .filter(l => l.id !== parentLog?.id || !isSyntheticLog || !parentBecomesEmpty)\r\n                    );\r\n                    // Delete fuel_collection from Supabase\r\n                    supabase.from('fuel_collections').delete().eq('id', idToDelete)\r\n                      .then(({ error }) => { if (error) console.warn('[Fuel Delete]', error.message); });\r\n                    // If the synthetic parent trip log becomes empty, delete it too\r\n                    if (parentLog && isSyntheticLog && parentBecomesEmpty) {\r\n                      supabase.from('trip_logs').delete().eq('id', parentLog.id)\r\n                        .then(({ error }) => { if (error) console.warn('[Fuel SyntheticLog Delete]', error.message); });\r\n                    }`,
  'Fix 2: Persist fuel delete to Supabase'
);

fs.writeFileSync(filePath, content);
console.log(`\nDone — ${fixes}/2 fixes applied.`);
