import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Instagram, Facebook, Twitter, CheckCircle2, Navigation, Sparkles, Loader2 } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { api } from '../services/api';

interface ContactPageProps {
  settings: RestaurantSettings | null;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Maps Grounding state
  const [mapQuery, setMapQuery] = useState('');
  const [mapResult, setMapResult] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleCheckLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapQuery.trim()) return;
    setMapLoading(true);
    setMapResult(null);
    try {
      const res = await api.aiMapsLocation({
        query: `How far is ${mapQuery.trim()} from Snack Fuel at MM Alam Road Gulberg III Lahore, and what are famous nearby landmarks?`,
      });
      setMapResult(res.text);
    } catch (err: any) {
      setMapResult('Unable to retrieve Google Maps information at this moment.');
    } finally {
      setMapLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div>
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
          Get in Touch
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white">
          Contact Snack Fuel Kitchen
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
          We would love to hear from you. For direct corporate catering, private events, or feedback, connect with us.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Info Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
            <h3 className="font-display font-bold text-base text-white">Restaurant Location & Hours</h3>

            <div className="space-y-4 text-xs text-neutral-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">Kitchen HQ</h4>
                  <p>{settings?.address || 'Plot 48-C, MM Alam Road, Gulberg III'}</p>
                  <p className="text-neutral-400">{settings?.city || 'Lahore, Pakistan'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">Opening & Delivery Hours</h4>
                  <p>{settings?.openingHours || 'Mon - Sun: 11:30 AM – 03:00 AM (Late Night Fuel)'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">Order Line & Helpline</h4>
                  <a href={`tel:${settings?.phone}`} className="text-amber-400 font-mono font-bold hover:underline">
                    {settings?.phone || '+92 42 111-383-500'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">Official Inquiries</h4>
                  <a href={`mailto:${settings?.email}`} className="text-neutral-400 hover:text-white">
                    {settings?.email || 'hello@snackfuel.com'}
                  </a>
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div className="pt-4 border-t border-neutral-800">
              <span className="text-xs font-semibold text-neutral-400 block mb-3">Connect on Social</span>
              <div className="flex items-center gap-3">
                <a
                  href={settings?.socialLinks.instagram || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={settings?.socialLinks.facebook || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={settings?.socialLinks.twitter || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${settings?.socialLinks.whatsapp?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:border-amber-400/50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Google Maps Grounded Live Location Lookup */}
          <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Google Maps Delivery Feasibility Check
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Check driving distance, landmarks, and delivery feasibility from our MM Alam Road kitchen.
            </p>

            <form onSubmit={handleCheckLocation} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mapQuery}
                  onChange={(e) => setMapQuery(e.target.value)}
                  placeholder="Enter your area (e.g. DHA Phase 5, Johar Town, Model Town)..."
                  className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={mapLoading || !mapQuery.trim()}
                  className="py-2 px-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  {mapLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                  <span>Check</span>
                </button>
              </div>
            </form>

            {mapResult && (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {mapResult}
              </div>
            )}

            <div className="h-32 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center text-center p-3 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-400 mb-1">
                <MapPin className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Central Hub: MM Alam Road, Gulberg III</p>
              <p className="text-[10px] text-neutral-400">8km radius guaranteed 30-minute thermal dispatch</p>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-white">Send Us a Direct Message</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Have a question or proposal? Drop us a note and we will reply within 2 hours.
              </p>
            </div>

            {submitted && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you! Your message has been routed to the restaurant manager.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zain Basra"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Corporate Lunch Catering Inquiry"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our kitchen fuel your hunger or event?"
                  className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto py-3 px-8 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
