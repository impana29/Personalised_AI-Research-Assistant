import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  PaperAirplaneIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import {
  MagnifyingGlassIcon,
  PaperClipIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

type Message = {
  sender: "user" | "assistant";
  content: string;
  isLoading?: boolean;
};

export default function Chat() {
  // ---------- STATE ----------
  const [personality, setPersonality] = useState("factual");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // ---------- REFS ----------
  const bottomRef = useRef<HTMLDivElement>(null);

  // ---------- SCROLL TO BOTTOM ON MESSAGES UPDATE ----------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------- PERSONALITY ----------
  const handlePersonalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPersonality(e.target.value);
  };

  // ---------- DOCUMENT UPLOAD ----------
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use absolute URL to avoid rewrite issues
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      // e.g. { session_id, summary }
      setSessionId(data.session_id);
      setSummary(data.summary || "");
    } catch (error) {
      console.error("Upload error:", error);
      // Show error message in chat
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          content: "Error: Failed to summarize document.",
        },
      ]);
    } finally {
      setUploading(false);
    }
  };

  // ---------- CHAT (ASK A QUESTION) ----------
  const sendMessage = async (useResearch: boolean) => {
    if (!input.trim() || isTyping) return;

    // If user hasn't uploaded a doc yet, show a message
    if (!sessionId) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          content: "Please upload a document first.",
        },
      ]);
      return;
    }

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", content: userMsg }]);
    setIsTyping(true);

    let placeholderIndex: number | null = null;
    if (useResearch) {
      placeholderIndex = messages.length + 1;
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          content: "Conducting deep research...",
          isLoading: true,
        },
      ]);
    }

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMsg,
          session_id: sessionId,
          personality,
          research: useResearch,
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      const answer = data.answer || "*(No answer)*";

      if (useResearch && placeholderIndex !== null) {
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[placeholderIndex] = { sender: "assistant", content: answer };
          return newMsgs;
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", content: answer },
        ]);
      }
    } catch (error) {
      console.error("Error fetching answer:", error);
      const errMsg = "Error: Failed to get answer.";
      if (useResearch && placeholderIndex !== null) {
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[placeholderIndex] = { sender: "assistant", content: errMsg };
          return newMsgs;
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", content: errMsg },
        ]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(false);
    }
  };

  // ---------- 1) IF NO SESSION => SHOW UPLOAD & PERSONALITY ----------
  if (!sessionId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black text-white p-6">
        <h1 className="text-3xl font-extrabold mb-6 animate-pulse">
          Upload a Document to Start Chatting
        </h1>

        {/* Personality Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Assistant Personality
          </label>
          <select
            value={personality}
            onChange={handlePersonalityChange}
            className="rounded-md border border-gray-700 bg-gray-800 text-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300"
          >
            <option value="factual">Factual</option>
            <option value="friendly">Friendly</option>
            <option value="humorous">Humorous</option>
          </select>
        </div>

        {/* Document Uploader */}
        <div className="border p-4 rounded-md bg-gray-800 shadow-lg w-72">
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm mb-4
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
            "
          />
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            {uploading ? "Uploading..." : "Upload & Summarize"}
          </button>
        </div>
      </div>
    );
  }

  // ---------- 2) IF SESSION => SHOW CHAT INTERFACE ----------
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-6 bg-gradient-to-r from-blue-700 to-purple-700 shadow-xl">
        <h1 className="text-3xl font-extrabold text-center">Chat with Your AI Assistant</h1>
      </header>

      <main className="flex-1 p-4 flex items-center justify-center">
        {/* Chat Container */}
        <div className="w-full max-w-4xl bg-gray-800 border border-gray-700 rounded-lg flex flex-col min-h-[700px] shadow-2xl">
          {/* Document Summary */}
          {summary && (
            <div className="border-b border-gray-700 bg-gray-700 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-200 mb-1 animate-pulse">
                Document Summary
              </h3>
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {summary}
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-2 ${
                    isUser ? "justify-end flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div className="mt-1">
                    {isUser ? (
                      <UserIcon className="h-6 w-6 text-blue-400" />
                    ) : (
                      <BoltIcon className="h-6 w-6 text-pink-400" />
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 break-words transition-all duration-300 ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start space-x-2">
                <BoltIcon className="h-6 w-6 text-pink-400" />
                <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg animate-pulse">
                  Typing...
                </div>
              </div>
            )}
            <div id="bottomRef" ref={bottomRef} />
          </div>

          {/* Input Box */}
          <div className="border-t border-gray-700 bg-gray-700 p-4 flex items-center space-x-2">
            <input
              type="text"
              className="flex-1 bg-gray-600 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(false);
                }
              }}
              disabled={isTyping}
            />
            {/* Deep Research */}
            <button
              onClick={() => sendMessage(true)}
              className="p-2 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-full disabled:bg-gray-800 transition-all duration-300"
              disabled={isTyping || !input.trim()}
              title="Answer with deep research"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            {/* Send Button */}
            <button
              onClick={() => sendMessage(false)}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full disabled:bg-blue-300 transition-all duration-300"
              disabled={isTyping || !input.trim()}
              title="Send message"
            >
              <PaperAirplaneIcon className="h-5 w-5 transform rotate-45" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
