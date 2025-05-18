import dynamic from 'next/dynamic';
const MembersTable = dynamic(() => import('../../components/MembersTable'), { ssr: false });
export default function MembersPage() {
  return <MembersTable />;
}
