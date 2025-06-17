"use client";

import type React from "react";

import type { Message } from "ai";
import { AttachmentDisplay } from "@/components/files/attachment-display";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Edit3, Save, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: Message;
  index: number;
  onEditMessage?: (messageId: string, newContent: string) => void;
  isEditable?: boolean;
}

const AssistantIcon = (
  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#10a37f] rounded-full flex items-center justify-center">
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="text-white sm:w-4 sm:h-4"
    >
      <path
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
        fill="currentColor"
      />
    </svg>
  </div>
);

function CodeBlock({
  language,
  children,
}: {
  language: string;
  children: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 sm:my-4">
      <div className="flex items-center justify-between bg-[#1a1a1a] px-3 sm:px-4 py-2 rounded-t-lg border-b border-gray-600">
        <span className="text-gray-300 text-xs sm:text-sm font-medium">
          {language || "code"}
        </span>
        <Button
          onClick={handleCopy}
          size="sm"
          variant="ghost"
          className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
        >
          {copied ? (
            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: "0 0 8px 8px",
          background: "#0d1117",
          fontSize: "12px",
        }}
        codeTagProps={{
          style: {
            fontSize: "12px",
            fontFamily:
              "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
          },
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function ChatMessage({
  message,
  index,
  onEditMessage,
  isEditable = true,
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSave = () => {
    if (
      editContent.trim() &&
      editContent !== message.content &&
      onEditMessage
    ) {
      onEditMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <div
      key={`${message.id}-${index}`}
      className="w-full py-3 sm:py-4 md:py-6 px-3 sm:px-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-2xl sm:max-w-3xl mx-auto">
        {message.role === "user" ? (
          <div className="flex justify-end mb-3 sm:mb-4">
            <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[70%] relative group">
              {message.experimental_attachments &&
                message.experimental_attachments.length > 0 && (
                  <div className="mb-2 flex flex-row gap-1 sm:gap-2 flex-wrap">
                    {message.experimental_attachments.map((attachment, idx) => (
                      <AttachmentDisplay
                        key={idx}
                        attachment={{
                          name: attachment.name,
                          contentType: attachment.contentType,
                          url: attachment.url,
                          size: (attachment as any).size || 0,
                        }}
                      />
                    ))}
                  </div>
                )}

              {isEditing ? (
                <div className="bg-[#2f2f2f] rounded-2xl sm:rounded-3xl px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3">
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-white resize-none focus:outline-none text-sm sm:text-base min-h-[20px] sm:min-h-[24px]"
                    style={{ overflow: "hidden" }}
                  />
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="h-6 sm:h-7 px-2 sm:px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      disabled={
                        !editContent.trim() || editContent === message.content
                      }
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      variant="ghost"
                      className="h-6 sm:h-7 px-2 sm:px-3 text-white/70 hover:text-white hover:bg-white/10 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <span className="text-xs text-white/50 ml-auto hidden sm:inline">
                      Enter to save • Esc to cancel
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="bg-[#2f2f2f] rounded-2xl sm:rounded-3xl px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-white text-sm sm:text-base">
                    {message.content}
                  </div>

                  {/* Edit button - only show for user messages and when editable */}
                  {isEditable && onEditMessage && (isHovered || isEditing) && (
                    <Button
                      onClick={handleEdit}
                      size="sm"
                      variant="ghost"
                      className="absolute -left-8 sm:-left-10 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8 p-0 text-white/50 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
            <div className="flex-shrink-0">{AssistantIcon}</div>
            <div className="flex-1 text-white leading-6 sm:leading-7 min-w-0">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";
                      const isInline = !match && !className?.includes("\n");

                      if (!isInline && language) {
                        return (
                          <CodeBlock language={language}>
                            {String(children).replace(/\n$/, "")}
                          </CodeBlock>
                        );
                      }

                      return (
                        <code
                          className="bg-[#2f2f2f] text-orange-300 px-1 sm:px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return (
                        <p className="mb-3 sm:mb-4 last:mb-0 text-sm sm:text-base leading-relaxed">
                          {children}
                        </p>
                      );
                    },
                    h1({ children }) {
                      return (
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white">
                          {children}
                        </h1>
                      );
                    },
                    h2({ children }) {
                      return (
                        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-white">
                          {children}
                        </h2>
                      );
                    },
                    h3({ children }) {
                      return (
                        <h3 className="text-sm sm:text-base md:text-lg font-bold mb-2 sm:mb-3 text-white">
                          {children}
                        </h3>
                      );
                    },
                    ul({ children }) {
                      return (
                        <ul className="list-disc list-inside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base">
                          {children}
                        </ul>
                      );
                    },
                    ol({ children }) {
                      return (
                        <ol className="list-decimal list-inside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base">
                          {children}
                        </ol>
                      );
                    },
                    li({ children }) {
                      return <li className="text-white/90">{children}</li>;
                    },
                    strong({ children }) {
                      return (
                        <strong className="font-bold text-white">
                          {children}
                        </strong>
                      );
                    },
                    em({ children }) {
                      return (
                        <em className="italic text-white/90">{children}</em>
                      );
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {children}
                        </a>
                      );
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-gray-500 pl-3 sm:pl-4 italic text-white/80 my-3 sm:my-4">
                          {children}
                        </blockquote>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-3 sm:my-4">
                          <table className="min-w-full border-collapse border border-gray-600">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="border border-gray-600 px-2 sm:px-3 py-2 bg-[#2f2f2f] text-white font-semibold text-left text-xs sm:text-sm">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="border border-gray-600 px-2 sm:px-3 py-2 text-white/90 text-xs sm:text-sm">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
