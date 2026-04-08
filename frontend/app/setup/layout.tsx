export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F3EF] flex items-center justify-center p-6">
      {children}
    </div>
  )
}
