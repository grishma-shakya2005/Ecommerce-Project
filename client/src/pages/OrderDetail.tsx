import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const statuses = ['pending', 'payment_confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const loadOrder = () => axios.get(`/api/orders/${id}`).then(({ data }) => setOrder(data));
  useEffect(() => { loadOrder().catch(() => setError('Could not load order.')); }, [id]);

  const advance = async () => {
    const next = statuses[statuses.indexOf(order.status) + 1];
    if (!next) return;
    try {
      const { data } = await axios.patch(`/api/orders/${id}/status`, { status: next });
      setOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not advance order.');
    }
  };

  if (!order) return <div className="max-w-3xl mx-auto px-4 py-16">{error || 'Loading order...'}</div>;
  const next = statuses[statuses.indexOf(order.status) + 1];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-serif font-bold mb-2">Order {order.orderNumber}</h1>
      <p className="text-gray-600 mb-8">Control for advancing the order lifecycle.</p>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="card p-6">
        <p className="mb-6">Current status: <strong className="text-primary capitalize">{order.status.replace(/_/g, ' ')}</strong></p>
        <div className="flex flex-wrap gap-2 mb-8">
          {statuses.map((status) => (
            <span key={status} className={`px-3 py-1 rounded-full text-sm ${status === order.status ? 'bg-primary text-white' : 'bg-gray-100'}`}>
              {status.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
        <button className="btn-primary" onClick={advance} disabled={!next}>
          {next ? `Advance to ${next.replace(/_/g, ' ')}` : 'Order lifecycle complete'}
        </button>
      </div>
    </div>
  );
}
