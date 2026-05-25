/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useAppSelector } from "../store/hooks";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Send,
  User,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Target,
  Briefcase,
  FileText,
  MessageSquare,
  Copy,
  Check,
  Lock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Prompt starters ─────────────────────────────────────────
const QUICK_PROMPTS = [
  {
    icon: <FileText size={16} className="text-blue-500" />,
    label: "Review my resume",
    prompt: "Can you give me tips to improve my resume for tech jobs?",
    color: "bg-blue-50 border-blue-100 hover:border-blue-300",
  },
  {
    icon: <MessageSquare size={16} className="text-violet-500" />,
    label: "Interview prep",
    prompt: "How should I prepare for a software engineering interview?",
    color: "bg-violet-50 border-violet-100 hover:border-violet-300",
  },
  {
    icon: <TrendingUp size={16} className="text-green-500" />,
    label: "Salary negotiation",
    prompt: "Give me tips on how to negotiate a better salary offer.",
    color: "bg-green-50 border-green-100 hover:border-green-300",
  },
  {
    icon: <Target size={16} className="text-amber-500" />,
    label: "Career pivot",
    prompt:
      "I want to transition from marketing to product management. How do I get started?",
    color: "bg-amber-50 border-amber-100 hover:border-amber-300",
  },
  {
    icon: <BookOpen size={16} className="text-rose-500" />,
    label: "Skill gaps",
    prompt:
      "What skills should I learn in 2025 to stay competitive in the job market?",
    color: "bg-rose-50 border-rose-100 hover:border-rose-300",
  },
  {
    icon: <Briefcase size={16} className="text-cyan-500" />,
    label: "Cover letter",
    prompt:
      "Help me write a compelling cover letter for a product manager role.",
    color: "bg-cyan-50 border-cyan-100 hover:border-cyan-300",
  },
];

const FEATURED_ARTICLES = [
  {
    tag: "Resume",
    title: "5 Resume Mistakes That Cost You Interviews",
    desc: "Avoid these common pitfalls that hiring managers notice immediately.",
    read: "4 min read",
    color: "text-blue-600 bg-blue-50",
  },
  {
    tag: "Interviews",
    title: "Mastering the STAR Method for Behavioral Questions",
    desc: "Structure your answers to land any behavioral interview question.",
    read: "6 min read",
    color: "text-violet-600 bg-violet-50",
  },
  {
    tag: "Salary",
    title: "How to Negotiate a 20% Higher Salary Offer",
    desc: "A step-by-step script to confidently negotiate your compensation.",
    read: "5 min read",
    color: "text-green-600 bg-green-50",
  },
];

// ─── Message bubble ───────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-blue-600"
            : "bg-linear-to-br from-violet-500 to-indigo-600"
        }`}
      >
        {isUser ? (
          <User size={14} className="text-white" />
        ) : (
          <Sparkles size={14} className="text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`group max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
          }`}
        >
          {/* Render assistant messages with basic markdown */}
          {isUser ? (
            msg.content
          ) : (
            <div
              className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                  .replace(
                    /^### (.*?)$/gm,
                    '<h3 class="text-sm font-semibold text-gray-900 mt-3 mb-1">$1</h3>',
                  )
                  .replace(
                    /^## (.*?)$/gm,
                    '<h2 class="text-base font-bold text-gray-900 mt-4 mb-1">$1</h2>',
                  )
                  .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc">$1</li>')
                  .replace(/\n/g, "<br />"),
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-gray-400">
            {msg.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {!isUser && (
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
              title="Copy"
            >
              {copied ? (
                <Check size={12} className="text-green-500" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
        <Sparkles size={14} className="text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function CareerTipsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isLoggedIn = !!user;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Build a personalised system prompt from user profile
  const buildSystemPrompt = () => {
    const name = user?.name || "the user";
    const userType = user?.userType || "Job Seeker";
    const role = (user as any)?.currentRole || "";
    const industry = (user as any)?.industry || "";
    const experience = (user as any)?.yearsExperience || "";

    return `You are an expert career advisor for JobPortal, a job platform serving East Africa and beyond. 
You are having a conversation with ${name}, a ${userType}${role ? ` currently working as ${role}` : ""}${industry ? ` in the ${industry} industry` : ""}${experience ? ` with ${experience} years of experience` : ""}.

