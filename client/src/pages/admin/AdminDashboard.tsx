import { useEffect, useState } from 'react';
import { Banknote, Boxes, ClipboardList, Clock3 } from 'lucide-react';
import { adminApi } from './adminApi';

const labels: Record<string, string> = {
  pending: 'Pending',
  payment_confirmed: 'Payment confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { adminApi.get('/dashboard').then(({ data }) => setStats(data)); }, []);
  if (!stats) return <p className="text-gray-500">Loading overview...</p>;
  const cards = [
    { label: 'Total products', value: stats.totalProducts, icon: Boxes },
    { label: 'Total orders', value: stats.totalOrders, icon: ClipboardList },
    { label: 'Total revenue', value: `Rs. ${Number(stats.totalRevenue).toFixed(2)}`, icon: Banknote },
  ];
  return (
    <section>
      <div className="mb-8"><p className="text-secondary font-semibold text-sm">Overview</p><h2 className="text-4xl font-serif font-bold mt-1">The big picture</h2></div>
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {cards.map(({ label, value, icon: Icon }) => <div className="bg-white rounded-2xl p-6 border border-gray-100" key={label}><Icon className="text-secondary mb-5" size={22} /><p className="text-sm text-gray-500">{label}</p><p className="text-3xl font-bold mt-1">{value}</p></div>)}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-3xl">
        <div className="flex items-center gap-2 mb-6"><Clock3 size={19} className="text-secondary" /><h3 className="font-bold text-lg">Orders by status</h3></div>
        <div className="space-y-4">{Object.entries(labels).map(([key, label]) => <div key={key}><div className="flex justify-between text-sm mb-1"><span>{label}</span><strong>{stats.ordersByStatus[key] || 0}</strong></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${stats.totalOrders ? Math.min(100, (stats.ordersByStatus[key] || 0) / stats.totalOrders * 100) : 0}%` }} /></div></div>)}</div>
      </div>
    </section>
  );
}
