import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useState } from 'react';
import Seo from '../components/Seo';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data: ContactForm) => {
    try {
      setIsSubmitting(true);
      setSent(false);
      await axios.post('/api/contact', data);
      toast.success('Message sent successfully!');
      reset();
      setSent(true);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Seo
        title="Contact Palpali | Dhaka Textiles & Nepali Handicrafts"
        description="Contact Palpali for authentic Dhaka textiles, fabric bags, scarves, Nepali clothing and handcrafted products."
      />
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-serif font-bold mb-4">Contact Us</h1>
          <p className="text-xl">We'd love to hear from you. Get in touch with our team!</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-serif font-bold mb-8">Get In Touch</h2>

            <div className="space-y-6">
              {/* Address */}
              <div className="flex gap-4">
                <MapPin className="text-primary flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif font-bold mb-1">Address</h3>
                  <p className="text-gray-600">
                    123 Textile Lane<br />
                    Palpa, Nepal
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <Phone className="text-primary flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif font-bold mb-1">Phone</h3>
                  <p className="text-gray-600">+970 1XXXX XXX XX</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <Mail className="text-primary flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif font-bold mb-1">Email</h3>
                  <p className="text-gray-600">info@palpali.com</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <Clock className="text-primary flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-serif font-bold mb-1">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card p-8">
            <h2 className="text-2xl font-serif font-bold mb-6">Send us a Message</h2>

            {sent && <p className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">Thanks for reaching out. Your message has been sent successfully.</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="input-base"
                  type="text"
                />
                {errors.name && <span className="text-red-600 text-sm">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                  })}
                  className="input-base"
                  type="email"
                />
                {errors.email && <span className="text-red-600 text-sm">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Phone</label>
                <input
                  {...register('phone')}
                  className="input-base"
                  type="tel"
                />
                {errors.phone && <span className="text-red-600 text-sm">{errors.phone.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Subject</label>
                <input
                  {...register('subject', { required: 'Subject is required' })}
                  className="input-base"
                  type="text"
                />
                {errors.subject && <span className="text-red-600 text-sm">{errors.subject.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Message</label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  className="input-base min-h-32 resize-none"
                  rows={5}
                />
                {errors.message && <span className="text-red-600 text-sm">{errors.message.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
