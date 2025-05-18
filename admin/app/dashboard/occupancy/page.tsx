import dynamic from 'next/dynamic';
import RoleGuard from '../../../components/RoleGuard';

const OccupancyWidget = dynamic(() => import('../../../components/OccupancyWidget'), { ssr: false });

export default function OccupancyPage() {
  return (
    <RoleGuard requiredRole="admin">
      <h1>Current Occupancy</h1>
      <OccupancyWidget />
    </RoleGuard>
  );
}
