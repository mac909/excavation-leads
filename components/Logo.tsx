export default function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-none bg-amber-500 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[60%] w-[60%]"
        aria-hidden
      >
        {/* hard hat */}
        <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1Z" />
        <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
        <path d="M4 15v-3a6 6 0 0 1 6-6" />
        <path d="M14 6a6 6 0 0 1 6 6v3" />
      </svg>
    </span>
  );
}
