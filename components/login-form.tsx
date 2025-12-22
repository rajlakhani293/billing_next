"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { OTPVerification } from "@/components/otp-verification"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { ViewIcon, HideIcon } from "@/components/AppIcon"
import { UnifiedInput } from "./ui/unified-input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<"otp" | "email">("otp")
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // State for OTP flow
  const [mobileNumber, setMobileNumber] = useState("")
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  
  const canRequestOTP = !isBlocked && otpAttempts < 3
  const incrementAttempts = () => setOtpAttempts(prev => prev + 1)
  
  // State for Email/Password flow
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Centralized Send OTP logic
  const sendOTP = useCallback(async (mobile: string, showToast = true): Promise<boolean> => {
    if (!canRequestOTP) {
      if (showToast) toast.error("You have exceeded the OTP limit. Please contact support.")
      return false
    }
    
    if (!mobile || mobile.length !== 10) {
      if (showToast) toast.error("Please enter a valid 10-digit phone number")
      return false
    }
    
    setIsLoading(true)
    let success = false
    try {
      // **API CALL for SEND OTP**
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMobileNumber(mobile) // Update mobile number state
      incrementAttempts() // Increment global attempts
      
      if (showToast) toast.success("OTP sent successfully!")
      success = true
    } catch (error: any) {
      if (showToast) toast.error("Failed to send OTP. Try again.")
    } finally {
      setIsLoading(false)
    }
    return success
  }, [canRequestOTP, incrementAttempts])
  
  // Handle form submission for mobile number (Step 1)
  const handleSendOTPForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const mobile = (e.currentTarget.elements.namedItem('mobile') as HTMLInputElement)?.value || ''
    
    const success = await sendOTP(mobile, true)
    if (success) {
      // Only move to step 2 if the API call was successful
      setStep(2)
    }
  }
  
  // Centralized Verify OTP logic
  const verifyOTP = useCallback(async (otp: string): Promise<boolean> => {
    // **API CALL for VERIFY OTP**
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Demo verification logic
    if (otp === "123456") {
      return true
    }
    return false
  }, [])

  // Login with email and password
  const loginWithEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please enter both email and password")
      return
    }

    setIsLoading(true)
    try {
      // **API CALL for EMAIL/PASSWORD Login**
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email === "test@example.com" && password === "password") {
        toast.success("Login successful!")
        setTimeout(() => router.push("/dashboard"), 1000)
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error: any) {
      toast.error("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle back button from OTP screen
  const handleBackToMobile = () => {
    setStep(1)
    // IMPORTANT: Reset mobile number if user goes back to enter a new one
    setMobileNumber("")
  }

  return (
    <Card className={className} {...props}>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          {step === 1 && (
            <p className="text-muted-foreground text-sm text-balance">
              Choose your preferred login method
            </p>
          )}
        </div>

        {/* Login Method Toggle */}
        {(loginMethod === "otp" && step === 1 || loginMethod === "email") && (
          <div className="relative flex rounded-lg border p-1 bg-muted/50">
            <div 
              className="absolute top-1 bottom-1 bg-primary rounded-md shadow-sm transition-all duration-300 ease-out"
              style={{
                left: loginMethod === "otp" ? "4px" : "50%",
                right: loginMethod === "otp" ? "50%" : "4px",
                width: "calc(50% - 4px)"
              }}
            />
            <button
              type="button"
              onClick={() => {
                setLoginMethod("otp")
                setStep(1)
                setMobileNumber("")
              }}
              className={cn(
                "relative flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 ease-out z-10",
                loginMethod === "otp" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              disabled={isLoading}
            >
              Phone OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod("email")
                setStep(1)
              }}
              className={cn(
                "relative flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-300 ease-out z-10",
                loginMethod === "email" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              disabled={isLoading}
            >
              Email Password
            </button>
          </div>
        )}

        {/* OTP Login Method */}
        {loginMethod === "otp" && (
          <>
            {/* Step 1: Mobile Input */}
            {step === 1 && (
              <form className="space-y-6" onSubmit={handleSendOTPForm}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="mobile">Mobile Number</FieldLabel>
                    <UnifiedInput 
                      id="mobile" 
                      name="mobile"
                      type="tel" 
                      prefix="+91"
                      placeholder="Enter 10-digit mobile number" 
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      required 
                      disabled={isLoading}
                      value={mobileNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setMobileNumber(e.target.value)}
                    />
                    <FieldDescription>
                      We'll send a verification code to this number
                    </FieldDescription>
                  </Field>
                  <Button type="submit" disabled={isLoading || mobileNumber.length !== 10 || !canRequestOTP} className="w-full">
                    {isLoading ? "Sending OTP..." : isBlocked ? "OTP Limit Reached" : "Send Verification Code"}
                  </Button>
                </FieldGroup>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <OTPVerification
                mobileNumber={mobileNumber}
                onBack={handleBackToMobile}
                onSuccess={() => {
                  toast.success("Login successful!")
                  setTimeout(() => router.push("/dashboard"), 1000)
                }}
                onSendOTP={sendOTP}
                onVerifyOTP={verifyOTP}
                currentAttempts={otpAttempts}
                isBlocked={isBlocked}
              />
            )}
          </>
        )}

        {/* Email/Password Login Method */}
        {loginMethod === "email" && (
          <form onSubmit={loginWithEmailPassword} className="space-y-6">
            <FieldGroup>
              <Field>
                <UnifiedInput 
                label="Email"
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="m@example.com" 
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEmail(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline text-primary"
                  >
                    Forgot your password?
                  </a>
                </div>
                <UnifiedInput
                id="password" 
                    name="password"
                    placeholder="******"
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPassword(e.target.value)}
                    required 
                    disabled={isLoading}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <HideIcon className="size-5" />
                        ) : (
                          <ViewIcon className="size-5" />
                        )}
                      </button>
                    }
                />
              </Field>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </FieldGroup>
          </form>
        )}

        {/* Sign up link - Hide when in OTP step 2 */}
        {(loginMethod === "email" || (loginMethod === "otp" && step === 1)) && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}