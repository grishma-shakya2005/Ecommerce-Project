import { FormEvent, useState } from 'react';
import { LockKeyhole, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from './adminApi';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await adminApi.post('/auth/login', { username, password });
      localStorage.setItem('palpali_admin_token', data.token);
      navigate('/admin', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#211810] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mb-6">
          <LockKeyhole size={24} />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-secondary font-bold">Palpali Dhaka</p>
        <h1 className="text-3xl font-serif font-bold text-gray-900 mt-2">Owner sign in</h1>
        <p className="text-gray-500 mt-2 mb-8">Manage your shop, orders, and customer updates.</p>
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm font-semibold text-gray-700">
            Admin username
            <input className="input-base mt-2" value={username} onChange={(event) => setUsername(event.target.value)} required />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Password
            <input type="password" className="input-base mt-2" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? 'Signing in...' : 'Enter dashboard'} <ArrowRight size={18} />
          </button>
        </form>
        <a href="/" className="block text-center text-sm text-gray-500 hover:text-primary mt-6">Return to storefront</a>
      </div>
    </div>
  );
}
