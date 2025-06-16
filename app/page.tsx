"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/chat");
  }, [router]);

  return (
    <div className="flex h-screen bg-[#212121] items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  );
}
