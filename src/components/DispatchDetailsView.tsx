import React from 'react';
import { ArrowLeft, Clock, Car, User, Fuel, AlertTriangle, MapPin, CheckCircle2, Navigation, Activity, ShieldAlert, AlertCircle, Route, Users, Briefcase, ChevronRight, PenTool, Trash2, Download, Building2, Calendar, ThumbsUp, Flag, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActiveDispatch, CompletedDispatch, TripLog, TripLeg, Passenger, Driver, Vehicle } from './PerformanceSection';

interface DispatchDetailsViewProps {
  dispatch: ActiveDispatch | CompletedDispatch;
  tripLog?: TripLog;
  driver?: Driver;
  vehicle?: Vehicle;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReturn?: () => void;
  onEditTripLog?: () => void;
  onApprove?: (logId: string) => void;
  onFlag?: (logId: string, note: string) => void;
}

export const DispatchDetailsView: React.FC<DispatchDetailsViewProps> = ({ dispatch, tripLog, driver, vehicle, onBack, onEdit, onDelete, onReturn, onEditTripLog, onApprove, onFlag }) => {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'trip' | 'fuel'>('overview');
  const [isFlagging, setIsFlagging] = React.useState(false);
  const [flagNote, setFlagNote] = React.useState('');
  const isCompleted = 'completedAt' in dispatch;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const exportDispatchPDF = () => {
    const doc = new jsPDF();
    const compDispatch = dispatch as CompletedDispatch;

    // ── Header ──────────────────────────────────────────
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Completed Dispatch Report', 14, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Ref: ${dispatch.id.slice(0,8).toUpperCase()}   |   Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 22);

    // ── Section 1: Dispatch Overview ────────────────────
    doc.setTextColor(30, 30, 90);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Dispatch Overview', 14, 40);

    autoTable(doc, {
      startY: 44,
      body: [
        ['Driver', driver?.name || dispatch.driverId, 'Phone', driver?.phone || '-'],
        ['Vehicle', vehicle ? `${vehicle.makeModel}` : dispatch.vehicleId, 'Plate #', vehicle?.plateNumber || '-'],
        ['Dispatch Time', formatDate(compDispatch.dispatchTime), 'Expected Return', formatDateOnly(compDispatch.expectedReturnDate)],
        ['Returned At', formatDate(compDispatch.completedAt), 'Corporate A/C', compDispatch.corporateAccountId || '-'],
        ['Odometer Out', `${(compDispatch.odometerOut || 0).toLocaleString()} km`, 'Condition Out', compDispatch.conditionOut || '-'],
        ['Fuel Level Out', compDispatch.fuelLevelOut || '-', '', ''],
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38, fillColor: [245, 247, 255] }, 2: { fontStyle: 'bold', cellWidth: 38, fillColor: [245, 247, 255] } },
    });

    // ── Section 2: Trip Log & Safety Metrics ────────────
    if (tripLog) {
      let currentY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 90);
      doc.text('2. Trip Log & Safety Metrics', 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        body: [
          ['Trip Date', tripLog.date || '-', 'District', tripLog.district || '-'],
          ['Distance Traveled', `${(tripLog.distanceTraveledKm || 0).toLocaleString()} km`, 'Fuel Consumed', `${tripLog.fuelConsumedLiters || 0} L`],
          ['Fuel Issued', `${tripLog.fuelIssuedLiters || 0} L`, 'Fuel Cost / L', `Le ${(tripLog.fuelCostPerLiter || 0).toLocaleString()}`],
          ['Project Code', tripLog.projectCode || '-', 'Corporate A/C', tripLog.corporateAccountId || '-'],
          ['Speeding Events', String(tripLog.speedingEvents || 0), 'Harsh Braking', String(tripLog.harshBraking || 0)],
          ['Idling (hrs)', String(tripLog.idlingTimeHours || 0), 'Incidents', String(tripLog.incidents || 0)],
          ['Route Deviations', String(tripLog.routeDeviations || 0), 'Policy Violations', String(tripLog.policyViolations || 0)],
          ['Maintenance Flagged', tripLog.maintenanceIssuesLogged ? 'YES' : 'No', 'Approval Status', tripLog.approvalStatus || 'Pending'],
          ['Approved By', tripLog.approvedBy || '-', 'Approved At', tripLog.approvedAt ? formatDate(tripLog.approvedAt) : '-'],
          ['Approval Notes', tripLog.approvalNotes || '-', '', ''],
        ],
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 38, fillColor: [245, 247, 255] }, 2: { fontStyle: 'bold', cellWidth: 38, fillColor: [245, 247, 255] } },
      });

      if (tripLog.notes) {
        currentY = (doc as any).lastAutoTable.finalY + 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(90, 90, 110);
        const noteLines = doc.splitTextToSize(`Notes: "${tripLog.notes}"`, 182);
        doc.text(noteLines, 14, currentY);
        currentY += noteLines.length * 5;
      }

      // ── Section 3: Route Legs ──────────────────────────
      if (tripLog.legs && tripLog.legs.length > 0) {
        currentY = (doc as any).lastAutoTable.finalY + 10;
        if (tripLog.notes) currentY += 6;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 90);
        doc.text('3. Route Legs', 14, currentY);

        autoTable(doc, {
          startY: currentY + 4,
          head: [['#', 'Date', 'From', 'Depart', 'To', 'Arrive', 'Odo Start', 'Odo End', 'Distance', 'Purpose']],
          body: tripLog.legs.map((leg: TripLeg, i: number) => [
            String(i + 1),
            leg.date || tripLog.date || '-',
            leg.departurePoint || '-',
            leg.departureTime || '-',
            leg.destinationPoint || '-',
            leg.arrivalTime || '-',
            leg.odometerStart ? `${leg.odometerStart.toLocaleString()} km` : '-',
            leg.odometerEnd ? `${leg.odometerEnd.toLocaleString()} km` : '-',
            (leg.odometerStart && leg.odometerEnd) ? `${Math.max(0, leg.odometerEnd - leg.odometerStart).toLocaleString()} km` : '-',
            leg.purposeOfTrip || '-',
          ]),
          theme: 'grid',
          headStyles: { fillColor: [99, 102, 241], fontSize: 8 },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: { 0: { cellWidth: 8 } },
        });
      }

      // ── Section 4: Passenger Manifest ─────────────────
      if (tripLog.passengers && tripLog.passengers.length > 0) {
        currentY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 90);
        doc.text('4. Passenger Manifest', 14, currentY);

        autoTable(doc, {
          startY: currentY + 4,
          head: [['#', 'Name']],
          body: tripLog.passengers.map((pax: Passenger, i: number) => [String(i + 1), pax.name]),
          theme: 'grid',
          headStyles: { fillColor: [99, 102, 241], fontSize: 9 },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: { 0: { cellWidth: 15 } },
        });
      }

      // ── Section 5: Fuel Transactions ──────────────────
      if (tripLog.fuelCollections && tripLog.fuelCollections.length > 0) {
        currentY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 90);
        doc.text('5. Fuel Transactions', 14, currentY);

        autoTable(doc, {
          startY: currentY + 4,
          head: [['Date', 'Time', 'Station', 'Supplier', 'Partner', 'City', 'District', 'Fuel Type', 'Litres', 'Cost/L', 'Total (Le)', 'Payment', 'Receipt', 'Reason / Remarks']],
          body: tripLog.fuelCollections.map(fc => [
            fc.date || tripLog.date || '-',
            fc.time || '-',
            fc.stationName || '-',
            fc.supplier || '-',
            fc.isPartnerStation ? 'Yes' : 'No',
            fc.location || '-',
            fc.district || '-',
            fc.fuelType || '-',
            fc.liters ? String(fc.liters) : '-',
            fc.costPerLiter ? `Le ${fc.costPerLiter.toLocaleString()}` : '-',
            fc.totalAmount ? `Le ${fc.totalAmount.toLocaleString()}` : (fc.liters && fc.costPerLiter ? `Le ${(fc.liters * fc.costPerLiter).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-'),
            fc.paymentMethod || '-',
            fc.receiptNumber || '-',
            fc.nonPartnerReason || fc.remarks || '-',
          ]),
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129], fontSize: 7 },
          styles: { fontSize: 7, cellPadding: 2 },
        });

        // Fuel Summary row
        const totalLitres = tripLog.fuelCollections.reduce((s, fc) => s + (fc.liters || 0), 0);
        const totalCost = tripLog.fuelCollections.reduce((s, fc) => s + (fc.totalAmount || (fc.liters * fc.costPerLiter) || 0), 0);
        currentY = (doc as any).lastAutoTable.finalY + 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 90);
        doc.text(`Total Fuel Collected: ${totalLitres.toFixed(1)} L   |   Total Fuel Cost: Le ${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 14, currentY + 5);
      }
    }

    doc.save(`Dispatch_${dispatch.id.slice(0,8).toUpperCase()}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">Dispatch Details</h2>
              {isCompleted ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Completed
                </span>
              ) : (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black uppercase rounded-lg border border-indigo-200 flex items-center gap-1">
                  <Navigation size={12} /> Active
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm mt-1">Ref: {dispatch.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isCompleted && (
            <button onClick={exportDispatchPDF} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl transition-colors border border-indigo-100">
              <Download size={16} /> Export PDF
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">
              <PenTool size={16} /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-colors">
              <Trash2 size={16} /> Delete
            </button>
          )}
          {onReturn && (
            <button onClick={onReturn} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              <CheckCircle2 size={16} /> Return & Log
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs Navigation ─────────────────────────────── */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-700'
          }`}
        >
          <Navigation size={16} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('trip')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'trip' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-700'
          }`}
        >
          <Activity size={16} /> Trip Log
        </button>
        <button
          onClick={() => setActiveTab('fuel')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'fuel' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-700'
          }`}
        >
          <Fuel size={16} /> Fuel Details
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          OVERVIEW TAB
      ══════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">

          {/* Active Dispatch Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Navigation size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-800">Active Dispatch Details</h3>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 items-start">

              {/* Driver */}
              <div className="col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Driver</p>
                <div className="flex items-center gap-3">
                  {driver?.imgUrl ? (
                    <img src={driver.imgUrl} alt="" className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <User size={18} className="text-slate-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-950">{driver?.name || dispatch.driverId}</p>
                    <p className="text-xs text-slate-600">{driver?.phone || 'No phone'}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              <div className="col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Car size={18} className="text-slate-700" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-950">{vehicle?.makeModel || dispatch.vehicleId}</p>
                    <p className="text-xs text-slate-600">{vehicle?.plateNumber}</p>
                  </div>
                </div>
              </div>

              {/* Dispatched */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dispatched</p>
                <p className="font-semibold text-slate-800 text-sm">{formatDate(dispatch.dispatchTime)}</p>
              </div>

              {/* Expected Return */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Return</p>
                <p className="font-semibold text-slate-800 text-sm">{formatDateOnly(dispatch.expectedReturnDate)}</p>
              </div>

              {/* Odometer Out */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Odometer Out</p>
                <p className="font-semibold text-slate-800 text-sm">{dispatch.odometerOut.toLocaleString()} km</p>
              </div>

              {/* Fuel Level Out */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fuel Level Out</p>
                <p className="font-semibold text-slate-800 text-sm">{dispatch.fuelLevelOut || '-'}</p>
              </div>

              {/* Corporate Account */}
              {dispatch.corporateAccountId && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Corporate A/C</p>
                  <p className="font-semibold text-slate-800 text-sm flex items-center gap-1"><Building2 size={12} className="text-indigo-400" /> {dispatch.corporateAccountId}</p>
                </div>
              )}

              {/* Condition Out */}
              <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Condition Out</p>
                <p className="font-medium text-slate-700 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {dispatch.conditionOut || 'No notes provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Completed Dispatch Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <MapPin size={18} className={isCompleted ? 'text-emerald-600' : 'text-slate-500'} />
              <h3 className="font-bold text-slate-800">Completed Dispatch Details</h3>
            </div>
            <div className="p-6">
              {isCompleted ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Returned At</p>
                    <p className="font-semibold text-slate-800 text-sm">{formatDate((dispatch as CompletedDispatch).completedAt)}</p>
                  </div>
                  {tripLog ? (
                    <>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Distance Traveled</p>
                        <p className="font-semibold text-slate-800 text-sm">{tripLog.distanceTraveledKm.toLocaleString()} km</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fuel Consumed</p>
                        <p className="font-semibold text-slate-800 text-sm">{tripLog.fuelConsumedLiters} L</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Odometer In</p>
                        <p className="font-semibold text-slate-800 text-sm">{(dispatch.odometerOut + tripLog.distanceTraveledKm).toLocaleString()} km</p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-3 bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-200 text-sm">
                      Return recorded, but Trip Log data is missing.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4 py-2">
                  <Clock size={36} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-600 text-base">Pending Return</p>
                    <p className="text-sm text-slate-500 mt-0.5">Vehicle is currently active. Return data will appear here once the driver logs back in.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TRIP LOG TAB
      ══════════════════════════════════════════════════ */}
      {activeTab === 'trip' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Activity size={18} className={isCompleted && tripLog ? 'text-rose-600' : 'text-slate-500'} />
                  <h3 className="font-bold text-slate-800">Trip Log Details</h3>
                  {/* Current approval status badge */}
                  {tripLog?.approvalStatus && (
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full tracking-wider ${
                      tripLog.approvalStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      tripLog.approvalStatus === 'Flagged' ? 'bg-red-100 text-red-700 border border-red-200' :
                      'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>{tripLog.approvalStatus}</span>
                  )}
                </div>
                {/* Approval action buttons — only when a tripLog exists */}
                {tripLog && (
                  <div className="flex items-center gap-2">
                    {onApprove && (
                      <button
                        onClick={() => { onApprove(tripLog.id); setIsFlagging(false); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        {tripLog.approvalStatus === 'Approved' ? <PenTool size={13} /> : <ThumbsUp size={13} />}
                        {tripLog.approvalStatus === 'Approved' ? 'Edit Approval' : 'Approve'}
                      </button>
                    )}
                    {!onApprove && tripLog.approvalStatus === 'Approved' && (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                        <CheckCircle2 size={13} /> Approved
                      </span>
                    )}
                    {onFlag && (
                      <button
                        onClick={() => setIsFlagging(f => !f)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                          isFlagging ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-white hover:bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        <Flag size={13} /> {tripLog.approvalStatus === 'Flagged' ? 'Re-Flag' : 'Flag Issue'}
                      </button>
                    )}
                    {onEditTripLog && (
                      <button onClick={onEditTripLog} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                        <PenTool size={14} /> Edit
                      </button>
                    )}
                  </div>
                )}
                {!tripLog && onEditTripLog && (
                  <button onClick={onEditTripLog} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                    <PenTool size={14} /> Edit Trip Log
                  </button>
                )}
              </div>
              {/* Inline Flag Note Input */}
              {isFlagging && onFlag && tripLog && (
                <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <Flag size={14} className="text-red-500 shrink-0" />
                  <input
                    type="text"
                    value={flagNote}
                    onChange={e => setFlagNote(e.target.value)}
                    placeholder="Describe the issue (e.g. odometer mismatch, missing receipts)..."
                    className="flex-1 text-xs p-1.5 border border-red-200 rounded-lg bg-white focus:ring-2 focus:ring-red-300 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => { if (flagNote.trim()) { onFlag(tripLog.id, flagNote.trim()); setIsFlagging(false); setFlagNote(''); } }}
                    disabled={!flagNote.trim()}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                  >
                    Confirm Flag
                  </button>
                  <button onClick={() => { setIsFlagging(false); setFlagNote(''); }} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded-lg transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {isCompleted && tripLog ? (
                <div className="space-y-6">

                  {/* Date & Basic Info Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center gap-2">
                      <Calendar size={14} className="text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Trip Date</p>
                        <p className="text-sm font-bold text-indigo-800 mt-0.5">{formatDateOnly(tripLog.date)}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Distance</p>
                      <p className="text-sm font-bold text-slate-800">{tripLog.distanceTraveledKm.toLocaleString()} km</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Fuel Consumed</p>
                      <p className="text-sm font-bold text-slate-800">{tripLog.fuelConsumedLiters} L</p>
                    </div>
                    {tripLog.district && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">District</p>
                        <p className="text-sm font-bold text-slate-800">{tripLog.district}</p>
                      </div>
                    )}
                  </div>

                  {/* Safety Metric Tiles */}
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Safety & Compliance Metrics</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-center">
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">Speeding</p>
                        <p className="text-2xl font-black text-slate-800">{tripLog.speedingEvents}</p>
                        <p className="text-xs text-slate-500 mt-0.5">events</p>
                      </div>
                      <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-center">
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Harsh Braking</p>
                        <p className="text-2xl font-black text-slate-800">{tripLog.harshBraking}</p>
                        <p className="text-xs text-slate-500 mt-0.5">events</p>
                      </div>
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Idling</p>
                        <p className="text-2xl font-black text-slate-800">{tripLog.idlingTimeHours}</p>
                        <p className="text-xs text-slate-500 mt-0.5">hours</p>
                      </div>
                      <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 text-center">
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                          <ShieldAlert size={10} /> Incidents
                        </p>
                        <p className="text-2xl font-black text-slate-800">{tripLog.incidents}</p>
                        <p className="text-xs text-slate-500 mt-0.5">reported</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Compliance & Logistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Fuel Issued</p>
                      <p className="text-sm font-bold text-slate-800">{tripLog.fuelIssuedLiters || 0} L</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Fuel Cost / L</p>
                      <p className="text-sm font-bold text-slate-800">Le {(tripLog.fuelCostPerLiter || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">Route Devs</p>
                      <p className="text-sm font-bold text-slate-800">{tripLog.routeDeviations || 0}</p>
                    </div>
                    <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-0.5">Policy Violations</p>
                      <p className="text-sm font-bold text-slate-800">{tripLog.policyViolations || 0}</p>
                    </div>
                    {tripLog.corporateAccountId && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Corporate A/C</p>
                        <p className="text-sm font-bold text-slate-800 truncate" title={tripLog.corporateAccountId}>{tripLog.corporateAccountId}</p>
                      </div>
                    )}
                    {tripLog.projectCode && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Project Code</p>
                        <p className="text-sm font-bold text-slate-800">{tripLog.projectCode}</p>
                      </div>
                    )}
                  </div>

                  {/* Maintenance Flag */}
                  {tripLog.maintenanceIssuesLogged && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                      <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">Maintenance Flagged by Driver</p>
                        <p className="text-xs text-amber-700 mt-0.5">Driver reported issues requiring maintenance review.</p>
                      </div>
                    </div>
                  )}

                  {/* Trip Notes */}
                  {tripLog.notes && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Trip Notes</p>
                      <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 italic leading-relaxed">
                        "{tripLog.notes}"
                      </p>
                    </div>
                  )}

                  {/* Project Code & Approval */}
                  {(tripLog.projectCode || tripLog.approvalStatus) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tripLog.projectCode && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                          <Briefcase size={16} className="text-indigo-500 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Code</p>
                            <p className="font-bold text-slate-800 text-sm mt-0.5">{tripLog.projectCode}</p>
                          </div>
                        </div>
                      )}
                      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                        tripLog.approvalStatus === 'Approved' ? 'bg-emerald-50 border-emerald-200' :
                        tripLog.approvalStatus === 'Flagged' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                      }`}>
                        {tripLog.approvalStatus === 'Approved' && <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />}
                        {tripLog.approvalStatus === 'Flagged' && <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />}
                        {(!tripLog.approvalStatus || tripLog.approvalStatus === 'Pending') && <Clock size={16} className="text-slate-500 shrink-0 mt-0.5" />}
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approval Status</p>
                          <p className={`font-bold text-sm mt-0.5 ${
                            tripLog.approvalStatus === 'Approved' ? 'text-emerald-700' :
                            tripLog.approvalStatus === 'Flagged' ? 'text-red-700' : 'text-slate-700'
                          }`}>{tripLog.approvalStatus || 'Pending'}</p>
                          {tripLog.approvedBy && <p className="text-xs text-slate-600 mt-0.5">By: {tripLog.approvedBy} {tripLog.approvedAt ? `· ${formatDate(tripLog.approvedAt)}` : ''}</p>}
                          {tripLog.approvalNotes && <p className="text-xs text-red-600 mt-0.5 italic">{tripLog.approvalNotes}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trip Legs */}
                  {tripLog.legs && tripLog.legs.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Route size={12} /> Route Legs ({tripLog.legs.length})
                      </p>
                      <div className="space-y-1">
                        {tripLog.legs.map((leg: TripLeg, i: number) => (
                          <div key={leg.id || i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i + 1}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                                <span className="truncate">{leg.departurePoint}</span>
                                <ChevronRight size={12} className="text-slate-500 shrink-0" />
                                <span className="truncate">{leg.destinationPoint}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                                {leg.date && leg.date !== tripLog.date && <span className="flex items-center gap-1"><Calendar size={10} />{formatDateOnly(leg.date)}</span>}
                                {leg.departureTime && <span>{leg.departureTime} → {leg.arrivalTime}</span>}
                                {leg.odometerStart !== undefined && <span className="font-mono">{leg.odometerStart.toLocaleString()} → {leg.odometerEnd.toLocaleString()} km ({Math.max(0, (leg.odometerEnd || 0) - (leg.odometerStart || 0)).toLocaleString()} km)</span>}
                              </div>
                              {leg.purposeOfTrip && <p className="text-xs text-slate-600 italic mt-0.5">{leg.purposeOfTrip}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Auto-calculated total from legs */}
                      <div className="mt-2 text-xs text-slate-600 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                        Auto-calculated distance: <span className="font-bold text-indigo-700">
                          {tripLog.legs.reduce((sum, l) => sum + Math.max(0, (l.odometerEnd || 0) - (l.odometerStart || 0)), 0).toLocaleString()} km
                        </span> from {tripLog.legs.length} leg(s).
                      </div>
                    </div>
                  )}

                  {/* Passenger Manifest */}
                  {tripLog.passengers && tripLog.passengers.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Users size={12} /> Passengers ({tripLog.passengers.length})
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {tripLog.passengers.map((pax: Passenger, i: number) => (
                          <div key={pax.id || i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">{i + 1}</div>
                            <span className="text-sm text-slate-700 font-medium truncate">{pax.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4 py-2">
                  <AlertCircle size={36} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-600 text-base">Trip Log Pending</p>
                    <p className="text-sm text-slate-500 mt-0.5">Safety metrics and trip data will appear here after the driver submits the return log.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          FUEL DETAILS TAB
      ══════════════════════════════════════════════════ */}
      {activeTab === 'fuel' && (
        <div className="space-y-6 animate-fade-in">
          {tripLog?.fuelCollections && tripLog.fuelCollections.length > 0 ? (
            <>
              {/* Fuel Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Stops</p>
                  <p className="text-2xl font-black text-slate-800">{tripLog.fuelCollections.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-blue-100 p-4 text-center shadow-sm bg-blue-50/30">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Total Litres</p>
                  <p className="text-2xl font-black text-slate-800">{tripLog.fuelCollections.reduce((s, fc) => s + (fc.liters || 0), 0).toFixed(1)} L</p>
                </div>
                <div className="bg-white rounded-xl border border-emerald-100 p-4 text-center shadow-sm bg-emerald-50/30">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Cost</p>
                  <p className="text-xl font-black text-slate-800">Le {tripLog.fuelCollections.reduce((s, fc) => s + (fc.totalAmount || (fc.liters * fc.costPerLiter) || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Partner Stops</p>
                  <p className="text-2xl font-black text-slate-800">{tripLog.fuelCollections.filter(fc => fc.isPartnerStation).length} / {tripLog.fuelCollections.length}</p>
                </div>
              </div>

              {/* Fuel Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Fuel size={18} className="text-blue-600" />
                  <h3 className="font-bold text-slate-800">Fuel Transactions</h3>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-mono text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">#</th>
                          <th className="px-4 py-3 font-semibold">Date & Time</th>
                          <th className="px-4 py-3 font-semibold">Station / Supplier</th>
                          <th className="px-4 py-3 font-semibold">Location</th>
                          <th className="px-4 py-3 font-semibold">Fuel Type</th>
                          <th className="px-4 py-3 font-semibold">Litres</th>
                          <th className="px-4 py-3 font-semibold">Cost / L</th>
                          <th className="px-4 py-3 font-semibold">Total Cost</th>
                          <th className="px-4 py-3 font-semibold">Payment</th>
                          <th className="px-4 py-3 font-semibold">Receipt / Ref</th>
                          <th className="px-4 py-3 font-semibold">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tripLog.fuelCollections.map((fc, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-slate-500 text-xs font-bold">{i + 1}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-950 text-xs">{formatDateOnly(fc.date || tripLog.date)}</p>
                              <p className="text-xs text-slate-600">{fc.time || '-'}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-950 flex items-center gap-1.5 text-sm">
                                {fc.stationName}
                                {fc.isPartnerStation && (
                                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">Partner</span>
                                )}
                              </p>
                              <p className="text-xs text-slate-600">{fc.supplier || '-'}</p>
                              {fc.isPartnerStation === false && fc.nonPartnerReason && (
                                <p className="text-[10px] text-amber-600 italic mt-0.5">⚠ {fc.nonPartnerReason}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm text-slate-700">{fc.location || '-'}</p>
                              {fc.district && <p className="text-xs text-slate-600">{fc.district}</p>}
                              {fc.region && <p className="text-xs text-slate-500">{fc.region}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                fc.fuelType === 'Diesel' ? 'bg-amber-100 text-amber-700' :
                                fc.fuelType === 'Premium' ? 'bg-purple-100 text-purple-700' :
                                fc.fuelType === 'Petrol' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                              }`}>{fc.fuelType || '-'}</span>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-950">{fc.liters} L</td>
                            <td className="px-4 py-3 text-slate-700">Le {(fc.costPerLiter || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 font-bold text-emerald-700">
                              {fc.totalAmount
                                ? `Le ${fc.totalAmount.toLocaleString()}`
                                : (fc.liters && fc.costPerLiter ? `Le ${(fc.liters * fc.costPerLiter).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-')}
                            </td>
                            <td className="px-4 py-3 text-slate-700 text-xs">{fc.paymentMethod || '-'}</td>
                            <td className="px-4 py-3 text-slate-700 text-xs">{fc.receiptNumber || '-'}</td>
                            <td className="px-4 py-3 max-w-[160px]">
                              <p className="text-xs text-slate-600 truncate" title={fc.remarks || '-'}>{fc.remarks || '-'}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <Fuel size={18} className="text-slate-500" />
                <h3 className="font-bold text-slate-800">Fuel Details</h3>
              </div>
              <div className="p-12 text-center text-slate-600">
                <Fuel size={48} className="mx-auto mb-4 text-slate-400 opacity-50" />
                <p className="font-bold">No Fuel Data</p>
                <p className="text-sm mt-1">There are no fuel collections recorded for this trip.</p>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
