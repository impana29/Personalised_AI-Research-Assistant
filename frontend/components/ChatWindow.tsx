import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, UserIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon, PaperClipIcon, BoltIcon } from '@heroicons/react/24/outline';

interface ChatWindowProps {
  sessionId: string;
  personality: string;
  summary: string;
}

type Message = {
  sender: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ sessionId, personality, summary }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toolUsed, setToolUsed] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (useResearch: boolean = false) => {
    if (!input.trim() || isLoading) return;
    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', content: question }]);
    setIsLoading(true);
    let placeholderIndex: number | null = null;
    if (useResearch) {
      placeholderIndex = messages.length + 1;
      setMessages(prev => [
        ...prev,
        { sender: 'assistant', content: 'Conducting deep research...', isLoading: true }
      ]);
    }
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          session_id: sessionId,
          personality,
          research: useResearch
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      const answer = data.answer || "*(No answer)*";
      if (useResearch && placeholderIndex !== null) {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[placeholderIndex] = { sender: 'assistant', content: answer };
          return newMsgs;
        });
      } else {
        setMessages(prev => [...prev, { sender: 'assistant', content: answer }]);
      }
      if (data.tools_used && data.tools_used.includes("Bing Search")) {
        setToolUsed("Invoking research tool...");
      }
    } catch (error: any) {
      console.error("Error fetching answer:", error);
      const errMsg = "Error: Failed to get answer.";
      if (useResearch && placeholderIndex !== null) {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[placeholderIndex] = { sender: 'assistant', content: errMsg };
          return newMsgs;
        });
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'assistant', content: errMsg },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] w-full bg-white shadow-xl rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm">
        <h2 className="text-xl text-white font-bold text-center">AI Research Assistant</h2>
      </div>

      {/* Document Summary (displayed only at the top) */}
      <div className="p-4 bg-gray-50 overflow-y-auto flex-none">
        <div className="mb-4 p-4 border border-gray-200 rounded shadow-sm bg-white">
          <h3 className="text-lg font-semibold text-gray-800">Document Summary</h3>
          <p className="text-gray-700 mt-2">{summary}</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-100">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xl px-4 py-3 rounded-xl shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-teal-400 to-teal-600 text-white font-bold'
                  : 'bg-gradient-to-r from-purple-100 to-purple-200 text-gray-800 font-normal'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-2">
            <div className="max-w-xl px-4 py-3 rounded-xl shadow-sm bg-purple-200 text-gray-800 animate-pulse">
              Typing...
            </div>
          </div>
        )}
        {toolUsed && (
          <div className="flex justify-start mb-2">
            <div className="max-w-xl px-4 py-3 rounded-xl shadow-sm bg-yellow-100 text-yellow-900">
              {toolUsed}
            </div>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      {/* Input Box & Controls */}
      <div className="p-4 border-t bg-white flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
        />
        {/* Deep Research Button */}
        <button
          onClick={() => sendMessage(true)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          disabled={isLoading || !input.trim()}
          title="Answer with deep research"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
        </button>
        {/* Send Button */}
        <button
          onClick={() => sendMessage(false)}
          className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300"
          disabled={isLoading || !input.trim()}
          title="Send message"
        >
          <PaperAirplaneIcon className="h-5 w-5 transform rotate-45" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
