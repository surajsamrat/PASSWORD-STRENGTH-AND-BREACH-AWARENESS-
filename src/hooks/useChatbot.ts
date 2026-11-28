import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { en } from "@/i18n/en";
import {
  AiAssistantClientError,
  fetchAssistantHealth,
  validateClientPromptPrivacy,
  type AssistantHealthStatus,
  type AssistantTurnPayload,
} from "@/lib/security/aiAssistantClient";
import { generateLocalSecurityReply } from "@/lib/security/assistantEngine";
import {
  generateChatbotResponse,
  getSuggestedStarterChips,
} from "@/services/chatbotService";

export interface ChatbotMessageItem {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  source?: "knowledge-base" | "context" | "ai-backend" | "fallback";
  sourceLabel?: string;
  tags?: string[];
  followUps?: string[];
  blockedForPrivacy?: boolean;
}

interface ChatbotContextValue {
  isOpen: boolean;
  isMinimized: boolean;
  hasUnreadBadge: boolean;
  messages: ChatbotMessageItem[];
  isTyping: boolean;
  error: string | null;
  lastFailedQuery: string | null;
  aiHealth: AssistantHealthStatus | null;
  starterChips: string[];
  pathname: string;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  toggleMinimize: () => void;
  sendMessage: (rawText: string) => Promise<void>;
  retryLast: () => Promise<void>;
  useOfflineFallbackForLast: () => void;
  clearChat: () => void;
}

const INTRO_BADGE_KEY = "securecheck_chatbot_seen_v1";

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

function readIntroSeen(): boolean {
  try {
    return localStorage.getItem(INTRO_BADGE_KEY) === "1";
  } catch {
    return false;
  }
}

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { pathname } = useLocation();
  const { language, liveToolContext, sessionSnapshot, hygiene } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasUnreadBadge, setHasUnreadBadge] = useState(() => !readIntroSeen());
  const [messages, setMessages] = useState<ChatbotMessageItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [aiHealth, setAiHealth] = useState<AssistantHealthStatus | null>(null);

  const inFlightRef = useRef(false);

  useEffect(() => {
    let active = true;
    fetchAssistantHealth().then((status) => {
      if (active) setAiHealth(status);
    });
    return () => {
      active = false;
    };
  }, []);

  const markIntroSeen = useCallback(() => {
    setHasUnreadBadge(false);
    try {
      localStorage.setItem(INTRO_BADGE_KEY, "1");
    } catch {
      // Ignore storage errors
    }
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    markIntroSeen();
  }, [markIntroSeen]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsMinimized(false);
        markIntroSeen();
      }
      return next;
    });
  }, [markIntroSeen]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastFailedQuery(null);
    setIsTyping(false);
    inFlightRef.current = false;
  }, []);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed || inFlightRef.current) return;

      inFlightRef.current = true;
      setError(null);
      setLastFailedQuery(null);

      // Privacy guard check BEFORE writing anything to React state or history
      const privacyViolation = validateClientPromptPrivacy(trimmed, "en");
      const displayUserText = privacyViolation
        ? "[Sensitive password/hash blocked locally — never stored or sent]"
        : trimmed;

      const userMsg: ChatbotMessageItem = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender: "user",
        text: displayUserText,
        timestamp: new Date().toISOString(),
        blockedForPrivacy: Boolean(privacyViolation),
      };

      const safeHistory: AssistantTurnPayload[] = messages
        .filter((m) => !m.blockedForPrivacy)
        .slice(-8)
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }));

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const res = await generateChatbotResponse({
          query: trimmed,
          pathname,
          appLanguage: language,
          history: safeHistory,
          liveToolContext,
          sessionSnapshot,
          hygiene,
          aiHealth,
        });

        // Short subtle typing delay for local deterministic responses
        if (res.source !== "ai-backend") {
          await new Promise((resolve) => setTimeout(resolve, 180));
        }

        const assistantMsg: ChatbotMessageItem = {
          id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: "assistant",
          text: res.answer,
          timestamp: new Date().toISOString(),
          source: res.source,
          sourceLabel: res.sourceLabelEn,
          tags: res.tags,
          followUps: res.followUps,
          blockedForPrivacy: res.blockedForPrivacy,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        if (err instanceof AiAssistantClientError) {
          const map = en.errors as Record<string, string>;
          const msg = map[err.code] || err.message || en.errors.UNKNOWN_ERROR;
          setError(
            err.retryAfterSeconds
              ? `${msg} (${err.retryAfterSeconds}s)`
              : msg
          );
          setLastFailedQuery(privacyViolation ? null : trimmed);
        } else {
          setError("Could not process that message. Please try again.");
          setLastFailedQuery(privacyViolation ? null : trimmed);
        }
      } finally {
        setIsTyping(false);
        inFlightRef.current = false;
      }
    },
    [
      aiHealth,
      hygiene,
      language,
      liveToolContext,
      messages,
      pathname,
      sessionSnapshot,
    ]
  );

  const retryLast = useCallback(async () => {
    if (!lastFailedQuery) return;
    const queryToRetry = lastFailedQuery;
    setError(null);
    await sendMessage(queryToRetry);
  }, [lastFailedQuery, sendMessage]);

  const useOfflineFallbackForLast = useCallback(() => {
    if (!lastFailedQuery) return;
    const localReply = generateLocalSecurityReply(lastFailedQuery, "en");
    setError(null);
    setLastFailedQuery(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender: "assistant",
        text: `${localReply.answer}\n\n> *Offline Fallback Mode: Answering from SecureCheck's built-in cybersecurity knowledge base because Gemini AI is unavailable.*`,
        timestamp: new Date().toISOString(),
        source: "fallback",
        sourceLabel: "Offline Fallback Mode",
        tags: [...localReply.tags, "Fallback Mode"],
        followUps: localReply.suggestedFollowUps,
      },
    ]);
  }, [lastFailedQuery]);

  const starterChips = getSuggestedStarterChips("en", pathname);

  return React.createElement(
    ChatbotContext.Provider,
    {
      value: {
        isOpen,
        isMinimized,
        hasUnreadBadge,
        messages,
        isTyping,
        error,
        lastFailedQuery,
        aiHealth,
        starterChips,
        pathname,
        openChat,
        closeChat,
        toggleChat,
        toggleMinimize,
        sendMessage,
        retryLast,
        useOfflineFallbackForLast,
        clearChat,
      },
    },
    children
  );
};

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return ctx;
}
