import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useUIStore } from '../store/uiStore';
import { useAIChat } from '../api/hooks';
import toast from 'react-hot-toast';

interface Message { role: 'user' | 'assistant'; content: string; }

const SUGGESTED_PROMPTS = [
  "What should I focus on today?",
  "Am I overloaded this week?",
  "Which tasks are overdue?",
  "Suggest priorities for my tasks",
];

export function AIAssistant() {
  const { isAIPanelOpen, toggleAIPanel } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const aiChat = useAIChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');

    try {
      const res = await aiChat.mutateAsync(msg);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      toast.error('AI chat failed');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I ran into an error. Please try again.' }]);
    }
  };

  if (!isAIPanelOpen) return null;

  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-surface-3 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-ink rounded-[8px] flex items-center justify-center text-sm">✨</div>
          <div>
            <p className="text-sm font-semibold text-ink">TaskMaster AI</p>
            <p className="text-[10px] text-success">● Online</p>
          </div>
        </div>
        <button onClick={toggleAIPanel} className="w-7 h-7 rounded-input hover:bg-surface-2 flex items-center justify-center text-muted transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🤖</div>
            <p className="text-sm font-medium text-ink mb-1">Hi! I'm your AI assistant</p>
            <p className="text-xs text-muted mb-4">Ask me anything about your tasks</p>
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="w-full text-left text-xs px-3 py-2 bg-surface rounded-input hover:bg-surface-2 text-muted hover:text-ink transition-colors border border-surface-3"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-[12px] px-3 py-2.5 text-xs ${
              msg.role === 'user'
                ? 'bg-ink text-white rounded-br-[4px]'
                : 'bg-surface text-ink rounded-bl-[4px] border border-surface-3'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-xs max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {aiChat.isPending && (
          <div className="flex justify-start">
            <div className="bg-surface border border-surface-3 rounded-[12px] rounded-bl-[4px] px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-surface-2">
        <div className="flex items-center gap-2 bg-surface rounded-input p-2 border border-surface-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || aiChat.isPending}
            className="w-7 h-7 bg-ink rounded-[6px] flex items-center justify-center text-white hover:bg-ink/90 transition-colors disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
