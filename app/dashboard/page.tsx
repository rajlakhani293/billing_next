"use client"

import { useSession } from "@/hooks/useSession"

export default function Page() {
  const { user } = useSession()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your dashboard</p>
      <p className="text-muted-foreground">User: {user?.name}</p>
    </div>
  )
}
