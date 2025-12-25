"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import Cookies from "js-cookie"
import { useDispatch } from "react-redux"
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
import { auth } from "@/lib/api/auth"
import { setUnauthorized } from "@/lib/redux/sessionSlice"
import type { AppDispatch } from "@/lib/redux/store"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [loginMethod, setLoginMethod] = useState<"otp" | "email">("otp")
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // State for OTP flow
  const [mobileNumber, setMobileNumber] = useState("")
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [otp, setOtp] = useState("")
  const [isBlocked, setIsBlocked] = useState(false)
  const [registrationToken, setRegistrationToken] = useState("")
  
  const [sendLoginOtpApi] = auth.useSendLoginOtpMutation();
  const [signinApi] = auth.useSigninMutation();
  const [getSessionData] = auth.useGetSessionDataMutation();
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
      const response = await sendLoginOtpApi({ phone_number: `+91${mobile}` }).unwrap()

      if (response.code === 200) {
        setMobileNumber(mobile) // Update mobile number state
        incrementAttempts()
        setOtp(response.data.otp_code)
        toast.success(response.message)
        success = true
      } else {
        toast.error(response.message || "Failed to send OTP")
      }
    } catch (error: any) {
      if (showToast) toast.error(error.data?.message || "Failed to send OTP. Try again.")
    } finally {
      setIsLoading(false)
    }
    return success
  }, [canRequestOTP, incrementAttempts, sendLoginOtpApi])
  
  // Handle form submission for mobile number (Step 1)
  const handleSendOTPForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const mobile = (e.currentTarget.elements.namedItem('mobile') as HTMLInputElement)?.value || ''
    
    const success = await sendOTP(mobile, true)
    if (success) {
      setStep(2)
    }
  }
  
  // Centralized Verify OTP logic
  const verifyOTP = useCallback(async (otp: string): Promise<string | null> => {
    try {
      const result = await signinApi({
        phone_number: `+91${mobileNumber}`,
        otp_code: otp
      }).unwrap()

      if (result.code === 200) {
        const token = result?.data?.access;
        const refreshToken = result?.data?.refresh;
        
        // Set tokens in cookies with proper expiry
        Cookies.set("token", token, { 
          expires: 1,
          path: "/dashboard" 
        });
        Cookies.set("refreshToken", refreshToken, { 
          expires: 30,
          path: "/dashboard" 
        });
        
        setRegistrationToken(token)
        
        // Fetch session data after successful login
        const userData = {
          id: result?.data?.user_id,
          shop_id: result?.data?.shop_id,
        };
        
        if (userData?.id && userData?.shop_id) {
          try {
            const sessionData = await getSessionData({
              user_id: userData.id,
              shop_id: userData.shop_id,
            }) as any;
            
            if (sessionData?.data?.data) {
              console.log("Session data fetched:", sessionData.data.data);
            } else {
              dispatch(setUnauthorized(true));
            }
          } catch (error) {
            console.error("Error fetching session data:", error);
            dispatch(setUnauthorized(true));
          }
        } else {
          dispatch(setUnauthorized(true));
        }
        
        return token
      } else {
        toast.error(result.message || "OTP verification failed")
        return null
      }
    } catch (error: any) {
      toast.error(error.data?.message || "OTP verification failed. Try again.")
      return null
    }
  }, [mobileNumber, signinApi, getSessionData, dispatch])

  // Login with email and password
  const loginWithEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Please enter both email and password")
      return
    }

    setIsLoading(true)
    try {
      const response = await signinApi({
        email: email,
        password: password,
      }).unwrap()

      console.log("User login successfully:", response)
      const token = response?.data?.access

      if (token) {
        toast.success("User Login successfully!")
        // Store token in cookie like reference implementation
        Cookies.set("token", token, {
          expires: 1,
          path: "/",
        })

        const refreshToken = response?.data?.refresh
        if (refreshToken) {
          Cookies.set("refreshToken", refreshToken, {
            expires: 30,
            path: "/",
          })
        }

        const userData = response?.data

        if (userData?.user_id && userData?.shop_id) {
          try {
            const sessionData = await getSessionData({
              user_id: userData.user_id,
              shop_id: userData.shop_id,
            }) as any;
            
            if (sessionData?.data?.data) {
              console.log("Session data fetched:", sessionData.data.data)
            } else {
              dispatch(setUnauthorized(true))
            }
          } catch (error) {
            console.error("Error fetching session data:", error)
            dispatch(setUnauthorized(true))
          }
        } else {
          dispatch(setUnauthorized(true))
        }
        
        setTimeout(() => {
          router.push("/dashboard")
        }, 100)
      } else {
        toast.error("Invalid Credentials")
      }
    } catch (error: any) {
      console.error("Error login user:", error)
      const errorMessage = error?.data?.message || "Something went wrong! Please try again."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
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
                onSuccess={(token) => {
                  if (token) {
                    toast.success("Login successful!")
                    setTimeout(() => router.push("/dashboard"), 1000)
                  } else {
                    toast.error("Login token not available")
                  }
                }}
                onSendOTP={sendOTP}
                onVerifyOTP={verifyOTP}
                currentAttempts={otpAttempts}
                isBlocked={isBlocked}
                demoOtp={otp}
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