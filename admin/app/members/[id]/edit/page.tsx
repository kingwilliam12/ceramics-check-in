import { notFound } from 'next/navigation';
import MemberForm from '../../../../components/MemberForm';
import RoleGuard from '../../../../components/RoleGuard';
import { supabase } from '../../../../lib/supabase';

export default async function EditMember({ params }: { params: { id: string } }) {
  const { data: member } = await supabase.from('members').select('*').eq('id', params.id).single();
  if (!member) notFound();
  return (
    <RoleGuard requiredRole="admin">
      <h1>Edit Member</h1>
      <MemberForm member={member} onSaved={() => history.back()} />
    </RoleGuard>
  );
}
