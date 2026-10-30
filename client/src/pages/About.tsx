import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import Seo from '../components/Seo';

const placeholder = 'https://placehold.co/900x700/e8e0d5/76543a?text=Palpali+Dhaka';

export default function About() {
  const [content, setContent] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/about').then(({ data }) => setContent(data)).catch((error) => console.error('Failed to load About content:', error));
  }, []);

  if (!content) return <div className="max-w-7xl mx-auto px-4 py-20 text-gray-500">Loading our story...</div>;
  const visibleTeam = [...(content.team || [])].filter((member) => member.visible).sort((a, b) => a.order - b.order);
  const visibleFaqs = [...(content.faqs || [])].filter((faq) => faq.visible).sort((a, b) => a.order - b.order);

  return (
    <div>
      <Seo
        title="About Palpali | Dhaka Textiles & Nepali Craftsmanship"
        description="Learn about Palpali's tradition of authentic Dhaka textiles, Nepali handicrafts and handcrafted clothing."
      />
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{content.heroTitle}</h1>
          <p className="text-lg md:text-xl max-w-3xl">{content.heroSubtitle}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-6">{content.storyHeading}</h2>
            {(content.storyParagraphs || []).map((paragraph: string) => <p className="text-gray-700 mb-4 leading-relaxed" key={paragraph}>{paragraph}</p>)}
          </div>
          <img src={content.storyImage || placeholder} onError={(event) => { event.currentTarget.src = placeholder; }} alt="Palpali Dhaka weaving" className="w-full h-96 object-cover rounded-2xl shadow-md bg-gray-100" />
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold mb-12 text-center">Our Mission & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(content.values || []).map((value: any) => <div className="card p-6" key={value.title}><h3 className="font-serif font-bold text-xl mb-3">{value.title}</h3><p className="text-gray-700">{value.text}</p></div>)}
          </div>
        </div>
      </section>

      {visibleTeam.length > 0 && <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-serif font-bold mb-12 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {visibleTeam.map((member: any) => <div key={member._id} className="text-center"><img src={member.photo || placeholder} onError={(event) => { event.currentTarget.src = placeholder; }} alt={member.name} className="w-full h-48 object-cover rounded-2xl mb-4 bg-gray-100" /><h3 className="font-serif font-bold text-lg">{member.name}</h3><p className="text-secondary">{member.role}</p>{member.bio && <p className="text-gray-600 text-sm mt-2">{member.bio}</p>}</div>)}
        </div>
      </section>}

      {visibleFaqs.length > 0 && <section className="bg-[#faf8f4] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-serif font-bold mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">{visibleFaqs.map((faq: any) => <div className="bg-white rounded-xl border border-gray-200" key={faq._id}><button className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold" onClick={() => setOpenFaq(openFaq === faq._id ? null : faq._id)}>{faq.question}<ChevronDown size={19} className={`shrink-0 transition-transform ${openFaq === faq._id ? 'rotate-180 text-secondary' : ''}`} /></button>{openFaq === faq._id && <p className="px-5 pb-5 text-gray-700 leading-relaxed">{faq.answer}</p>}</div>)}</div>
        </div>
      </section>}
    </div>
  );
}
