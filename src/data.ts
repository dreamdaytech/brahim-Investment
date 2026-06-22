import { Vehicle } from './types';

export const VEHICLES: Vehicle[] = [
  {
    id: 'toyota-prado',
    name: 'Toyota Land Cruiser Prado',
    type: 'Heavy SUV',
    transmission: 'Automatic',
    fuel: 'Diesel',
    features: [
      'Full-Time 4WD with Active Traction Control',
      'Spacious Cabin (Up to 7 Seats)',
      'Dual-zone Automatic Climate Control',
      'Advanced Multi-terrain ABS Systems',
      'Chilled Center Console drink box',
      'Heavy-duty suspension tailored for Sierra Leonean roads'
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA80uYh85m4vNLCuiR9IVe7LANbiSD68yDOKmV-dC99lK2Urdp3y19dyJW5zhey_x3NSlBuJ8qAxiEoTYTp8XmTeageQQ-TZ477-oMh40Rh5PFGNLfGMSqqNRhjOhBuEPaQT3DoR-RG1vMiabXItb3PzpRARfSgO93p-CuBbvE9OhiaeT3KyuOwpMeshR_TCeAuIA1d_ahIVb_Mytc_vg93OqQCKZ28jpoM2yFRN0U0G4MlxYY_-wnR_g-4nhWlDlrI7CVBL68V0Uc',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA80uYh85m4vNLCuiR9IVe7LANbiSD68yDOKmV-dC99lK2Urdp3y19dyJW5zhey_x3NSlBuJ8qAxiEoTYTp8XmTeageQQ-TZ477-oMh40Rh5PFGNLfGMSqqNRhjOhBuEPaQT3DoR-RG1vMiabXItb3PzpRARfSgO93p-CuBbvE9OhiaeT3KyuOwpMeshR_TCeAuIA1d_ahIVb_Mytc_vg93OqQCKZ28jpoM2yFRN0U0G4MlxYY_-wnR_g-4nhWlDlrI7CVBL68V0Uc',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCn0MU34fmPtH0TaKKtBkOUBCIrqqmXi3WlVx0EnR5xdjlBXATq7rJURczgEu8T3OApWn81DUrz6R5r0cWfc75npPoM5fL4X1f08TB0aUvxjXKcOo0XIOOmuNp1nVHvEVXHdjXz3iMUAtafaCCp5vm3TV00Ti59HWAKqPO4eWpcgIu9-LM9qCQ5Rxrjx8MDpYjdqiZlOONCTzUB818wrrBfN91V5U2OjbnsZMhRvRYvgYSuPL3sY6_cIitiQInr8-RffvZ46ysuxF4'
    ],
    seats: 7,
    engine: '3.0L D-4D Turbo Diesel',
    pricePerDay: 150,
    description: 'The standard of premium transport across West Africa. The Prado offers a perfect blend of absolute off-road strength, bulletproof reliability, and luxury high-riding comfort for both Freetown and deep upcountry deployments.',
    detailedSpecs: {
      engineSize: '2982 cc Turbo Diesel',
      drivetrain: 'Constant 4WD with center differential lock',
      groundClearance: '215 mm',
      fuelCapacity: '150 Liters (Dual tanks)',
      bestFor: 'NGO & Corporate head of missions, upcountry VIP routes.'
    }
  },
  {
    id: 'toyota-lc200',
    name: 'Toyota Land Cruiser V8 (Series 200)',
    type: 'Heavy SUV',
    transmission: 'Automatic',
    fuel: 'Diesel',
    features: [
      'Twin-Turbo Diesel V8 powertrain',
      'Full Kinetic Dynamic Suspension System (KDSS)',
      'Pre-collision Safety Systems & 10 Airbags',
      'Intelligent Multi-Terrain Select & Crawl Control',
      'Ultra-premium leather upholstered interior',
      'Reenforced underbody bash plates'
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdHsybOomm21gTtq_PQn889DOcbgLJ2maLWiuypr3ssgLZsqNxO0gYKsCExEhsrN5edi-c3LnQCV9jjjYCiZU26A_gaKLX7Bw-7GP5zxJKeMElAoW13VIaHNkePiLQ7X_4-oFPauF0t8iX6QmnQHynEduxPpIaxTcMN0x_nCvArxH9sIm6DVrKAy6PtIUrIqSroAaZH6sye_0ZC3HvX3ctBT_KCt8MSj1auV0Wy7Hci1gU49loKgIIlM4jTdELNzuDhieV5YBeSSg',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCdHsybOomm21gTtq_PQn889DOcbgLJ2maLWiuypr3ssgLZsqNxO0gYKsCExEhsrN5edi-c3LnQCV9jjjYCiZU26A_gaKLX7Bw-7GP5zxJKeMElAoW13VIaHNkePiLQ7X_4-oFPauF0t8iX6QmnQHynEduxPpIaxTcMN0x_nCvArxH9sIm6DVrKAy6PtIUrIqSroAaZH6sye_0ZC3HvX3ctBT_KCt8MSj1auV0Wy7Hci1gU49loKgIIlM4jTdELNzuDhieV5YBeSSg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBk4Sy77sM_D51guPMkYxasFWbrfxVLb_Z9YrOeLBsMlbWv_OTouvHBm4yEzjostnK1FyIX8Mbai9GGCDM9KzQB1JT0H3mMrW9XRxRmo39JACgJ0jNGWsg7FTZLaxyKOfKFfBqfZP8cVzcqRigeSu4qXrQcPohxGFwTIJ8e3Wyr67m-gwNTFA_JUUWILtokkq6YVPL81x1gQLPwywsvnu-x_gBkuTY_PC63rqUyWpTk4K8dP3HPagtSlBIFetzC6oz-yXyRn4fKxj8'
    ],
    seats: 8,
    engine: '4.5L Twin-Turbo V8 Diesel',
    pricePerDay: 220,
    description: 'The ultimate symbol of rugged prestige and absolute mechanical security. Trusted by international diplomats, state dignitaries, and corporate executives as the absolute safest transport option for demanding Sierra Leonean environments.',
    detailedSpecs: {
      engineSize: '4461 cc Twin-Turbo V8',
      drivetrain: 'Full-Time 4WD with Torsen LSD & Lockable Diff',
      groundClearance: '230 mm',
      fuelCapacity: '138 Liters',
      bestFor: 'Diplomatic missions, high-profile dignitaries, severe offroad VIP routes.'
    }
  },
  {
    id: 'toyota-4runner',
    name: 'Toyota 4Runner SR5 Premium',
    type: 'Mid SUV',
    transmission: 'Automatic',
    fuel: 'Petrol',
    features: [
      '4.0L High-output V6 Engine',
      'Part-time 4WD system with Active Traction Control',
      'Premium SofTex heated power-adjustable seats',
      'Apple CarPlay & Android Auto integration',
      'Power sliding rear window for easy cargo access',
      'Reenforced coil-spring rear suspension'
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPBDsC6X_LxcHzoH67sNOy3HRZtjAaHYlzO7XiaJYzT_LFHaw2ZjP2w1Ud1Oqo7itK2te9DFm52qc2hyhZRigvBx4DXE-ipUvPK29JJkVyLc8L8rYeXFRPV-Ny9Dm7YKFfw8QqmY9wX6XJ4TyrS3ayICSgHCvEuuxfoqifvFYqPv54tED_ycELgCtSLdhIMNyEUoRlWe3Ff7TjvcHZuCQ-9Xvwk9QAKiRPHdh6OdhfrAkErz3fPI8nijwQ0unyrS0pcugThIIh9ws',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDPBDsC6X_LxcHzoH67sNOy3HRZtjAaHYlzO7XiaJYzT_LFHaw2ZjP2w1Ud1Oqo7itK2te9DFm52qc2hyhZRigvBx4DXE-ipUvPK29JJkVyLc8L8rYeXFRPV-Ny9Dm7YKFfw8QqmY9wX6XJ4TyrS3ayICSgHCvEuuxfoqifvFYqPv54tED_ycELgCtSLdhIMNyEUoRlWe3Ff7TjvcHZuCQ-9Xvwk9QAKiRPHdh6OdhfrAkErz3fPI8nijwQ0unyrS0pcugThIIh9ws',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGhWHMqkzzsD86ZD9UTyhBtP_UXJFJQ56euIqXyS3SRoVzsn2IjZI2QdIsIxhEBMvhcDc0kgYoeRvq39ZmDKBDXoFOqtjfs6UkHU1KjauwykvurqXFck_dbNdYsI4cMvcAIm2PVIbSDPpCh_FP2EFc4y1GzgotX62enq1INcI4YtxnfVEYH1JOq7d6LRVJRcT6hEc92i5e8SxB27ar21XP5yaUIPdHsMc14X4fpYLNlY0Ru7yhncAFqButiO4Nu_9unqvC_d6EleA'
    ],
    seats: 5,
    engine: '4.0L Dual VVT-i V6',
    pricePerDay: 130,
    description: 'A dynamic, legendary mid-size SUV that combines sporty styling with hard-core body-on-frame truck construction. Perfect for agile city navigation and secure provincial highway travel.',
    detailedSpecs: {
      engineSize: '3956 cc V6 Petrol',
      drivetrain: 'Multi-Mode Part-time 4WD with A-TRAC',
      groundClearance: '244 mm',
      fuelCapacity: '87 Liters',
      bestFor: 'Technical experts, independent business travelers, active field visits.'
    }
  },
  {
    id: 'toyota-hilux',
    name: 'Toyota Hilux Double Cabin 4x4',
    type: 'Truck',
    transmission: 'Manual',
    fuel: 'Diesel',
    features: [
      'Legendary D-4D diesel heavy torque',
      'Massive 1-ton cargo payload capacity',
      'Dual-range high/low gear transfer case',
      'A-TRAC active traction and rear diff lock',
      'Reenforced leaf-spring rear suspension',
      'Heavy duty snorkel for water wading'
    ],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJAJuwLKqmbCse-Nr7f2kMge-783BnAN83YrbCbBXXFQrYAmiS8gNRJE6LO38MhZ4HT7FLSAvK4p1lFYDTP8R7h01aKz2OMLo5TPSAWjtAGFHniLvoUXT8H-65iXd0WnnFFC9NBcRpAYn8OfD5ZiK6EDeQjRiE0OeYq7NEz3v9TyfDQLWYfnzw5bnBblcr2aAfRVqDMj2jMQAGU0wHTnKL4gua7OZoKq9J9OpAHaCf5BexXZQyIcKXTi3kpYvw-Z8HsP8-BEj8Xzw',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJAJuwLKqmbCse-Nr7f2kMge-783BnAN83YrbCbBXXFQrYAmiS8gNRJE6LO38MhZ4HT7FLSAvK4p1lFYDTP8R7h01aKz2OMLo5TPSAWjtAGFHniLvoUXT8H-65iXd0WnnFFC9NBcRpAYn8OfD5ZiK6EDeQjRiE0OeYq7NEz3v9TyfDQLWYfnzw5bnBblcr2aAfRVqDMj2jMQAGU0wHTnKL4gua7OZoKq9J9OpAHaCf5BexXZQyIcKXTi3kpYvw-Z8HsP8-BEj8Xzw'
    ],
    seats: 5,
    engine: '2.8L D4-D Turbo Diesel',
    pricePerDay: 110,
    description: 'The workhorse of global extreme logistics. Indestructible double-cabin design provides comfort for five engineers/personnel in the back while transporting heavy field equipment, fuel reserves, and supply gear seamlessly.',
    detailedSpecs: {
      engineSize: '2755 cc Turbo Diesel',
      drivetrain: 'Selectable 4WD with rear diff lock',
      groundClearance: '310 mm (raised suspension)',
      fuelCapacity: '80 Liters',
      bestFor: 'Field exploration, technical deliveries, construction engineering missions.'
    }
  }
];

