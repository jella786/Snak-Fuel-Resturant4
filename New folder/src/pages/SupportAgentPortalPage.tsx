import React, { useState, useEffect } from 'react';
import { Headphones, Search, Send, CheckCircle, Clock, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { SupportTicket, Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SupportAgentPortalPage: React.FC = () => {
  const { user, quickSwitch } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [relatedOrder, setRelatedOrder] = useState<Order | null>(null);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const data = await api.getSupportTickets();
      setTickets(data);
      if (activeTicket) {
        const found = data.find((t) => t.id === activeTicket.id);
        if (found) setActiveTicket(found);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (activeTicket?.orderId) {
      api.getOrder(activeTicket.orderId)
        .then(setRelatedOrder)
        .catch(() => setRelatedOrder(null));
    } else {
      setRelatedOrder(null);
    }
  }, [activeTicket?.orderId]);

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

  const handleStatusChange = async (newStatus: string) => {
    if (!activeTicket) return;
    try {
      const updated = await api.updateTicketStatus(activeTicket.id, newStatus);
      setActiveTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err: any) {
      alert(err.message || 'Failed to change ticket status');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        (t.orderId && t.orderId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (user?.role !== 'support' && user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
          <Headphones className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Support Agent Desk</h2>
        <p className="text-xs text-neutral-400">
          This portal is reserved for authorized customer service personnel.
        </p>
        <button
          onClick={() => quickSwitch('support')}
          className="py-3 px-6 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20"
        >
          1-Click Switch to Support Agent Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-neutral-950">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-white">Agent Desk: Sara Khan</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                QUEUE LIVE
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Total Tickets: {tickets.length} · Pending Resolution:{' '}
              {tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length}
            </p>
          </div>
        </div>

        <button
          onClick={fetchTickets}
          className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Agent Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ticket list column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket #, order #, user..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredTickets.map((t) => {
              const isSelected = activeTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-850 border-amber-400 shadow-lg shadow-amber-400/10'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-amber-400">#{t.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        t.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : t.status === 'in_progress'
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{t.subject}</h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                    Customer: {t.userName} · Category: {t.category}
                  </p>
                  {t.orderId && (
                    <span className="text-[10px] font-mono text-amber-300/80 block mt-1">
                      Linked Order: #{t.orderId}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversation & resolution column (7 cols) */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col h-[650px] overflow-hidden">
              {/* Header with status changer */}
              <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">#{activeTicket.id}</span>
                    <span className="text-xs font-semibold text-white">{activeTicket.userName}</span>
                  </div>
                  <h3 className="text-xs text-neutral-300 mt-0.5 font-medium">{activeTicket.subject}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400">Set Status:</span>
                  <select
                    value={activeTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 text-xs text-amber-400 font-bold rounded-lg px-2.5 py-1 focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Linked order banner if available */}
              {relatedOrder && (
                <div className="bg-neutral-950/80 px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span>
                    Linked Order <strong className="text-white">#{relatedOrder.id}</strong> (Total: Rs. {relatedOrder.total})
                  </span>
                  <span className="text-amber-400 font-mono capitalize">
                    Status: {relatedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
              )}

              {/* Message thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-900/60">
                {activeTicket.messages.map((m) => {
                  const isAgent = m.senderRole === 'support';
                  return (
                    <div key={m.id} className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-neutral-500 mb-1 px-1">
                        {m.senderName} ({m.senderRole}) ·{' '}
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                          isAgent
                            ? 'bg-amber-400 text-neutral-950 font-medium rounded-tr-none'
                            : 'bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-tl-none'
                        }`}
                      >
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply form */}
              <form onSubmit={handleSendReply} className="p-3 bg-neutral-950 border-t border-neutral-800 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official reply to customer..."
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
              <Headphones className="w-10 h-10 text-neutral-600 mb-2" />
              <p className="text-xs text-neutral-400">Select a support ticket from the list to respond.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
