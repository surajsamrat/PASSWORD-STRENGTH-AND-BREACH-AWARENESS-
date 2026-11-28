import React from "react";
import { useChatbot } from "@/hooks/useChatbot";
import { FloatingChatButton } from "./FloatingChatButton";
import { ChatWindow } from "./ChatWindow";

export const FloatingChatbot: React.FC = () => {
  const { isOpen, hasUnreadBadge, openChat } = useChatbot();

  if (isOpen) {
    return <ChatWindow />;
  }

  return (
    <FloatingChatButton
      hasUnreadBadge={hasUnreadBadge}
      onClick={openChat}
    />
  );
};
