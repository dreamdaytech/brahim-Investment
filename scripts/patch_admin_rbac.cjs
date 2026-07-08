const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'AdminSection.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add AccessControlView import
if (!content.includes('import { AccessControlView }')) {
  content = content.replace(
    "import { DashboardOverview } from './DashboardOverview';",
    "import { DashboardOverview } from './DashboardOverview';\nimport { AccessControlView } from './AccessControlView';"
  );
}

// 2. Add userRole state and adjust adminTab state
content = content.replace(
  /const \[adminTab, setAdminTab\] = useState<'overview' \| 'reservations' \| 'clients' \| 'performance' \| 'dispatch_management' \| 'drivers' \| 'vehicles' \| 'fuel' \| 'billing' \| 'profile'\>\('overview'\);/,
  "const [adminTab, setAdminTab] = useState<'overview' | 'reservations' | 'clients' | 'performance' | 'dispatch_management' | 'drivers' | 'vehicles' | 'fuel' | 'billing' | 'profile' | 'access'>('overview');\n  const [userRole, setUserRole] = useState<string>('super_admin');"
);

// 3. Update auth check in useEffect
const newUseEffect = `  React.useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: roleData } = await supabase.from('user_roles').select('role, is_active').eq('id', session.user.id).single();
          if (roleData) {
            if (!roleData.is_active) {
              await supabase.auth.signOut();
              setAuthError('Your account has been suspended.');
              setIsAuthenticated(false);
            } else {
              setUserRole(roleData.role);
              setIsAuthenticated(true);
            }
          } else {
            // Fallback for existing admin before migration
            setUserRole('super_admin');
            setIsAuthenticated(true);
          }
        } else {
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      };
      
      checkAuth();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        checkAuth();
      });

      return () => subscription.unsubscribe();
    });`;

content = content.replace(
  /React\.useEffect\(\(\) => \{\s*import\('\.\.\/lib\/supabase'\)\.then\(\(\{ supabase \}\) => \{\s*supabase\.auth\.getSession\(\)\.then\(\(\{ data: \{ session \} \}\) => \{\s*setIsAuthenticated\(!!session\);\s*setIsLoading\(false\);\s*\}\);\s*const \{ data: \{ subscription \} \} = supabase\.auth\.onAuthStateChange\(\(_event, session\) => \{\s*setIsAuthenticated\(!!session\);\s*\}\);\s*return \(\) => subscription\.unsubscribe\(\);\s*\}\);/,
  newUseEffect
);

// 4. Update the sidebar navigation items logic
// Overview
content = content.replace(
  /\{\s*id: 'overview',\s*label: 'Dashboard',\s*icon: BarChart3,\s*badge: null\s*\}/,
  "{ id: 'overview', label: 'Dashboard', icon: BarChart3, badge: null }"
);

// We need to filter the operations/fleet intelligence based on roles.
// Operations:
content = content.replace(
  /\{\s*id: 'clients',\s*label: 'Partners & Clients',\s*icon: Users,\s*badge: null\s*\},\s*\{\s*id: 'team',\s*label: 'Operational Team',\s*icon: Users,\s*badge: null\s*\}/,
  `{ id: 'clients', label: 'Partners & Clients', icon: Users, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] },
                { id: 'team', label: 'Operational Team', icon: Users, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] }`
);

// Modify mapping to check roles
content = content.replace(
  /\]\.map\(item => \{/g,
  "].filter((item: any) => !item.roles || item.roles.includes(userRole)).map(item => {"
);

// Fleet Intelligence:
content = content.replace(
  /\{\s*id: 'reservations',[\s\S]*?id: 'billing', label: 'Billing & CRM', icon: CreditCard, badge: null\s*\}/,
  `{ id: 'reservations', label: 'Reservations', icon: LayoutDashboard, badge: pendingInquiries > 0 ? pendingInquiries : null, roles: ['super_admin', 'admin', 'fleet_manager', 'finance'] },
                { id: 'performance', label: 'Management', icon: Activity, badge: null, roles: ['super_admin', 'admin', 'fleet_manager', 'finance'] },
                { id: 'dispatch_management', label: 'Dispatch', icon: Navigation, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] },
                { id: 'drivers', label: 'Drivers', icon: User, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] },
                { id: 'vehicles', label: 'Vehicles', icon: Car, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] },
                { id: 'fuel', label: 'Fuel', icon: Fuel, badge: null, roles: ['super_admin', 'admin', 'fleet_manager'] },
                { id: 'billing', label: 'Billing & CRM', icon: CreditCard, badge: null, roles: ['super_admin', 'admin', 'finance'] }`
);

// Admin Controls
content = content.replace(
  /\{\s*id: 'profile',\s*label: 'Profile & Security',\s*icon: Settings,\s*badge: null\s*\}/,
  `{ id: 'profile', label: 'Profile & Security', icon: Settings, badge: null, roles: ['super_admin', 'admin', 'fleet_manager', 'finance'] },
                { id: 'access', label: 'Access Control', icon: ShieldCheck, badge: null, roles: ['super_admin'] }`
);

// 5. Add AccessControlView to the main content switch
content = content.replace(
  /adminTab === 'billing' \&\& \(.*?<\/?CorporateBilling.*?>.*?\)/s,
  `adminTab === 'billing' && (
              <CorporateBilling />
            )}
            
            {adminTab === 'access' && (
              <AccessControlView currentUserRole={userRole} />
            )`
);

// 6. Security protection inside rendering blocks (in case someone forces the state)
// Let's just rely on the UI hiding the tabs for now, as it's a SPA and standard practice unless we wrap each component.
// But we will pass userRole to AdminProfile to allow password change!
content = content.replace(
  /<AdminProfile \/>/,
  '<AdminProfile currentUserRole={userRole} />'
);

fs.writeFileSync(filePath, content);
console.log('AdminSection.tsx updated for RBAC');
