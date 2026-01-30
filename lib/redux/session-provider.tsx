"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Cookies from 'js-cookie'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/lib/api/auth'
import { setSessionData, clearSessionData } from '@/lib/redux/sessionSlice'
import type { AppDispatch, RootState } from '@/lib/redux/store'
import toast from 'react-hot-toast'

interface SessionContextType {
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const [isLoading, setIsLoading] = useState(false)
  const [getSessionData] = auth.useGetSessionDataMutation()

  const loadSessionData = async () => {
    
    const token = Cookies.get("token")
    const userId = Cookies.get("user_id")
    const shopId = Cookies.get("shop_id")
    
    console.log("🍪 Cookies check:", { token: !!token, userId: !!userId, shopId: !!shopId });
    console.log("🍪 Cookies values:", { token, userId, shopId });
        
    // Robust parsing of IDs
    const parsedUserId = userId && userId !== "undefined" ? parseInt(userId) : null;
    const parsedShopId = shopId && shopId !== "undefined" ? parseInt(shopId) : null;

    if (!token || !parsedUserId || !parsedShopId || isNaN(parsedUserId) || isNaN(parsedShopId)) {
      console.log("❌ Missing or invalid cookies/IDs, clearing session and returning");
      // If we have a token but missing IDs, we should clear everything to prevent zombie state
      if (token && (!parsedUserId || !parsedShopId)) {
          clearSession();
      } else {
          dispatch(clearSessionData());
      }
      return
    }

    setIsLoading(true)
    try {
      const userData = {
        id: parsedUserId,
        shop_id: parsedShopId,
      }

      if (userData.id && userData.shop_id) {
        const sessionResponse = await getSessionData({
          user_id: userData.id,
          shop_id: userData.shop_id,
        }) as any

        if (sessionResponse?.data?.data) {
          const data = sessionResponse.data.data
          dispatch(setSessionData(data))
          
          // Sliding Expiration: Refresh cookies to 1 day from now
          Cookies.set("token", token, { expires: 1, path: "/" });
          Cookies.set("user_id", userData.id.toString(), { expires: 1, path: "/" });
          Cookies.set("shop_id", userData.shop_id.toString(), { expires: 1, path: "/" });
        }
      } else {
        toast.error("Something went wrong")
        clearSession() // Use clearSession to remove cookies as well
      }
    } catch (error) {
      toast.error(typeof error === 'string' ? error : "Session load failed")
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    await loadSessionData()
  }

  const router = useRouter()
  const pathname = usePathname()

  const clearSession = () => {
    dispatch(clearSessionData())
    Cookies.remove("token", { path: "/" })
    Cookies.remove("user_id", { path: "/" })
    Cookies.remove("shop_id", { path: "/" })
    
    // Only redirect if we are not already on a public page (like login/signup)
    // Adjust this list based on your public routes
    const publicRoutes = ['/login', '/signup', '/forgot-password']
    if (!publicRoutes.some(route => pathname.startsWith(route))) {
        router.push("/login")
    }
  }

  useEffect(() => {
    loadSessionData()
  }, []) 

  const value = {
    isLoading,
    refreshSession,
    clearSession,
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}
