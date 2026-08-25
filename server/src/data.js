// Static support team definitions and the in-memory ticket store (used when DB is off).
// Each team has the ticket categories it handles so the routing logic can match them.

export const supportTeams = [
  {
    id: 'service-desk',
    name: 'Service Desk',
    specialty: 'Access and account support',
    categories: ['Access Request', 'Technical Issue'],
    available: 4,
    capacity: 6,
    responseTime: '12 min',
  },
  {
    id: 'workplace-tech',
    name: 'Workplace Technology',
    specialty: 'Hardware and office equipment',
    categories: ['Hardware'],
    available: 2,
    capacity: 4,
    responseTime: '28 min',
  },
  {
    id: 'applications',
    name: 'Business Applications',
    specialty: 'Software and internal tools',
    categories: ['Software'],
    available: 3,
    capacity: 5,
    responseTime: '18 min',
  },
  {
    id: 'network-ops',
    name: 'Network Operations',
    specialty: 'VPN, Wi-Fi, and connectivity',
    categories: ['Network'],
    available: 1,
    capacity: 3,
    responseTime: '35 min',
  },
];

// Mutable in-memory ticket list — only used when DATABASE_URL is not set.
export let tickets = [
  {
    id: 'HD-1001',
    title: 'VPN access needed',
    description: 'Requesting VPN access.',
    category: 'Access Request',
    priority: 'High',
    status: 'Open',
    supportTeam: 'Service Desk',
    assignee: 'Aarav Mehta',
    createdAt: '20 Aug 2026',
  },
  {
    id: 'HD-1002',
    title: 'Laptop microphone not working',
    description: 'Microphone is not detected.',
    category: 'Hardware',
    priority: 'Medium',
    status: 'In Progress',
    supportTeam: 'Workplace Technology',
    assignee: 'Maya Singh',
    createdAt: '20 Aug 2026',
  },
];

export function setTickets(newTickets) {
  tickets = newTickets;
}
