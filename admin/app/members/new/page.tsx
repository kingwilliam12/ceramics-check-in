import MemberForm from '../../../components/MemberForm';
import RoleGuard from '../../../components/RoleGuard';

export default function NewMemberPage() {
  return (
    <RoleGuard requiredRole="admin">
      <h1>New Member</h1>
      <MemberForm onSaved={() => history.back()} />
    </RoleGuard>
  );
}
