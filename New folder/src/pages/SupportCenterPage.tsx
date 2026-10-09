import React, { useState, useEffect } from 'react';
import { Headphones, Plus, MessageSquare, ChevronDown, ChevronUp, Send, CheckCircle2, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { SupportTicket } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SupportCenterPage: React.FC = () => {
  const { user, quickSwitch } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  // New ticket form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<any>('order_problem');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const fetchTickets = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getSupportTickets();
      setTickets(data);
      if (activeTicket) {
        const refreshed = data.find((t) => t.id === activeTicket.id);
        if (refreshed) setActiveTicket(refreshed);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setFormError('Please enter a ticket subject and message');
      return;
    }

    try {
      const created = await api.createSupportTicket({
        subject: subject.trim(),
        category,
        orderId: orderId.trim() || undefined,
        message: message.trim(),
      });
      setIsCreatingTicket(false);
      setSubject('');
      setMessage('');
      setOrderId('');
      setTickets((prev) => [created, ...prev]);
      setActiveTicket(created);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit ticket');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    try {
      const updated = await api.replySupportTicket(activeTicket.id, replyText.trim());
      setActiveTicket(updated);
      setReplyText('');
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    }
  };

  const faqs = [
    {
      q: 'How long does delivery usually take?',
      a: 'Our target delivery time is 25 to 35 minutes. All smash burgers and fried chicken are prepared fresh upon order placement and sent in insulated thermal bags with our dedicated fleet.',
    },
    {
      q: 'What if an item is missing or incorrect in my order?',
      a: 'We sincerely apologize! Simply open a support ticket under "Missing Item" or "Wrong Item" with your Order ID. Our support team will either dispatch a replacement rider immediately or issue an instant discount credit.',
    },
    {
      q: 'Which payment methods do you accept?',
      a: 'We accept Cash on Delivery (COD), Credit/Debit Cards (Visa & MasterCard), EasyPaisa, JazzCash, and direct online bank transfers.',
    },
    {
      q: 'Can I customize my food (e.g. less spicy or extra cheese)?',
      a: 'Yes! When viewing any burger, pizza, or loaded fries, you can customize portion sizes, select gourmet add-ons, and add kitchen instructions like "less spicy" or "no onions".',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            24/7 Dedicated Assistance
          </span>
          <h1 className="font-display text-3xl font-black text-white">
            Customer Support Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Have an issue with your meal, payment, or delivery? Our live support agents are here to resolve it rapidly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCreatingTicket(!isCreatingTicket)}
            className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Open Support Ticket</span>
          </button>
          {user?.role === 'support' || user?.role === 'admin' ? (
            <button
              onClick={() => quickSwitch('customer')}
              className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 rounded-xl"
            >
              Switch to Customer View
            </button>
          ) : (
            <button
              onClick={() => quickSwitch('support')}
              className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-amber-400 rounded-xl"
            >
              Agent Desk Demo
            </button>
          )}
        </div>
      </div>

      {/* Ticket Creator Drawer / Modal */}
      {isCreatingTicket && (
        <div className="p-6 md:p-8 rounded-3xl bg-neutral-900 border border-amber-400/40 animate-fadeIn space-y-4">
          <h2 className="font-display text-xl font-bold text-white">Create New Support Ticket</h2>
          {formError && (
            <div className="p-3 text-xs bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Missing fire dip sauce in order SF-1042"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Related Order ID
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  placeholder="e.g. SF-1042"
                  className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                <option value="missing_item">Missing Item</option>
                <option value="wrong_item">Wrong Item Delivered</option>
                <option value="delivery">Delivery Delay / Rider Problem</option>
                <option value="refund">Refund Request</option>
                <option value="payment">Payment Issue</option>
                <option value="order_problem">General Food Quality Complaint</option>
                <option value="general">Other Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain the issue clearly so our support team can verify the packaging logs..."
                className="w-full p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingTicket(false)}
                className="py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-xl shadow-md"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer Tickets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-display text-lg font-bold text-white">Your Support Tickets</h2>

          {!user ? (
            <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
              Please sign in to view and track your submitted support tickets.
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-500">
              No tickets found. Have an issue? Click "Open Support Ticket" above.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => {
                const isSelected = activeTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTicket(t)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neutral-850 border-amber-400 shadow-md shadow-amber-400/10'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-amber-400">#{t.id}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          t.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : t.status === 'in_progress'
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{t.subject}</h3>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                      {t.messages[t.messages.length - 1]?.text}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500">
                      <span>Category: {t.category}</span>
                      <span>{t.messages.length} messages</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Ticket Conversation (7 cols) */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col h-[580px] overflow-hidden">
              {/* Ticket header */}
              <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      #{activeTicket.id}
                    </span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded uppercase font-semibold">
                      {activeTicket.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{activeTicket.subject}</h3>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    activeTicket.status === 'resolved'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-400/20 text-amber-300'
                  }`}
                >
                  {activeTicket.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Message thread */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-900/50">
                {activeTicket.messages.map((m) => {
                  const isAgent = m.senderRole === 'support';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                    >
                      <span className="text-[10px] text-neutral-500 mb-1 px-1">
                        {m.senderName} ·{' '}
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                          isAgent
                            ? 'bg-neutral-800 border border-neutral-700/60 text-neutral-100 rounded-tl-none'
                            : 'bg-amber-400 text-neutral-950 font-medium rounded-tr-none'
                        }`}
                      >
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply box */}
              <form
                onSubmit={handleSendReply}
                className="p-3 bg-neutral-950 border-t border-neutral-800 flex gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type reply to support agent..."
                  className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-bold disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center text-neutral-500">
              <Headphones className="w-12 h-12 text-amber-400/40 mb-3" />
              <h3 className="font-bold text-white text-base">Select a ticket to view conversation</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                Click any ticket on the left or create a new support ticket to chat with an agent.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="pt-6">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            Instant Answers
          </span>
          <h2 className="font-display text-2xl font-black text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/60 bg-neutral-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
