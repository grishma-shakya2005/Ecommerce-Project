import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from './adminApi';

const emptyTeam = { name: '', role: '', bio: '', photo: '', visible: true, order: 0 };
const emptyFaq = { question: '', answer: '', visible: true, order: 0 };
const fallback = 'https://placehold.co/320x220/e8e0d5/76543a?text=Preview';

export default function AdminAbout() {
  const [content, setContent] = useState<any>(null);
  const [teamForm, setTeamForm] = useState<any>(emptyTeam);
  const [faqForm, setFaqForm] = useState<any>(emptyFaq);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const path = useLocation().pathname;
  const mode = path.endsWith('/team') ? 'team' : path.endsWith('/faq') ? 'faq' : 'about';

  const load = () => adminApi.get('/about').then(({ data }) => setContent(data));
  useEffect(() => { load().catch(() => toast.error('Could not load About content')); }, []);
  const saveAbout = async (event: FormEvent) => {
    event.preventDefault();
    try { await adminApi.patch('/about', content); toast.success('About content saved'); await load(); } catch { toast.error('Could not save About content'); }
  };
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>, onDone: (path: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Use JPG, PNG, or WEBP only');
    if (file.size > 2 * 1024 * 1024) return toast.error('Images must be 2 MB or smaller');
    const data = new FormData(); data.append('image', file);
    try { const { data: result } = await adminApi.post('/about/images', data); onDone(result.path); toast.success('Image uploaded'); } catch (error: any) { toast.error(error.response?.data?.error || 'Upload failed'); }
  };
  const saveItem = async (kind: 'team' | 'faq') => {
    const value = kind === 'team' ? teamForm : faqForm;
    if (kind === 'team' && (!value.name.trim() || !value.role.trim())) return toast.error('Name and role are required');
    if (kind === 'faq' && (!value.question.trim() || !value.answer.trim())) return toast.error('Question and answer are required');
    try {
      if (kind === 'team') editingTeam ? await adminApi.patch(`/about/team/${editingTeam._id}`, value) : await adminApi.post('/about/team', value);
      else editingFaq ? await adminApi.patch(`/about/faq/${editingFaq._id}`, value) : await adminApi.post('/about/faq', value);
      toast.success(`${kind === 'team' ? 'Team member' : 'FAQ'} saved`);
      kind === 'team' ? setTeamForm(emptyTeam) : setFaqForm(emptyFaq);
      kind === 'team' ? setEditingTeam(null) : setEditingFaq(null);
      await load();
    } catch { toast.error('Could not save changes'); }
  };
  const remove = async (kind: 'team' | 'faq', id: string) => {
    if (!window.confirm(`Delete this ${kind === 'team' ? 'team member' : 'FAQ'}?`)) return;
    try { await adminApi.delete(`/about/${kind}/${id}`); toast.success('Deleted'); await load(); } catch { toast.error('Could not delete'); }
  };
  const toggle = async (kind: 'team' | 'faq', item: any) => {
    try { await adminApi.patch(`/about/${kind}/${item._id}`, { visible: !item.visible }); await load(); } catch { toast.error('Could not update visibility'); }
  };
  const reorder = async (kind: 'team' | 'faq', item: any, direction: -1 | 1) => {
    const ordered = [...(kind === 'team' ? content.team : content.faqs)].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((entry) => entry._id === item._id);
    const target = ordered[index + direction];
    if (!target) return;
    try {
      await Promise.all([
        adminApi.patch(`/about/${kind}/${item._id}`, { order: target.order }),
        adminApi.patch(`/about/${kind}/${target._id}`, { order: item.order }),
      ]);
      await load();
    } catch {
      toast.error('Could not reorder');
    }
  };
  if (!content) return <p className="text-gray-500">Loading content...</p>;
  if (mode === 'about') return <section><div className="mb-8"><p className="text-secondary font-semibold text-sm">Content management</p><h2 className="text-4xl font-serif font-bold mt-1">About page</h2></div><form onSubmit={saveAbout} className="space-y-6 max-w-4xl"><div className="bg-white rounded-2xl border border-gray-100 p-6 grid gap-4"><label className="font-semibold">Hero title<input className="input-base mt-1" value={content.heroTitle} onChange={e => setContent({ ...content, heroTitle: e.target.value })} required /></label><label className="font-semibold">Hero subtitle<textarea className="input-base mt-1" value={content.heroSubtitle} onChange={e => setContent({ ...content, heroSubtitle: e.target.value })} required /></label><label className="font-semibold">Story heading<input className="input-base mt-1" value={content.storyHeading} onChange={e => setContent({ ...content, storyHeading: e.target.value })} required /></label><label className="font-semibold">Story image<input type="file" accept=".jpg,.jpeg,.png,.webp" className="input-base mt-1" onChange={e => uploadImage(e, path => setContent({ ...content, storyImage: path }))} /><img src={content.storyImage || fallback} onError={e => { e.currentTarget.src = fallback; }} className="mt-2 w-48 h-28 object-cover rounded-lg" alt="Story preview" /></label><div><p className="font-semibold mb-2">Story paragraphs</p>{content.storyParagraphs.map((text: string, index: number) => <div className="flex gap-2 mb-2" key={index}><textarea className="input-base" value={text} onChange={e => { const paragraphs = [...content.storyParagraphs]; paragraphs[index] = e.target.value; setContent({ ...content, storyParagraphs: paragraphs }); }} required /><button type="button" className="text-red-600" onClick={() => setContent({ ...content, storyParagraphs: content.storyParagraphs.filter((_: string, i: number) => i !== index) })}><Trash2 size={18} /></button></div>)}<button type="button" className="btn-outline text-sm" onClick={() => setContent({ ...content, storyParagraphs: [...content.storyParagraphs, ''] })}><Plus size={16} className="inline mr-1" /> Add paragraph</button></div></div><div className="bg-white rounded-2xl border border-gray-100 p-6"><h3 className="font-serif font-bold text-xl mb-4">Mission & Values</h3>{content.values.map((value: any, index: number) => <div className="grid md:grid-cols-[1fr_2fr_auto] gap-3 mb-3 items-start" key={index}><input className="input-base" value={value.title} onChange={e => { const values = [...content.values]; values[index] = { ...value, title: e.target.value }; setContent({ ...content, values }); }} required /><input className="input-base" value={value.text} onChange={e => { const values = [...content.values]; values[index] = { ...value, text: e.target.value }; setContent({ ...content, values }); }} required /><button type="button" className="text-red-600 p-2" onClick={() => setContent({ ...content, values: content.values.filter((_: any, i: number) => i !== index) })}><Trash2 size={18} /></button></div>)}<button type="button" className="btn-outline text-sm" onClick={() => setContent({ ...content, values: [...content.values, { title: '', text: '' }] })}><Plus size={16} className="inline mr-1" /> Add value</button></div><button className="btn-primary">Save About page</button></form></section>;
  const isTeam = mode === 'team';
  const items = isTeam ? content.team : content.faqs;
  const form = isTeam ? teamForm : faqForm;
  const setForm = isTeam ? setTeamForm : setFaqForm;
  return <section><div className="flex items-end justify-between mb-8"><div><p className="text-secondary font-semibold text-sm">Content management</p><h2 className="text-4xl font-serif font-bold mt-1">{isTeam ? 'Team members' : 'FAQs'}</h2></div></div><div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8"><h3 className="font-serif font-bold text-xl mb-4">{(isTeam ? editingTeam : editingFaq) ? 'Edit' : 'Add'} {isTeam ? 'team member' : 'FAQ'}</h3><div className="grid gap-4">{isTeam ? <><input className="input-base" placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /><input className="input-base" placeholder="Role *" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /><textarea className="input-base" placeholder="Short bio" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /><label className="text-sm font-semibold">Photo<input type="file" accept=".jpg,.jpeg,.png,.webp" className="input-base mt-1" onChange={e => uploadImage(e, photo => setForm({ ...form, photo }))} /><img src={form.photo || fallback} onError={e => { e.currentTarget.src = fallback; }} className="mt-2 w-40 h-24 object-cover rounded-lg" alt="Team preview" /></label></> : <><input className="input-base" placeholder="Question *" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} /><textarea className="input-base min-h-28" placeholder="Answer *" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} /></>}<div className="flex gap-3"><button type="button" className="btn-primary" onClick={() => saveItem(isTeam ? 'team' : 'faq')}>{(isTeam ? editingTeam : editingFaq) ? 'Save changes' : 'Add'}</button>{(isTeam ? editingTeam : editingFaq) && <button type="button" className="btn-outline" onClick={() => { isTeam ? setEditingTeam(null) : setEditingFaq(null); isTeam ? setTeamForm(emptyTeam) : setFaqForm(emptyFaq); }}>Cancel</button>}</div></div></div><div className="space-y-3">{items.sort((a: any, b: any) => a.order - b.order).map((item: any, index: number) => <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-4" key={item._id}>{isTeam && <img src={item.photo || fallback} onError={e => { e.currentTarget.src = fallback; }} className="w-20 h-16 object-cover rounded-lg" alt={item.name} />}<div className="flex-1 min-w-0"><p className="font-bold">{isTeam ? item.name : item.question}</p><p className="text-sm text-secondary">{isTeam ? item.role : item.answer}</p>{isTeam && item.bio && <p className="text-sm text-gray-500 mt-1">{item.bio}</p>}</div><div className="flex items-center gap-1"><button onClick={() => reorder(isTeam ? 'team' : 'faq', item, -1)} disabled={index === 0} className="p-1 text-gray-500 disabled:opacity-30" aria-label="Move up"><ChevronUp size={17} /></button><button onClick={() => reorder(isTeam ? 'team' : 'faq', item, 1)} disabled={index === items.length - 1} className="p-1 text-gray-500 disabled:opacity-30" aria-label="Move down"><ChevronDown size={17} /></button></div><button onClick={() => toggle(isTeam ? 'team' : 'faq', item)} className="text-gray-500" aria-label="Toggle visibility">{item.visible ? <Eye size={18} /> : <EyeOff size={18} />}</button><button onClick={() => { isTeam ? (setEditingTeam(item), setTeamForm(item)) : (setEditingFaq(item), setFaqForm(item)); }} className="text-gray-500" aria-label="Edit"><Pencil size={18} /></button><button onClick={() => remove(isTeam ? 'team' : 'faq', item._id)} className="text-red-600" aria-label="Delete"><Trash2 size={18} /></button></div>)}</div></section>;
}
