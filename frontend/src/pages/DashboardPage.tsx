import { useAppSelector } from '@/app/hooks';
import ClientDashboard from '@/features/dashboard/ClientDashboard';
import ProviderDashboard from '@/features/dashboard/ProviderDashboard';
import AdminDashboard from '@/features/dashboard/AdminDashboard';

export default function DashboardPage() {
  const roles = useAppSelector((s) => s.auth.user?.roles ?? []);

  if (roles.includes('ADMIN')) return <AdminDashboard />;
  if (roles.includes('PROVIDER')) return <ProviderDashboard />;
  return <ClientDashboard />;
}
