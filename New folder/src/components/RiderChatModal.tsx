import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bike, Phone, Clock, MessageSquare, CheckCheck } from 'lucide-react';
import { ChatMessage, Order } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface RiderChatModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const RiderChatModal: React.FC<RiderChatModalProps> = ({ order, isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const data = await api.getOrderMessages(order.id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, order.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (messageText?: string) => {
    const payload = (messageText || text).trim();
    if (!payload) return;

    setLoading(true);
    try {
      const newMsg = await api.sendOrderMessage(order.id, {
        message: payload,
        senderRole: user?.role || 'customer',
        senderName: user?.name || order.customerName,
      });
      setMessages((prev) => [...prev, newMsg]);
      if (!messageText) setText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickMessages = [
    'Where are you right now?',
    'Please call me when outside',
    'I am waiting near the gate',
    'Please ring the doorbell twice',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg h-[620px] max-h-[90vh] flex flex-col rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold">
                <Bike className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-neutral-950 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  {order.riderName || 'Farhan Malik'} (Rider)
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Order #{order.id} · Live Delivery Chat</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.riderPhone && (
              <a
                href={`tel:${order.riderPhone}`}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 transition-colors"
                title="Call Rider"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="bg-neutral-950/80 px-3 py-2 border-b border-neutral-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickMessages.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-300 rounded-lg transition-colors border border-neutral-700/60"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-900/60">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40 text-amber-400" />
              <p className="text-xs font-semibold text-neutral-300">Start chat with delivery rider</p>
              <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">
                Ask about current location, gate instructions, or parking access.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === (user?.role || 'customer');
              const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-neutral-500 mb-1 px-1">
                    {msg.senderName} · {formattedTime}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                      isMe
                        ? 'bg-amber-400 text-neutral-950 font-medium rounded-tr-none'
                        : 'bg-neutral-800 text-neutral-100 rounded-tl-none border border-neutral-700/60'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.message}</p>
                    <div className="flex justify-end mt-1">
                      <CheckCheck className={`w-3 h-3 ${isMe ? 'text-neutral-800' : 'text-neutral-500'}`} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message to rider..."
            className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="p-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold rounded-xl transition-all"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
