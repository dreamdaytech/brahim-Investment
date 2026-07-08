const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'AdminSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The corrupted block uses mixed \r\n and \n line endings — match with a regex
const corruptRegex = /return \(\) => subscription\.unsubscribe\(\);\s+item\.organization\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\|\s+item\.preferredVehicle\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\);\s+\s+const matchesStatus = filterStatus === 'All' \? true : item\.status === filterStatus;\s+\s+return matchesSearch && matchesStatus;\s+\}\);\s+\/\/ Calculate quick admin totals/;

const fixedSection = `return () => subscription.unsubscribe();
    });

    const handleOpenProfile = () => setAdminTab('profile');
    const handleOpenOverview = () => setAdminTab('overview');
    window.addEventListener('open-admin-profile', handleOpenProfile);
    window.addEventListener('open-admin-overview', handleOpenOverview);
    return () => {
      window.removeEventListener('open-admin-profile', handleOpenProfile);
      window.removeEventListener('open-admin-overview', handleOpenOverview);
    };
  }, []);

  // Fetch admin-only data after authentication (CRIT-1 fix)
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const mapInquiryFromDB = (dbItem) => ({
      id: dbItem.id,
      fullName: dbItem.fullname || dbItem.fullName,
      organization: dbItem.organization,
      email: dbItem.email,
      phone: dbItem.phone,
      serviceType: dbItem.servicetype || dbItem.serviceType,
      startDate: dbItem.startdate || dbItem.startDate,
      endDate: dbItem.enddate || dbItem.endDate,
      preferredVehicle: dbItem.preferredvehicle || dbItem.preferredVehicle,
      vehiclesNeeded: dbItem.vehiclesneeded || dbItem.vehiclesNeeded,
      pickupLocation: dbItem.pickuplocation || dbItem.pickupLocation,
      dropoffLocation: dbItem.dropofflocation || dbItem.dropoffLocation,
      specialRequirementsDet: dbItem.specialrequirementsdet || dbItem.specialRequirementsDet,
      status: dbItem.status,
      createdAt: dbItem.createdat || dbItem.createdAt
    });

    const fetchAdminData = async () => {
      const { data: inqData } = await supabase.from('inquiries').select('*');
      if (inqData) setInquiries(inqData.map(mapInquiryFromDB));
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData) setClients(clientsData);
    };
    fetchAdminData();

    const inqCh = supabase.channel('admin:inq').on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, async () => {
      const { data } = await supabase.from('inquiries').select('*');
      if (data) setInquiries(data.map(mapInquiryFromDB));
    }).subscribe();
    const cliCh = supabase.channel('admin:cli').on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, async () => {
      const { data } = await supabase.from('clients').select('*');
      if (data) setClients(data);
    }).subscribe();
    return () => { supabase.removeChannel(inqCh); supabase.removeChannel(cliCh); };
  }, [isAuthenticated]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    const { supabase: sb } = await import('../lib/supabase');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    const { supabase: sb } = await import('../lib/supabase');
    await sb.auth.signOut();
    // CRIT-2: Clear all sensitive cached data from localStorage on sign-out
    localStorage.removeItem('big_group_inquiries_cache');
    localStorage.removeItem('big_group_clients_cache');
    localStorage.removeItem('big_group_team_cache');
    setInquiries([]);
    setClients([]);
  };

  const onUpdateStatus = async (id: string, status: any) => { await supabase.from('inquiries').update({ status }).eq('id', id); };
  const onDeleteInquiry = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this inquiry?"))
      await supabase.from('inquiries').delete().eq('id', id);
  };
  const onAddClient = async (newClient: any) => { await supabase.from('clients').insert([newClient]); };
  const onUpdateClient = async (id: string, updateData: any) => { await supabase.from('clients').update(updateData).eq('id', id); };
  const onDeleteClient = async (id: string) => { await supabase.from('clients').delete().eq('id', id); };

  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch =
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.preferredVehicle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate quick admin totals`;

if (corruptRegex.test(content)) {
  content = content.replace(corruptRegex, fixedSection);
  console.log('✓ Fixed corrupted section using regex');
} else {
  console.log('⚠ Regex did not match. Trying alternative approach...');
  // Try to find by a snippet right before and right after
  const marker1 = 'return () => subscription.unsubscribe();';
  const marker2 = '  // Calculate quick admin totals';
  const start = content.indexOf(marker1);
  const end = content.indexOf(marker2);
  if (start !== -1 && end !== -1 && end > start) {
    content = content.slice(0, start) + fixedSection + '\n' + content.slice(end + marker2.length);
    console.log('✓ Fixed corrupted section using markers at', start, '-', end);
  } else {
    console.log('✗ Could not find markers. start=', start, 'end=', end);
  }
}

// Remove duplicate import block (lines 8-19 that got inserted)
// They appear after the first "import autoTable from 'jspdf-autotable';" block
const firstImportBlock = content.indexOf("import autoTable from 'jspdf-autotable';");
const secondImportBlock = content.indexOf("import autoTable from 'jspdf-autotable';", firstImportBlock + 10);
if (secondImportBlock !== -1) {
  // find the second React import before this second autoTable
  const secondReactImport = content.lastIndexOf("import React, { useState, useMemo }", secondImportBlock);
  const endOfSecondBlock = content.indexOf('\n', secondImportBlock) + 1;
  content = content.slice(0, secondReactImport) + content.slice(endOfSecondBlock);
  console.log('✓ Removed duplicate import block');
} else {
  console.log('ℹ No duplicate import block found');
}

fs.writeFileSync(filePath, content);
console.log('Done.');
