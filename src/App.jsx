import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Send, 
  Trash2, 
  Copy, 
  Download, 
  Play, 
  Check, 
  Plus, 
  MessageSquare,
  User,
  Bot,
  Settings,
  Sparkles,
  Command,
  ChevronRight,
  Menu,
  X,
  Keyboard,
  History,
  Info,
  Sun,
  Moon
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CodeBlock = ({ language, value, onRefine }) => {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [refinement, setRefinement] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([value], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code-${Date.now()}.${language || 'txt'}`;
    document.body.appendChild(element);
    element.click();
  };

  const handleRun = async () => {
    const lang = language?.toLowerCase();
    if (lang === 'html' || lang === 'htm' || lang === 'xml' || lang === 'svg') {
      setIsPreview(!isPreview);
      return;
    }

    if (lang === 'javascript' || lang === 'js') {
      try {
        const originalLog = console.log;
        let logs = [];
        console.log = (...args) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };
        new Function(value)();
        console.log = originalLog;
        setOutput(logs.join('\n') || 'Executed successfully (no output)');
      } catch (err) {
        setOutput(`Error: ${err.message}`);
      }
      return;
    }

    if (lang === 'php' || lang === 'java') {
      setOutput('Executing on server...');
      try {
        console.log(`Executing ${lang} on: ${import.meta.env.VITE_API_URL || 'https://ai-chatbot-backend-d3gn.onrender.com'}/api/execute`);
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://ai-chatbot-backend-d3gn.onrender.com'}/api/execute`, {
          language: lang,
          code: value
        });
        console.log('Execute Response:', response.data);
        setOutput(response.data.output || 'Execution finished (no output)');
      } catch (err) {
        console.error('Execute Error:', err);
        setOutput(`Server Error: ${err.response?.data?.error || err.message}`);
      }
      return;
    }
    setOutput(`Quick run not supported for ${language}. Try HTML, CSS, JS, PHP, or Java.`);
  };

  const handleRefineSubmit = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && refinement.trim()) {
      onRefine(value, refinement);
      setRefinement('');
    }
  };

  return (
    <div className="relative group my-8 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[#050505] shadow-2xl transition-all hover:shadow-accent/5">
      <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d0f] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/30"></div>
          </div>
          <span className="ml-2 uppercase font-black text-[10px] tracking-[2px] text-gray-500 flex items-center gap-2">
            {language || 'text'}
            {isPreview && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
          </span>
        </div>
        <div className="flex gap-1">
          <button onClick={handleRun} className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-accent transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3" title="Execute Code">
            <Play size={14} className={isPreview ? "text-accent" : ""} /> {isPreview ? 'Close' : 'Preview'}
          </button>
          <div className="w-[1px] h-4 bg-white/5 my-auto mx-1"></div>
          <button onClick={handleDownload} className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-blue-400 transition-all" title="Download">
            <Download size={14} />
          </button>
          <button onClick={handleCopy} className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all" title="Copy">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="relative min-h-[450px] flex">
        {/* Code View (Hidden when previewing) */}
        {!isPreview && (
          <div className="flex-1 transition-all duration-500">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{ 
                margin: 0, 
                padding: '2rem', 
                fontSize: '12px', 
                background: 'transparent', 
                lineHeight: '1.7',
                height: '100%',
                minHeight: '450px'
              }}
            >
              {value}
            </SyntaxHighlighter>
          </div>
        )}

        {/* Full-Screen Preview View */}
        {isPreview && (
          <div className="flex-1 bg-[#fdfdfd] z-10 animate-in fade-in zoom-in-95 duration-500 flex flex-col">
            <div className="flex justify-between items-center p-3 bg-white border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-8">
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/20"></div>
                </div>
                <span className="flex items-center gap-2 text-gray-400 font-black ml-2">
                  <Play size={10} className="text-blue-500" />
                  Live Preview Mode
                </span>
              </div>
              <button 
                onClick={() => setIsPreview(false)} 
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <X size={12} /> Back to Code
              </button>
            </div>
            <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/50">
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <script src="https://cdn.tailwindcss.com"></script>
                      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
                      <style>
                        body { 
                          margin: 0; 
                          padding: 60px;
                          display: flex; 
                          align-items: center; 
                          justify-content: center; 
                          min-height: 100vh; 
                          background: transparent; 
                          font-family: 'Inter', sans-serif;
                          color: #111827;
                        }
                        * { box-sizing: border-box; }
                      </style>
                    </head>
                    <body>${value}</body>
                  </html>
                `}
                className="w-full h-full border-none"
                title="preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </div>

      {/* Refinement Bar */}
      <div className="p-4 bg-[#0a0a0c] border-t border-white/5">
        <div className="flex items-center gap-4 bg-[#111114] rounded-2xl p-1 border border-white/5 focus-within:border-accent/30 transition-all">
          <div className="pl-4 text-gray-600">
            <Command size={14} />
          </div>
          <input 
            type="text"
            placeholder="Vibe code this component... (e.g., 'Make it dark mode', 'Add a shadow')"
            className="flex-1 bg-transparent border-none outline-none text-xs text-gray-300 py-3 font-medium placeholder:text-gray-700 placeholder:italic"
            value={refinement}
            onChange={(e) => setRefinement(e.target.value)}
            onKeyDown={handleRefineSubmit}
          />
          <button 
            onClick={handleRefineSubmit}
            className="bg-accent/10 hover:bg-accent/20 text-accent p-2.5 rounded-xl transition-all mr-1 disabled:opacity-20"
            disabled={!refinement.trim()}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {output && (
        <div className="bg-[#0a0a0a] text-green-400 p-6 text-sm font-mono border-t border-white/5 overflow-auto max-h-60 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between mb-4 border-b border-white/5 pb-2">
            <span className="text-gray-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Command size={12} /> Console Output
            </span>
            <button onClick={() => setOutput(null)} className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest">Clear</button>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
        </div>
      )}
    </div>
  );
};

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-chatbot-backend-d3gn.onrender.com/api/chat';

function App() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse chat history", e);
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = (instant = false) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: instant ? 'auto' : 'smooth',
      block: 'end'
    });
  };

  useEffect(() => {
    scrollToBottom(isLoading);
  }, [messages, isLoading, streamingMessage]);

  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  const handleInput = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      console.log('Fetching from:', API_URL);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';
      let queue = '';
      let isProcessing = false;

      const processQueue = () => {
        if (queue.length === 0) {
          isProcessing = false;
          return;
        }
        
        isProcessing = true;
        const charsToProcess = Math.min(queue.length, Math.ceil(queue.length / 5) + 1);
        const segment = queue.substring(0, charsToProcess);
        queue = queue.substring(charsToProcess);
        assistantMessage += segment;

        setStreamingMessage(assistantMessage);
        requestAnimationFrame(processQueue);
      };

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          const flushRemaining = setInterval(() => {
            if (queue.length === 0) {
              clearInterval(flushRemaining);
              setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
              setStreamingMessage('');
              setIsLoading(false);
              return;
            }
            if (!isProcessing) processQueue();
          }, 50);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const dataStr = trimmedLine.replace(/^data: /,'').trim();
          if (dataStr === '[DONE]') break;

          try {
            const data = JSON.parse(dataStr);
            if (data.content) {
              queue += data.content;
              if (!isProcessing) processQueue();
            } else if (data.error) {
              throw new Error(data.details || data.error);
            }
          } catch (e) {
            console.error('SSE Error:', e);
          }
        }
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || 'Connection lost'}` }]);
      setStreamingMessage('');
      setIsLoading(false);
    }
  };

  const handleRefine = async (originalCode, instruction) => {
    if (!instruction.trim() || isLoading) return;

    const refinementPrompt = `Refine this code:\n\`\`\`\n${originalCode}\n\`\`\`\nInstruction: ${instruction}`;
    const userMessage = { role: 'user', content: refinementPrompt };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      console.log('Refinement Fetching from:', API_URL);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';
      let queue = '';
      let isProcessing = false;

      const processQueue = () => {
        if (queue.length === 0) {
          isProcessing = false;
          return;
        }
        
        isProcessing = true;
        const charsToProcess = Math.min(queue.length, Math.ceil(queue.length / 5) + 1);
        const segment = queue.substring(0, charsToProcess);
        queue = queue.substring(charsToProcess);
        assistantMessage += segment;

        setStreamingMessage(assistantMessage);
        requestAnimationFrame(processQueue);
      };

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          const flushRemaining = setInterval(() => {
            if (queue.length === 0) {
              clearInterval(flushRemaining);
              setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
              setStreamingMessage('');
              setIsLoading(false);
              return;
            }
            if (!isProcessing) processQueue();
          }, 50);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const dataStr = trimmedLine.replace(/^data: /,'').trim();
          if (dataStr === '[DONE]') break;

          try {
            const data = JSON.parse(dataStr);
            if (data.content) {
              queue += data.content;
              if (!isProcessing) processQueue();
            }
          } catch (e) {
            console.error('SSE Error:', e);
          }
        }
      }
    } catch (error) {
      console.error('Refinement Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Refinement Error: ${error.message || 'Connection lost'}` }]);
      setStreamingMessage('');
      setIsLoading(false);
    }
  };

  return (
    <div className={cn(
      "flex h-screen overflow-hidden font-sans transition-colors duration-300",
      theme === 'dark' ? "dark bg-[#030303]" : "bg-white"
    )}>
      {/* Dynamic Sidebar */}
      <aside 
        className={cn(
          "bg-[var(--sidebar-bg)] flex flex-col transition-all duration-500 ease-in-out border-r border-[var(--border)] relative z-30 shadow-2xl shadow-black",
          showSidebar ? "w-80 translate-x-0" : "w-0 -translate-x-full"
        )}
      >
        <div className="p-6">
          <button 
            onClick={() => setMessages([])}
            className="w-full flex items-center justify-center gap-3 p-3.5 bg-accent text-white rounded-2xl hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 active:scale-95 font-bold text-sm"
          >
            <Plus size={18} />
            New Architect
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] px-4 mb-4 mt-2">Activity</div>
          {messages.length > 0 && (
            <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-2xl cursor-pointer border border-white/5 group hover:border-accent/20 hover:bg-white/[0.07] transition-all mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                <MessageSquare size={14} />
              </div>
              <span className="truncate text-[13px] font-semibold text-gray-400 group-hover:text-gray-200 transition-colors uppercase tracking-tight">{messages[0].content}</span>
            </div>
          )}
          
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] px-4 mt-8 mb-4 flex items-center gap-2">
            <Sparkles size={12} className="text-yellow-500/50" /> Components
          </div>
          {[
            { name: 'Glassmorphism Card', prompt: 'Create a glassmorphism card with a soft glow and elegant typography' },
            { name: 'Responsive Navbar', prompt: 'Design a modern responsive navbar with a glass effect and animated links' },
            { name: 'Auth/Login Form', prompt: 'Create a premium login form with social auth buttons and a split-screen layout' },
            { name: 'Modern Hero Section', prompt: 'Architect a high-conversion hero section with a 3D-feel and bold CTA' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => setInput(item.prompt)}
              className="group flex items-center gap-3 p-3.5 hover:bg-white/5 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-white/5 mb-1"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-all">
                <Play size={10} />
              </div>
              <span className="truncate text-[13px] font-semibold text-gray-500 group-hover:text-gray-300 transition-colors">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-2xl cursor-pointer border border-[var(--border)] hover:border-accent/20 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-800 dark:to-black flex items-center justify-center text-accent shadow-lg shadow-black group-hover:scale-105 transition-transform border border-[var(--border)]">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate leading-none uppercase tracking-widest text-[var(--text)]">Junior Dev</p>
              <p className="text-[10px] text-[var(--text-secondary)] font-bold mt-1 uppercase tracking-tighter">Student Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Toggle Sidebar Button (Floating) */}
      {!showSidebar && (
        <button 
          onClick={() => setShowSidebar(true)}
          className="fixed left-6 top-6 z-40 p-3 bg-white/5 hover:bg-accent/20 rounded-2xl border border-white/10 text-accent transition-all animate-in zoom-in duration-300 backdrop-blur-xl"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Header Overlay */}
      <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border)] transition-colors duration-300">
        <div className="flex items-center gap-4 pl-4">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-[var(--accent-light)] rounded-xl transition-all text-[var(--text-secondary)]"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <Sparkles size={16} />
            </div>
            <div>
              <h1 className="text-[13px] font-black uppercase tracking-[0.2em] text-[var(--text)]">ChatBot <span className="text-accent opacity-50">ANB</span></h1>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 pr-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 hover:bg-[var(--accent-light)] rounded-xl transition-all text-[var(--text-secondary)] hover:text-accent group"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="p-2.5 hover:bg-[var(--accent-light)] rounded-xl transition-all text-[var(--text-secondary)] hover:text-accent group">
            <Settings size={18} className="group-hover:rotate-45 transition-transform" />
          </button>
          <div className="h-4 w-[1px] bg-[var(--border)] mx-2"></div>
          <button onClick={() => setMessages([])} className="p-2.5 hover:bg-red-500/10 rounded-xl transition-all text-[var(--text-secondary)] hover:text-red-400" title="Clear Session">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative radial-bg">
        {/* Message Flow */}
        <div className="flex-1 overflow-y-auto pt-24 pb-40 custom-scrollbar relative z-10 glass-overlay">
          <div className="max-w-4xl mx-auto px-6">
            {messages.length === 0 ? (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center">
                <div className="relative mb-12 group">
                  <div className="absolute -inset-12 bg-accent/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  <div className="w-24 h-24 bg-gradient-to-br from-accent via-indigo-600 to-blue-700 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative z-10 animate-float">
                    <Bot size={48} className="text-white drop-shadow-2xl" />
                  </div>
                </div>
                <h2 className="text-5xl font-black text-[var(--text)] mb-6 tracking-tighter">What will we build today?</h2>
                <p className="max-w-md text-[var(--text-secondary)] text-base leading-relaxed font-medium mb-12">I'm your Senior UI Architect, ready to transform your ideas into production-ready code.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-6">
                  <button onClick={() => setInput("Build a futuristic dashboard component with glass cards and animated charts")} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl hover:border-accent/40 transition-all text-left group shadow-sm hover:shadow-xl">
                    <p className="font-black text-[9px] mb-2 text-accent uppercase tracking-widest flex items-center gap-2">
                       <Play size={10} /> Design Directive
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] font-semibold leading-relaxed group-hover:text-[var(--text)] transition-colors">Futuristic dashboard with glass cards...</p>
                  </button>
                  <button onClick={() => setInput("Create an interactive developer landing page with a code-terminal feel")} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl hover:border-accent/40 transition-all text-left group shadow-sm hover:shadow-xl">
                    <p className="font-black text-[9px] mb-2 text-blue-400 uppercase tracking-widest flex items-center gap-2">
                       <Play size={10} /> Logic Layer
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] font-semibold leading-relaxed group-hover:text-[var(--text)] transition-colors">Developer landing page with terminal feel...</p>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "py-12 flex gap-8 group animate-in slide-in-from-bottom-6 duration-500",
                    m.role === 'assistant' ? "assistant-bubble px-12 -mx-12" : ""
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110",
                    m.role === 'assistant' 
                      ? "bg-gradient-to-br from-accent to-blue-600 text-white shadow-accent/20" 
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]"
                  )}>
                    {m.role === 'assistant' ? <Bot size={22} /> : <User size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "font-black text-[10px] uppercase tracking-[0.25em]",
                        m.role === 'assistant' ? "text-accent" : "text-[var(--text-secondary)]"
                      )}>
                        {m.role === 'assistant' ? 'Senior Architect' : 'Core Protocol'}
                      </div>
                      <div className="h-[1px] flex-1 bg-[var(--border)] opacity-50"></div>
                    </div>
                    <div className={cn(
                      "markdown prose prose-invert max-w-none leading-[1.7] font-medium text-[15px]",
                      m.role === 'assistant' ? "text-[var(--text)]" : "text-[var(--text)] bg-[var(--bg-secondary)] p-6 rounded-2xl border border-[var(--border)]"
                    )}>
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const lang = match ? match[1] : '';
                            return !inline ? (
                              <CodeBlock 
                                language={lang} 
                                value={String(children).replace(/\n$/, '')} 
                                onRefine={handleRefine}
                              />
                            ) : (
                              <code className="inline-block px-1.5 py-0.5 bg-accent/15 text-accent rounded-md font-bold text-[12px] border border-accent/10" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {streamingMessage && (
              <div className="py-12 flex gap-8 group animate-in slide-in-from-bottom-6 duration-500 assistant-bubble px-12 -mx-12">
                <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-all duration-500 bg-gradient-to-br from-accent to-blue-600 text-white shadow-accent/20">
                  <Bot size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="font-black text-[10px] uppercase tracking-[0.25em] text-accent">Senior Architect</div>
                    <div className="h-[1px] flex-1 bg-[var(--border)] opacity-50"></div>
                  </div>
                  <div className="markdown prose prose-invert max-w-none leading-[1.7] font-medium text-[15px] text-[var(--text)]">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const lang = match ? match[1] : '';
                          return !inline ? (
                            <CodeBlock 
                              language={lang} 
                              value={String(children).replace(/\n$/, '')} 
                              onRefine={handleRefine}
                            />
                          ) : (
                            <code className="inline-block px-1.5 py-0.5 bg-accent/15 text-accent rounded-md font-bold text-[12px] border border-accent/10" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {streamingMessage}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {isLoading && !streamingMessage && (
              <div className="py-10 flex gap-6 animate-pulse px-6">
                <div className="w-11 h-11 rounded-2xl bg-accent/10 flex-shrink-0 flex items-center justify-center border border-accent/20">
                  <Bot size={22} className="text-accent" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/50 ml-4">Architecting Response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Nexus */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-20">
          <div className="max-w-2xl mx-auto relative group">
            <form 
              onSubmit={handleSubmit}
              className="relative bg-[var(--header-bg)] backdrop-blur-3xl rounded-[1.5rem] border border-[var(--border)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] focus-within:border-accent/40 focus-within:shadow-accent/5 transition-all p-1.5 flex items-end overflow-hidden group/form"
            >
              <div className="flex-1 flex flex-col pl-4">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Ask anything..."
                  rows={1}
                  className="w-full py-2 px-1 bg-transparent resize-none border-none outline-none text-[var(--text)] placeholder-[var(--text-secondary)] max-h-48 overflow-y-auto leading-relaxed text-[14px] font-medium tracking-tight"
                />
              </div>
              <div className="p-1 pr-1.5 pb-1.5">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 shadow-xl active:scale-95",
                    input.trim() && !isLoading 
                      ? "bg-accent text-white shadow-accent/20 hover:scale-105" 
                      : "bg-[var(--border)] text-[var(--text-secondary)] grayscale"
                  )}
                >
                  <Send size={14} className={isLoading ? "animate-pulse" : ""} />
                </button>
              </div>
            </form>
            
            <div className="flex justify-center mt-2 px-8 items-center text-[8px] font-bold uppercase tracking-[0.1em] text-gray-600/40">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 group cursor-help">
                  <Sparkles size={10} />
                  <span>Senior UI Architect</span>
                </div>
                <span className="opacity-30">•</span>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500/30 rounded-full"></div>
                  <span>Vibe Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
