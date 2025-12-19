export function DumpTruckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Truck cab */}
      <path d="M3 17h2" />
      <path d="M9 17h6" />
      <path d="M19 17h2" />

      {/* Wheels */}
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />

      {/* Truck body */}
      <path d="M5 15V9a2 2 0 0 1 2-2h8" />

      {/* Dump bed (raised) */}
      <path d="M15 7 l4 -3 l3 0 l0 8 l-7 3 z" />

      {/* Support */}
      <path d="M15 15h4" />
    </svg>
  )
}
