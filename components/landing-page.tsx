"use client";

import type React from "react";
import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { autoResizeTextarea } from "@/lib/utils";

export function LandingPage() {
  const [input, setInput] = useState("");
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    autoResizeTextarea(textareaRef);
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      // Show sign-in prompt when user tries to send a message
      setShowSignInPrompt(true);
    },
    [input]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (input.trim()) {
          setShowSignInPrompt(true);
        }
      }
    },
    [input]
  );

  const handleSignIn = () => {
    // Store the message in sessionStorage so we can restore it after sign-in
    if (input.trim()) {
      sessionStorage.setItem("pendingMessage", input);
    }
    router.push("/sign-in");
  };

  const handleSignUp = () => {
    // Store the message in sessionStorage so we can restore it after sign-up
    if (input.trim()) {
      sessionStorage.setItem("pendingMessage", input);
    }
    router.push("/sign-up");
  };

  const AssistantIcon = (
    <div className="w-8 h-8 bg-[#10a37f] rounded-full flex items-center justify-center">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        className="text-white"
      >
        <path
          d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#212121] overflow-hidden">
      {/* Sign-in Prompt Modal */}
      {showSignInPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2f2f2f] rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#10a37f] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">
                Sign in to continue
              </h2>
              <p className="text-white/70 mb-8">
                You need to sign in to start chatting with ChatGPT. Your message
                will be saved and sent after you sign in.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleSignIn}
                  className="w-full bg-[#10a37f] hover:bg-[#0d8f6f] text-white font-medium py-3 rounded-xl"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleSignUp}
                  className="w-full bg-transparent border border-white/20 text-white hover:bg-white/10 font-medium py-3 rounded-xl"
                >
                  Create Account
                </Button>
                <Button
                  onClick={() => setShowSignInPrompt(false)}
                  className="w-full bg-transparent text-white/70 hover:text-white font-medium py-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#212121]">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium text-white">ChatGPT</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/sign-in")}
              className="bg-transparent border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg"
            >
              Sign In
            </Button>
            <Button
              onClick={() => router.push("/sign-up")}
              className="bg-[#10a37f] hover:bg-[#0d8f6f] text-white px-4 py-2 rounded-lg"
            >
              Sign Up
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden bg-[#212121]">
          <ScrollArea className="h-full">
            <div className="w-full pb-4">
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4">
                <div className="w-12 h-12 bg-[#10a37f] rounded-full flex items-center justify-center mb-6">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-white"
                  >
                    <path
                      d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-semibold text-white mb-4">
                  How can I help you today?
                </h1>
                <p className="text-white/60 text-center max-w-md mb-8">
                  Start typing your question below. You'll be prompted to sign
                  in when you're ready to send your message.
                </p>

                {/* Example prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
                  <button
                    onClick={() =>
                      setInput("Explain quantum computing in simple terms")
                    }
                    className="p-4 bg-[#2f2f2f] rounded-xl text-left text-white hover:bg-[#3f3f3f] transition-colors border border-white/10"
                  >
                    <div className="font-medium mb-2">💡 Explain concepts</div>
                    <div className="text-sm text-white/70">
                      Explain quantum computing in simple terms
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      setInput("Write a Python function to sort a list")
                    }
                    className="p-4 bg-[#2f2f2f] rounded-xl text-left text-white hover:bg-[#3f3f3f] transition-colors border border-white/10"
                  >
                    <div className="font-medium mb-2">💻 Code assistance</div>
                    <div className="text-sm text-white/70">
                      Write a Python function to sort a list
                    </div>
                  </button>
                  <button
                    onClick={() => setInput("Plan a 7-day trip to Japan")}
                    className="p-4 bg-[#2f2f2f] rounded-xl text-left text-white hover:bg-[#3f3f3f] transition-colors border border-white/10"
                  >
                    <div className="font-medium mb-2">🗺️ Plan & organize</div>
                    <div className="text-sm text-white/70">
                      Plan a 7-day trip to Japan
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      setInput("Help me write a professional email")
                    }
                    className="p-4 bg-[#2f2f2f] rounded-xl text-left text-white hover:bg-[#3f3f3f] transition-colors border border-white/10"
                  >
                    <div className="font-medium mb-2">✍️ Writing help</div>
                    <div className="text-sm text-white/70">
                      Help me write a professional email
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 left-0 right-0 w-full bg-[#212121] border-t border-white/10 z-10">
          <div className="max-w-3xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-end bg-[#2f2f2f] rounded-3xl border border-white/20">
                <Button
                  type="button"
                  className="absolute left-3 bottom-3 p-2 rounded-full bg-transparent hover:bg-white/10 text-white/70 hover:text-white h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="flex-1 resize-none bg-transparent text-white placeholder-white/50 py-3 px-12 focus:outline-none max-h-[200px] min-h-[24px] overflow-y-auto"
                  style={{
                    height: "auto",
                    overflowY: "hidden",
                  }}
                  rows={1}
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <Button
                    type="button"
                    className="p-2 rounded-full bg-transparent hover:bg-white/10 text-white/70 hover:text-white h-8 w-8"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2 rounded-full disabled:text-white/30 text-white transition-colors disabled:opacity-40 bg-white hover:bg-white/90 disabled:hover:bg-white/30 h-8 w-8"
                  >
                    <Send className="h-4 w-4 text-black" />
                  </Button>
                </div>
              </div>
            </form>
            <div className="text-center text-xs text-white/50 mt-3">
              <span>Sign in to start chatting with ChatGPT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
