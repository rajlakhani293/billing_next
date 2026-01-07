"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Cookies from 'js-cookie'
import { auth } from '@/lib/api/auth'
import { setSessionData, clearSessionData } from '@/lib/redux/sessionSlice'
import type { AppDispatch, RootState } from '@/lib/redux/store'

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
  const { isSessionLoaded } = useSelector((state: RootState) => state.session)
  const [getSessionData] = auth.useGetSessionDataMutation()

  const loadSessionData = async () => {
    console.log("🔍 loadSessionData called")
    console.log("🍪 All cookies:", document.cookie)
    
    const token = Cookies.get("token")
    const userId = Cookies.get("user_id")
    const shopId = Cookies.get("shop_id")
    
    console.log("🔍 Individual cookies:", {
      token: token ? "✅" : "❌",
      user_id: userId,
      shop_id: shopId
    })
    
    if (!token) {
      console.log("❌ No token found, returning early")
      return
    }

    console.log("✅ Token found, proceeding with session data load")
    setIsLoading(true)
    try {
      // Get user data from token or stored user info
      const userData = {
        id: parseInt(userId || "0"),
        shop_id: parseInt(shopId || "0"),
      }

      console.log("🔍 User data from cookies:", userData)

      if (userData.id && userData.shop_id) {
        console.log("✅ User data valid, calling getSessionData API")
        // Fetch session data (includes user, shop, menus, modules, permissions)
        const sessionResponse = await getSessionData({
          user_id: userData.id,
          shop_id: userData.shop_id,
        }) as any

        console.log("session-provider--------------- 51",sessionResponse)

        if (sessionResponse?.data?.data) {
          const data = sessionResponse.data.data
          console.log("✅ Session data received:", data)
          dispatch(setSessionData({
            user: data.user,
            shop: data.shop,
            menus: data.menus || [],
            modules: data.modules || [],
            permissions: data.permissions || [],
          }))
          console.log("✅ Session data stored in Redux")
        } else {
          console.log("❌ Invalid session data:", sessionResponse)
        }
      } else {
        console.log("❌ Invalid user data:", userData)
      }
    } catch (error) {
      console.error("❌ Failed to load session data:", error)
      dispatch(clearSessionData())
      console.log("❌ Session data cleared")
    } finally {
      console.log("🏁 loadSessionData finished")
      setIsLoading(false)
      console.log("✅ isLoading set to false")
    }
  }

  const refreshSession = async () => {
    console.log("🔄 refreshSession called")
    await loadSessionData()
    console.log("✅ Session refreshed")
  }

  const clearSession = () => {
    dispatch(clearSessionData())
    Cookies.remove("token")
    Cookies.remove("refreshToken")
    Cookies.remove("user_id")
    Cookies.remove("shop_id")
  }

  useEffect(() => {
    console.log("🚀 SessionProvider useEffect mounted")
    // Load session data once on component mount
    loadSessionData()
  }, []) // Empty dependency array = load once on mount

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
