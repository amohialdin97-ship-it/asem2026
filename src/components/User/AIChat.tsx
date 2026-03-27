/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { generateResponse } from '../../services/ai';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'مرحباً بك في العاصم AI! كيف يمكنني مساعدتك اليوم؟', sender: 'ai', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiResponse = await generateResponse(input);
    
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponse || "عذراً، لم أتمكن من معالجة طلبك.",
      sender: 'ai',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[70vh] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center gap-3">
        <div className="p-2 bg-red-100 text-red-600 rounded-xl">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold">العاصم AI</h3>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-gray-400">متصل الآن</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-red-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-100" />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t flex gap-2">
        <input
          className="flex-grow px-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          placeholder="اسأل العاصم AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} className="p-2 rounded-xl aspect-square">
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