Your role is to give specific, actionable, and encouraging career advice. Be conversational but professional. 
Format responses clearly using bullet points or numbered lists where helpful. Keep answers focused and under 300 words unless a detailed explanation is truly needed.
Always tailor your advice to the East African job market context where relevant. Be warm, empathetic, and practical.`;
  };

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;

    if (!isLoggedIn) return;

    setInput("");
    setSessionStarted(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: conversationHistory,
        }),
      });

      const data = await response.json();
      const replyText =
        data.content?.[0]?.text ||
        "I'm sorry, I couldn't generate a response right now. Please try again.";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setSessionStarted(false);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-linear-to-br from-[#0d1a2d] via-[#0f2744] to-[#143057] py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                AI Career Advisor
              </h1>
              <p className="text-white/50 text-xs">
                Powered by Claude AI · Personalised to your profile
              </p>
            </div>
            {sessionStarted && (
              <button
                onClick={resetChat}
                className="ml-auto flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition"
              >
                <RefreshCw size={12} /> New chat
              </button>
            )}
          </div>

          {isLoggedIn && user && (
            <div className="flex items-center gap-2 mt-4 bg-white/10 rounded-xl px-4 py-2.5 border border-white/10 w-fit">
              <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-xs text-white font-medium">{user.name}</p>
                <p className="text-xs text-white/50">{user.userType}</p>
              </div>
              <span className="ml-2 text-xs text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full">
                Personalised
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
              style={{ height: "600px" }}
            >
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {!isLoggedIn ? (
                  /* Not logged in state */
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-4">
                      <Lock size={24} className="text-violet-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Sign in for AI Career Advice
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      Get personalised, AI-powered career guidance tailored to
                      your profile, experience, and goals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-sm px-6 py-2.5 rounded-xl transition hover:bg-gray-50"
                      >
                        Create Account
                      </Link>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  /* Empty state */
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-100 to-indigo-100 flex items-center justify-center mb-4">
                      <Sparkles size={24} className="text-violet-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Hello{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
                      👋
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                      I'm your AI career advisor. Ask me anything about jobs,
                      interviews, resumes, or career growth.
                    </p>
                  </div>
                ) : (
                  /* Messages */
                  <>
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} msg={msg} />
                    ))}
                    {loading && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              {isLoggedIn && (
                <div className="border-t border-gray-100 p-4">
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask for career advice... (Enter to send, Shift+Enter for new line)"
                      rows={2}
                      disabled={loading}
                      className="flex-1 resize-none text-sm text-gray-800 placeholder:text-gray-400 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white p-3 rounded-xl transition shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    AI advice is for guidance only. Always verify with a
                    professional career counsellor.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick prompts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles size={15} className="text-violet-500" />
                Quick Prompts
              </h3>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => isLoggedIn && sendMessage(p.prompt)}
                    disabled={loading || !isLoggedIn}
                    className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl border transition text-sm ${
                      !isLoggedIn
                        ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-100"
                        : p.color
                    }`}
                  >
                    {p.icon}
                    <span className="text-gray-700 font-medium text-xs">
                      {p.label}
                    </span>
                    <ChevronRight
                      size={13}
                      className="ml-auto text-gray-300 shrink-0"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Featured articles */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen size={15} className="text-blue-500" />
                Career Articles
              </h3>
              <div className="space-y-4">
                {FEATURED_ARTICLES.map((article) => (
                  <div key={article.title} className="cursor-pointer group">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${article.color}`}
                    >
                      {article.tag}
                    </span>
                    <h4 className="text-xs font-semibold text-gray-900 mt-1.5 mb-1 group-hover:text-blue-600 transition leading-snug">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {article.desc}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-300">
                        {article.read}
                      </span>
                      <button
                        onClick={() =>
                          isLoggedIn &&
                          sendMessage(`Tell me about: ${article.title}`)
                        }
                        disabled={!isLoggedIn}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium disabled:opacity-40"
                      >
                        Ask AI →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips of the day */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} className="text-blue-200" />
                <span className="text-xs font-semibold text-blue-100">
                  Tip of the Day
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/90">
                Tailor your resume for each job application. Use keywords from
                the job description to get past ATS filters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
