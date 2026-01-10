"use client"

export function Header() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 w-full">
      <h1 className="font-semibold text-gray-700">Dashboard Area</h1>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500" />
        <span className="text-sm">User Name</span>
      </div>
    </header>
  );
}
