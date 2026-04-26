import { Metadata } from 'next';

import { Dashboard } from './dashboard';

export const metadata: Metadata = {
  title: 'Parthenon | Dashboard',
  description:
    'View your profile and track your progress from your personal dashboard.',
};

const DashboardPage = () => <Dashboard />;
export default DashboardPage;
