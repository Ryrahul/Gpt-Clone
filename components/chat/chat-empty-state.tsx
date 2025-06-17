"use client";

export function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] sm:min-h-[50vh] px-4 sm:px-6">
      <h1 className="text-[34px] xs:text-[38px] sm:text-[42px] md:text-[46px] lg:text-[50px] leading-[38px] xs:leading-[42px] sm:leading-[46px] md:leading-[50px] lg:leading-[54px] font-light text-white text-center max-w-4xl">
        What's on your mind today?
      </h1>
    </div>
  );
}
