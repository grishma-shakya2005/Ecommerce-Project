import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from './adminApi';

type Product = { _id: string; name: string; category: string; price: number; description: string; stock: number; images: string[] };
const empty = { name: '', category: '', price: '', description: '', stock: '', image: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const load = () => adminApi.get('/products').then(({ data }) => { setProducts(data.products); setCategories(data.categories); });
  useEffect(() => { load().catch(() => toast.error('Could not load products')); }, []);
  const update = (key: string, value: string) => setForm((current: any) => ({ ...current, [key]: value }));
  const openForm = (product?: Product) => { setEditing(product || null); setForm(product ? { ...product, image: product.images?.[0] || '' } : empty); setOpen(true); };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), images: [form.image].filter(Boolean) };
      if (editing) await adminApi.patch(`/products/${editing._id}`, payload);
      else await adminApi.post('/products', payload);
      toast.success(editing ? 'Product updated' : 'Product added');
      setOpen(false); await load();
    } catch (error: any) { toast.error(error.response?.data?.error || 'Could not save product'); }
  };
  const remove = async (id: string) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try { await adminApi.delete(`/products/${id}`); toast.success('Product deleted'); await load(); } catch { toast.error('Could not delete product'); }
  };
  return <section>
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8"><div><p className="text-secondary font-semibold text-sm">Catalog</p><h2 className="text-4xl font-serif font-bold mt-1">Products</h2></div><button onClick={() => openForm()} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add product</button></div>
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500"><tr><th className="p-4">Product</th><th>Category</th><th>Price</th><th>Stock</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{products.map((product) => <tr key={product._id}><td className="p-4 flex items-center gap-3 min-w-[260px]"><img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" /><span className="font-semibold">{product.name}</span></td><td className="text-gray-500">{product.category}</td><td>Rs. {product.price.toFixed(2)}</td><td><span className={product.stock < 5 ? 'text-red-600 font-semibold' : ''}>{product.stock}</span></td><td className="p-4"><div className="flex justify-end gap-2"><button onClick={() => openForm(product)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Edit product"><Pencil size={17} /></button><button onClick={() => remove(product._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" aria-label="Delete product"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div></div>
    {open && <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center"><form onSubmit={save} className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-serif font-bold">{editing ? 'Edit product' : 'Add product'}</h3><button type="button" onClick={() => setOpen(false)}><X /></button></div><div className="space-y-4"><label className="block text-sm font-semibold">Name<input className="input-base mt-1" value={form.name} onChange={e => update('name', e.target.value)} required /></label><label className="block text-sm font-semibold">Category<select className="input-base mt-1" value={form.category} onChange={e => update('category', e.target.value)} required><option value="">Select category</option>{categories.map(c => <option key={c}>{c}</option>)}<option value="New">New category</option></select></label>{form.category === 'New' && <label className="block text-sm font-semibold">New category<input className="input-base mt-1" onChange={e => update('category', e.target.value)} required /></label>}<div className="grid grid-cols-2 gap-4"><label className="block text-sm font-semibold">Price<input type="number" min="0" step="0.01" className="input-base mt-1" value={form.price} onChange={e => update('price', e.target.value)} required /></label><label className="block text-sm font-semibold">Stock<input type="number" min="0" className="input-base mt-1" value={form.stock} onChange={e => update('stock', e.target.value)} required /></label></div><label className="block text-sm font-semibold">Image URL or path<input className="input-base mt-1" value={form.image} onChange={e => update('image', e.target.value)} placeholder="/images/products/item.jpg" /></label><label className="block text-sm font-semibold">Description<textarea className="input-base mt-1 min-h-24" value={form.description} onChange={e => update('description', e.target.value)} required /></label></div><button className="btn-primary w-full mt-6">{editing ? 'Save changes' : 'Add product'}</button></form></div>}
  </section>;
}
