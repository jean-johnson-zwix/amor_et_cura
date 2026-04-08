import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden w-2/5 flex-col justify-between bg-navy px-10 py-12 lg:flex">
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          {/* Logo mark */}
          <div className="flex h-10 w-10 items-center justify-center rounded bg-teal">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.567 3.067 2 5 2C6.15 2 7.17 2.57 7.83 3.44L8 3.67L8.17 3.44C8.83 2.57 9.85 2 11 2C12.933 2 14.5 3.567 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-[24px] font-semibold text-white">Amor Et Cura</h1>
            <p className="mt-0.5 text-[14px] text-[#9CA3AF]">Case Management</p>
          </div>
          <p className="mt-2 text-center text-[14px] text-[#D1D5DB]">
            Built for nonprofits that care.
          </p>
        </div>
        <p className="text-center text-[11px] text-[#6B7280]">
          {process.env.NEXT_PUBLIC_ORG_NAME ?? 'Amor Et Cura'}
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-teal-tint px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-6 flex flex-col items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-navy">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.567 3.067 2 5 2C6.15 2 7.17 2.57 7.83 3.44L8 3.67L8.17 3.44C8.83 2.57 9.85 2 11 2C12.933 2 14.5 3.567 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
                  fill="white"
                />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-navy">Amor Et Cura</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
