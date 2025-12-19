"use client"

import React, { useState, useEffect, useCallback } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { MdEdit,MdOutlineDangerous } from "react-icons/md"

// --- Constants ---
const OTP_LIMIT = 3
const OTP_TIMER_SECONDS = 3

interface OTPVerificationProps {
  mobileNumber: string
  onBack: () => void
  onSuccess: () => void
  className?: string
  onSendOTP: (mobile: string, showToast?: boolean) => Promise<boolean>
  onVerifyOTP: (otp: string) => Promise<boolean>
  currentAttempts: number
  isBlocked: boolean
}

export function OTPVerification({ 
  mobileNumber, 
  onBack, 
  onSuccess, 
  className,
  onSendOTP,
  onVerifyOTP,
  currentAttempts,
  isBlocked
}: OTPVerificationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [otpError, setOtpError] = useState(false)
  const [timer, setTimer] = useState(OTP_TIMER_SECONDS)
  const [canResend, setCanResend] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [devOtp, setDevOtp] = useState("123456") 

  // Timer effect for OTP resend
  useEffect(() => {
    // If blocked, no timer needed
    if (isBlocked) {
      setTimer(0)
      setCanResend(false)
      return
    }

    let interval: NodeJS.Timeout
    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Timer finished, check if this was the 3rd attempt
            if (currentAttempts >= OTP_LIMIT) {
              // Show OTP limit message after timer finishes on 3rd attempt
              toast.error("Too many failed OTP requests. OTP limit reached.")
              setCanResend(false)
            } else {
              setCanResend(true)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [canResend, timer, isBlocked, currentAttempts])

  // Resend OTP function (calls the parent's logic)
  const resendOtp = async () => {
    if (isBlocked) {
      toast.error("You are blocked from requesting more OTPs.")
      return
    }

    if (!canResend) {
      toast.error(`Please wait ${timer} seconds before requesting again`)
      return
    }
    
    setIsLoading(true)
    setCanResend(false) 

    const success = await onSendOTP(mobileNumber, true)
    
    if (success) {
      setTimer(OTP_TIMER_SECONDS)
      setDevOtp("123456") 
    } else {
      setCanResend(true) 
    }

    setIsLoading(false)
  }

  // Verify OTP function (calls the parent's logic)
  const handleVerifyOTP = async (otp: string) => {
    if (otp.length !== 6) {
      toast.error(`Please enter all 6 digits (current: ${otp.length})`)
      return
    }

    setIsLoading(true)
    setOtpError(false)
    
    const isSuccess = await onVerifyOTP(otp) 

    if (isSuccess) {
      toast.success("OTP Verified Successfully!")
      setTimeout(() => {
        onSuccess()
      }, 500)
    } else {
      setOtpError(true)
      toast.error("Invalid or expired OTP")
    }
    
    setIsLoading(false)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dev/Demo OTP Display */}
      {devOtp && (
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Demo OTP: <strong>{devOtp}</strong>
          </p>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Enter verification code</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="text-base text-gray-700 dark:text-gray-300">
            We sent a 6-digit code to 
          </p>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            +91 {mobileNumber}
          </p>
          <button
            type="button"
            onClick={onBack}
            disabled={isBlocked || isLoading}
            className="text-black hover:text-black/80 transition disabled:opacity-50 dark:text-white dark:hover:text-gray-300"
            aria-label="Edit Mobile Number"
          >
           <MdEdit className="size-4"/>
          </button>
        </div>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center">
        <InputOTP 
          maxLength={6} 
          id="otp" 
          required 
          className="gap-3"
          value={otpValue}
          onChange={(value) => {
            setOtpValue(value)
            setOtpError(false) // Clear error on change
          }}
          onComplete={handleVerifyOTP} // Auto-verify on completion
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} className="h-12 w-12 text-xl" />
            <InputOTPSlot index={1} className="h-12 w-12 text-xl" />
            <InputOTPSlot index={2} className="h-12 w-12 text-xl" />
            <InputOTPSlot index={3} className="h-12 w-12 text-xl" />
            <InputOTPSlot index={4} className="h-12 w-12 text-xl" />
            <InputOTPSlot index={5} className="h-12 w-12 text-xl" />
          </InputOTPGroup>
        </InputOTP>
      </div>
      
      {/* Error State */}
      {otpError && (
        <p className="text-sm text-center text-red-600 dark:text-red-400">
          Invalid or expired OTP. Please try again.
        </p>
      )}

      {/* Action Buttons & Resend Logic */}
      <div className="space-y-4">
        <Button 
          onClick={() => handleVerifyOTP(otpValue)}
          disabled={isLoading || isBlocked || otpValue.length !== 6}
          className="w-full"
        >
          {isLoading ? "Verifying..." : "Verify & Continue"}
        </Button>

        {!isBlocked ? (
          <div className="flex items-center justify-center gap-1 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                type="button"
                onClick={resendOtp}
                disabled={isLoading}
                className="text-sm text-primary hover:text-primary/80 font-medium transition underline hover:cursor-pointer disabled:opacity-50"
              >
                Resend OTP
              </button>
            ) : (
              <span className="text-sm text-muted-foreground">
                Resend in {timer}s
              </span>
            )}
          </div>
        ) : (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
            <MdOutlineDangerous className="size-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-600 dark:text-red-400">
              You've exceeded the OTP limit ({OTP_LIMIT} attempts). Please contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}