export const CORE_SERVICES = [
  {
    id: 'vehicle-deployment',
    title: 'Vehicle Rental & Deployment',
    description: 'Rigorous 24/7 client-centric logistics, robust vehicle dispatch systems, and immediate dynamic dispatch to keep missions on track and moving forward.',
    highlights: ['24/7 dispatch desk', 'Spot-replacement guarantee', 'In-field deployment & support'],
    iconName: 'Car'
  },
  {
    id: 'chauffeurs',
    title: 'Professional Chauffeurs',
    description: 'Our driving force is honesty, service, and precision. Chauffeurs are defensive-driving trained, thoroughly vetted, first-aid certified, and fluent in regional routes.',
    highlights: ['Defensive driving certified', 'First-aid and safety trained', 'GPS & route optimization'],
    iconName: 'ShieldAlert'
  },
  {
    id: 'maintenance',
    title: 'Fleet Maintenance & Repair',
    description: 'Highly skilled mechanical diagnostics engineering coupled with strict programmatic scheduled maintenance intervals in our dedicated Freetown technical depot.',
    highlights: ['Scheduled diagnostic testing', 'Direct OEM parts inventory', 'In-house state-of-the-art facility'],
    iconName: 'Wrench'
  }
];

export const PARTNER_LOGOS = [
  { name: 'United Nations', label: 'UN Agencies' },
  { name: 'World Health Org', label: 'WHO' },
  { name: 'USAID', label: 'USAID' },
  { name: 'European Union', label: 'Delegation to SL' },
  { name: 'Red Cross', label: 'IFRC' },
  { name: 'World Bank', label: 'IBRD' }
];

export const VALUES = [
  {
    title: 'Vision',
    description: 'To remain Sierra Leone’s preeminent premium transport and logistics partner, setting standards of mechanical excellence and passenger safety.'
  },
  {
    title: 'Mission',
    description: 'To deliver absolute reliability and administrative integrity under intense operational environments, ensuring our clients fulfill their mandates.'
  },
  {
    title: 'Integrity',
    description: 'Every mile, every contract, every transaction is handled with maximum vertical honesty, transparent cost, and complete organizational accountability.'
  },
  {
    title: 'Leadership',
    description: 'Proactively leading the logistics space in Sierra Leone with certified defensive driver training, high-tech fleet management, and active corporate responsibility.'
  },
  {
    title: 'People First',
    description: 'Putting our drivers’ welfare and block safety first because the heartbeat of high-end logistics is the professional, motivated human behind the steering wheel.'
  }
];
