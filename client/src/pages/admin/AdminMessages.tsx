import { useEffect, useState } from 'react';
import { Mail, Phone, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from './adminApi';

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    adminApi.get('/messages')
      .then(({ data }) => setMessages(data))
      .catch(() => toast.error('Could not load messages'));
  }, []);

  return (
    <section>
      <div className="mb-8">
        <p className="text-secondary font-semibold text-sm">Customer contact</p>
        <h2 className="text-4xl font-serif font-bold mt-1">Messages</h2>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {messages.length === 0 && <p className="p-8 text-gray-500">No contact messages yet.</p>}
        <div className="divide-y divide-gray-100">
          {messages.map((message) => (
            <button
              type="button"
              key={message._id}
              onClick={() => setSelected(message)}
              className="w-full text-left p-5 hover:bg-[#faf8f4] transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{message.name}</p>
                  <p className="text-sm text-gray-500">{message.email}</p>
                </div>
                <p className="text-xs text-gray-400">{new Date(message.createdAt).toLocaleString()}</p>
              </div>
              <p className="font-medium text-primary mt-3">{message.subject}</p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.message}</p>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-secondary font-semibold">Contact message</p>
                <h3 className="text-2xl font-serif font-bold mt-1">{selected.subject}</h3>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close message"><X /></button>
            </div>
            <div className="space-y-3 text-sm border-b border-gray-100 pb-5">
              <p className="flex items-center gap-2"><strong>{selected.name}</strong></p>
              <p className="flex items-center gap-2 text-gray-600"><Mail size={16} /> {selected.email}</p>
              {selected.phone && <p className="flex items-center gap-2 text-gray-600"><Phone size={16} /> {selected.phone}</p>}
              <p className="text-xs text-gray-400">{new Date(selected.createdAt).toLocaleString()}</p>
            </div>
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed pt-5">{selected.message}</p>
          </div>
        </div>
      )}
    </section>
  );
}
