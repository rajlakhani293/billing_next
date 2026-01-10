"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Cookies from 'js-cookie'
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
  const { isSessionLoaded } = useSelector((state: RootState) => state.session)
  const [getSessionData] = auth.useGetSessionDataMutation()

  const loadSessionData = async () => {
    
    const token = Cookies.get("token")
    const userId = Cookies.get("user_id")
    const shopId = Cookies.get("shop_id")
        
    if (!token || !userId || !shopId) {
      dispatch(clearSessionData())
      return
    }
    setIsLoading(true)
    try {
      const userData = {
        id: parseInt(userId),
        shop_id: parseInt(shopId),
      }

      if (userData.id && userData.shop_id) {
        const sessionResponse = await getSessionData({
          user_id: userData.id,
          shop_id: userData.shop_id,
        }) as any

        if (sessionResponse?.data?.data) {
          const data = sessionResponse.data.data
          dispatch(setSessionData(data))
        }
      } else {
        toast.error("Something went wrong")
        dispatch(clearSessionData())
      }
    } catch (error) {
      toast.error(error)
      dispatch(clearSessionData())
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    await loadSessionData()
  }

  const clearSession = () => {
    dispatch(clearSessionData())
    Cookies.remove("token")
    Cookies.remove("user_id")
    Cookies.remove("shop_id")
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
