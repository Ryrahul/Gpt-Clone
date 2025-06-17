"use client";

import type React from "react";
import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Send,
  Paperclip,
  Search,
  FileText,
  Lightbulb,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";
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
    if (input.trim()) {
      sessionStorage.setItem("pendingMessage", input);
    }
    router.push("/sign-in");
  };

  const handleSignUp = () => {
    if (input.trim()) {
      sessionStorage.setItem("pendingMessage", input);
    }
    router.push("/sign-up");
  };

  const handleQuickAction = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-screen bg-[#212121] overflow-hidden">
      {showSignInPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2f2f2f] rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 border border-white/10">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#10a37f] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white sm:w-8 sm:h-8"
                >
                  <path
                    d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142-.0852 4.783-2.7582a.7712.7712 0 0 0 .7806 0l5.8428 3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">
                Sign in to continue
              </h2>
              <p className="text-white/70 mb-6 sm:mb-8 text-sm sm:text-base">
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

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-[#212121]">
          <div className="flex items-center gap-2">
            <h1 className="text-[#FEFEFE] text-[17px] leading-[24px] font-light">
              ChatGPT
            </h1>
            <svg
              className="w-4 h-4 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => router.push("/sign-in")}
              className="bg-transparent border border-white/20 text-white hover:bg-white/10 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-light"
            >
              Log in
            </Button>
            <Button
              onClick={() => router.push("/sign-up")}
              className="bg-white hover:bg-white/90 text-black px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium"
            >
              Sign up for free
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32 relative">
          <div className="w-full max-w-3xl text-center">
            <h1 className="text-[#FEFEFE] text-[32px] leading-[40px] font-light mb-8">
              What's on the agenda today?
            </h1>

            {/* Main Input */}
            <div className="mb-6">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center bg-[#2f2f2f] rounded-3xl border border-white/20 shadow-lg min-h-[60px]">
                  {/* Left side buttons */}
                  <div className="flex items-center gap-2 pl-4">
                    <Button
                      type="button"
                      onClick={() => setShowSignInPrompt(true)}
                      className="flex items-center gap-2 bg-[#404040] hover:bg-[#4a4a4a] text-white px-3 py-1.5 rounded-full text-sm font-medium border-0"
                    >
                      <Paperclip className="h-4 w-4" />
                      Attach
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowSignInPrompt(true)}
                      className="flex items-center gap-2 bg-[#404040] hover:bg-[#4a4a4a] text-white px-3 py-1.5 rounded-full text-sm font-medium border-0"
                    >
                      <Search className="h-4 w-4" />
                      Search
                    </Button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything"
                    className="flex-1 resize-none bg-transparent text-white placeholder-white/50 py-4 px-4 focus:outline-none max-h-[200px] min-h-[60px] overflow-y-auto text-base"
                    style={{
                      height: "auto",
                      overflowY: "hidden",
                    }}
                    rows={1}
                  />

                  {/* Right side send button */}
                  <div className="pr-4">
                    <Button
                      type="submit"
                      disabled={!input.trim()}
                      className="p-2 rounded-full disabled:text-white/30 text-black transition-colors disabled:opacity-40 bg-white hover:bg-white/90 disabled:hover:bg-white/30 h-8 w-8"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto">
              <Button
                onClick={() => handleQuickAction("Summarize this text")}
                className="flex items-center gap-2 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full border border-white/20 text-sm font-light"
              >
                <FileText className="h-4 w-4" />
                Summarize text
              </Button>
              <Button
                onClick={() => handleQuickAction("Help me brainstorm ideas")}
                className="flex items-center gap-2 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full border border-white/20 text-sm font-light"
              >
                <Lightbulb className="h-4 w-4" />
                Brainstorm
              </Button>
              <Button
                onClick={() => handleQuickAction("Analyze this data")}
                className="flex items-center gap-2 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full border border-white/20 text-sm font-light"
              >
                <BarChart3 className="h-4 w-4" />
                Analyze data
              </Button>
              <Button
                onClick={() =>
                  handleQuickAction("Surprise me with something interesting")
                }
                className="flex items-center gap-2 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full border border-white/20 text-sm font-light"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Surprise me
              </Button>
              <Button
                onClick={() => setShowSignInPrompt(true)}
                className="flex items-center gap-2 bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white px-4 py-2 rounded-full border border-white/20 text-sm font-light"
              >
                <MoreHorizontal className="h-4 w-4" />
                More
              </Button>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="absolute bottom-4 left-0 right-0 text-center px-4">
          <p className="text-white/50 text-sm">
            By messaging ChatGPT, you agree to our{" "}
            <a href="#" className="underline hover:text-white/70">
              Terms
            </a>{" "}
            and have read our{" "}
            <a href="#" className="underline hover:text-white/70">
              Privacy Policy
            </a>
            . See{" "}
            <a href="#" className="underline hover:text-white/70">
              Cookie Preferences
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
