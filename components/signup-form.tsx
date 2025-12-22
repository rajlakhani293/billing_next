"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
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
import { auth } from "@/lib/api/auth"

const SignupForm = ({ className, ...props }: React.ComponentProps<"div">) => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // State for OTP flow
  const [mobileNumber, setMobileNumber] = useState("")
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  
  const canRequestOTP = !isBlocked && otpAttempts < 3
  const incrementAttempts = () => setOtpAttempts(prev => prev + 1)
  
  // State for Step 3 form fields
  const [companyName, setCompanyName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

    const [sendOtpApi] = auth.useSendOtpMutation();
  const [verifyOtpApi] = auth.useVerifyOtpMutation();
  // const [registerApi] = auth.useRegisterMutation();

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
  
  // Step 3: Final Registration
  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple password validation check
    const checks = checkPasswordStrength(password)
    if (!checks.minLength || !checks.hasSpecialChar) {
      toast.error("Password does not meet the requirements.")
      return
    }

    setIsLoading(true)
    try {
      // **API CALL for FINAL REGISTRATION**
      // Pass mobileNumber, companyName, email, password
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Welcome! Account created successfully!")
      setTimeout(() => router.push("/login"), 1200)
    } catch (error: any) {
      toast.error("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength validation helper
  const checkPasswordStrength = (pw: string) => {
    return {
      minLength: pw.length >= 8,
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
      hasUpperCase: /[A-Z]/.test(pw),
      hasLowerCase: /[a-z]/.test(pw),
      hasNumber: /[0-9]/.test(pw)
    }
  }

  // Handle back button from OTP screen
  const handleBackToMobile = () => {
    setStep(1)
    setMobileNumber("")
  }

  return (
    <Card className={className} {...props}>
      <CardContent className="space-y-6">
        <div className="text-center">
            <h2 className="text-2xl font-bold">Create Your Account</h2>
        </div>
        
        {/* STEP 1: Mobile Number */}
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
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="text-primary hover:underline font-medium">
                  Sign In
                </a>
              </p>
            </div>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 2 && (
          <OTPVerification
            mobileNumber={mobileNumber}
            onBack={handleBackToMobile}
            onSuccess={() => {
              toast.success("OTP Verified! Redirecting to registration...")
              router.push(`/register?mobile=${mobileNumber}`)
            }}
            onSendOTP={sendOTP}
            onVerifyOTP={verifyOTP}
            currentAttempts={otpAttempts}
            isBlocked={isBlocked}
          />
        )}

        {/* STEP 3: Company Details */}
        {step === 3 && (
          <form className="space-y-6" onSubmit={registerUser}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
                <UnifiedInput 
                    id="companyName" 
                    name="companyName" 
                    type="text" 
                    placeholder="Your Company Pvt Ltd" 
                    required 
                    disabled={isLoading} 
                    value={companyName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCompanyName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Business Email</FieldLabel>
                <UnifiedInput 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="contact@company.com" 
                    required 
                    disabled={isLoading} 
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <UnifiedInput 
                    id="password" 
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create strong password" 
                    required 
                    disabled={isLoading}
                    className="pr-12"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <HideIcon className="size-5" />
                    ) : (
                      <ViewIcon className="size-5" />
                    )}
                  </button>
                </div>
                <FieldDescription>
                  Must be at least 8 characters long and include a special character.
                </FieldDescription>
              </Field>
              <Button 
                  type="submit" 
                  disabled={isLoading || !checkPasswordStrength(password).minLength || !checkPasswordStrength(password).hasSpecialChar} 
                  className="w-full"
              >
                {isLoading ? "Creating Account..." : "Complete Registration"}
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default SignupForm;