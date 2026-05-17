/**
 * Navbar.tsx — macOS-style floating pill navbar.
 *
 * Shape:   rounded-full capsule, centered, not full-width
 * Surface: glassmorphism — frosted blur + translucent dark
 * Glow:    inset top highlight = the "tubelight" effect
 */

import Link from "next/link";

export function Navbar() {
  return (
    /* Outer container — full-width sticky row for positioning */
    <header className="sticky top-0 z-50 flex justify-center px-4 pt-3 pb-2 pointer-events-none">
      {/* The pill */}
      <nav
        className="pointer-events-auto flex items-center gap-1 px-2 py-1.5"
        style={{
          borderRadius: "9999px",
          /* Glassmorphism surface */
          background: "rgba(10, 10, 22, 0.55)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          /* The tubelight: bright line at the top edge */
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -1px 0 rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.07),
            0 8px 32px rgba(0, 0, 0, 0.45),
            0 2px 8px rgba(0, 0, 0, 0.3)
          `,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 pl-2.5 pr-3.5 py-1 rounded-full group
                     focus:outline-none
                     hover:bg-white/[0.05] transition-colors duration-150"
        >
          {/* Icon */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                        transition-all duration-200 group-hover:shadow-glow-sm"
            style={{
              background: "rgba(255,255,255,0.08)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>

          <span className="text-[13px] font-semibold tracking-tight text-white/85
                           group-hover:text-white transition-colors duration-150">
            ImagineX
          </span>
        </Link>

        {/* Divider */}
        <div className="w-px h-4 mx-0.5 flex-shrink-0"
             style={{ background: "rgba(255,255,255,0.1)" }} />

        {/* Nav links */}
        <NavLink href="/"        label="Generate" />
        <NavLink href="/gallery" label="Gallery"  />
      </nav>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3.5 py-1.5 rounded-full text-[13px] font-medium
                 text-white/60 hover:text-white hover:bg-white/[0.07]
                 transition-all duration-150
                 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
    >
      {label}
    </Link>
  );
}
