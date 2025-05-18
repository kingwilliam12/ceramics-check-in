import dynamic from 'next/dynamic';
import RoleGuard from '../../components/RoleGuard';
import { supabase } from '../../lib/supabase';

const MembersList = dynamic(() => import('../../components/MembersList'), { ssr: false });

export default function MembersPage() {
  return (
    <RoleGuard requiredRole="admin">
      <MembersList />
    </RoleGuard>
  );
}
