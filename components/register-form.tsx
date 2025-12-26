"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { UnifiedInput } from "@/components/ui/unified-input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImagePlusIcon } from "./AppIcon"
import { useScrollToError } from "@/lib/hooks/index"
import { auth } from "@/lib/api/auth"
import { Card, CardContent } from "./ui/card"
import { locations } from "@/lib/api/locations"

interface RegisterForm {
  companyLogo: File | null
  companyName: string
  legalName: string
  phone: string
  email: string
  country: string
  gstnumber: string
  business_type: string
  pincode: string
  state: string
  city: string
  address: string
  website_url: string
  pan_no: string
}

interface FormErrors {
  [key: string]: string
}

// Yup validation schema
const validationSchema = yup.object().shape({
  companyName: yup.string().required('Company name is required'),
  legalName: yup.string(),
  phone: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email format'),
  country: yup.string().required('Country is required'),
  gstnumber: yup.string().test(
    'gst-format',
    'Invalid GSTIN format',
    function (value) {
      if (!value || value.length === 0) return true;
      return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value);
    }
  ),
  business_type: yup.string(),
  pincode: yup.string().test(
    'pincode-format',
    'Pincode must be 6 digits',
    function (value) {
      if (!value || value.length === 0) return true;
      return /^[0-9]{6}$/.test(value);
    }
  ),
  state: yup.string().required('State is required'),
  city: yup.string().required('City is required'),
  address: yup.string(),
  website_url: yup.string().url('Invalid website URL'),
  pan_no: yup.string().test(
    'pan-format',
    'Invalid PAN number format',
    function (value) {
      if (!value || value.length === 0) return true;
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
    }
  )
});

const Register = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const phone_number = searchParams.get('mobile') || ""
  const registration_token = searchParams.get('token') || ""

  const initialValues: RegisterForm = {
    companyLogo: null,
    companyName: "",
    legalName: "",
    phone: phone_number,
    email: "",
    country: "274",
    gstnumber: "",
    business_type: "",
    pincode: "",
    city: "",
    state: "",
    address: "",
    website_url: "",
    pan_no: "",
  }

  const [isLoading, setIsLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // Api
  const [registerApi] = auth.useSignupMutation()
  const [getCountry] = locations.useGetCountriesMutation();
  const [getStates] = locations.useGetStatesMutation();
  const [getCities] = locations.useGetCitiesMutation();

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [formData, setFormData] = useState<RegisterForm>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  // Use the scroll to error hook - moved after state declarations
  const { formRef, scrollToFirstError: scrollToErrorHook } = useScrollToError(errors, isLoading, touched)

  const loadCountries = async () => {
    try {
      const response = await getCountry({}).unwrap() as { data: Array<{ id: number; name: string }> };
      setCountries(response.data);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const loadStates = async (countryId: string) => {
    try {
      const response = await getStates({ id: countryId }).unwrap() as { data: Array<{ id: number; name: string }> };
      setStates(response.data || []);
      setCities([]); // Reset cities when country changes
    } catch (error) {
      console.error('Failed to load states:', error);
      setStates([]);
      setCities([]);
    }
  };

  const loadCities = async (stateId: string) => {
    try {
      const response = await getCities({ id: stateId }).unwrap() as { data: Array<{ id: number; name: string }> };
      setCities(response.data || []);
    } catch (error) {
      console.error('Failed to load cities:', error);
      setCities([]);
    }
  };

  useEffect(() => {
    loadCountries();
    loadStates("274");
  }, []);


  const handleInputChange = async (field: keyof RegisterForm, value: string | number) => {
    const finalValue = typeof value === 'string' && ['country', 'state', 'city'].includes(field) ? value : value.toString()
    setFormData(prev => ({
      ...prev,
      [field]: finalValue
    }))

    // Load states when country changes
    if (field === 'country' && finalValue) {
      loadStates(finalValue);
      // Reset state and city when country changes
      setFormData(prev => ({
        ...prev,
        state: '',
        city: ''
      }))
    }

    // Load cities when state changes
    if (field === 'state' && finalValue) {
      loadCities(finalValue);
      // Reset city when state changes
      setFormData(prev => ({
        ...prev,
        city: ''
      }))
    }

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))

    // Validate field on change
    try {
      await validationSchema.validateAt(field, { ...formData, [field]: value })
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(prev => ({
          ...prev,
          [field]: err.message
        }))
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
    setFormData(prev => ({
      ...prev,
      companyLogo: file
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if registration token is available
    if (!registration_token) {
      toast.error("Registration token missing. Please start the registration process again.")
      router.push("/signup")
      return
    }

    // Mark all fields as touched
    const allTouched: { [key: string]: boolean } = {}
    Object.keys(formData).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)

    try {
      // Validate all fields
      await validationSchema.validate(formData, { abortEarly: false })
      setErrors({})

      setIsLoading(true)

      // Prepare API payload
      const apiPayload = {
        registration_token: registration_token,
        shop_name: formData.companyName,
        legal_name: formData.legalName || "",
        user_name: formData.companyName,
        email: formData.email,
        phone_number: `+91${formData.phone}`,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        address: formData.address,
        tax_no: formData.gstnumber,
        pan_no: formData.pan_no,
        business_type_id: parseInt(formData.business_type) || undefined,
        website_url: formData.website_url,
        logo_image: logoFile || undefined,
      }

      // Create FormData if file is present
      let payload: any = apiPayload
      if (logoFile) {
        const formData = new FormData()
        Object.entries(apiPayload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString())
          }
        })
        if (logoFile) {
          formData.append('logo_image', logoFile)
        }
        payload = formData
      }

      const result = await registerApi(payload as any).unwrap()

      if (result.code === 200) {
        toast.success("Registration successful!")
        router.push("/login")
      } else {
        toast.error(result.message || "Registration failed. Please try again.")
      }

    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: FormErrors = {}
        err.inner.forEach(error => {
          if (error.path) {
            newErrors[error.path] = error.message
          }
        })
        setErrors(newErrors)
        toast.error("Please fix the validation errors")

        // Scroll to first error after a short delay to allow DOM to update
        setTimeout(() => {
          scrollToErrorHook()
        }, 100)
      } else {
        toast.error((err as any)?.data?.message || "Registration failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const businessTypeOptions = [
    { value: "1", label: "Retail / Shops" },
    { value: "2", label: "Wholesale / Distribution" },
    { value: "3", label: "E-commerce / Online Selling" },
    { value: "4", label: "Manufacturing" },
    { value: "5", label: "Trading" },
    { value: "6", label: "Export / Import" },
    { value: "7", label: "Services / Consulting" },
    { value: "8", label: "IT & Software" },
    { value: "9", label: "Construction / Real Estate" },
    { value: "10", label: "Healthcare / Medical / Pharma" },
    { value: "11", label: "Transport & Logistics" },
    { value: "12", label: "Agriculture" },
    { value: "13", label: "Others" },
  ]

  return (
    <div className="relative min-h-screen w-full bg-white overflow-x-hidden">
      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Logo Section */}
        <div className="w-full lg:w-[30%] bg-gray-100 flex items-center justify-center p-8 lg:p-0 lg:fixed lg:left-0 lg:top-0 lg:h-screen">
          <img
            src="/auth/auth-image.png"
            alt="Login Illustration"
            className="hidden lg:block object-cover w-full h-full"
          />
          <div className="lg:absolute top-8 left-8 z-10">
            <img
              src="/next.svg"
              alt="Logo"
              className="h-16 w-30 drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-[70%] lg:ml-[30%] relative overflow-x-hidden">
          <div className="w-full max-w-full p-4 sm:p-8 lg:px-12 lg:py-8 bg-white md:px-16">
            <Card className="w-full">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Company Registration</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Fill in your company details to get started</p>

                <form onSubmit={handleSubmit} ref={formRef} noValidate suppressHydrationWarning className="flex flex-col gap-6 w-full max-w-full">
                  {/* Company Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                          <ImagePlusIcon />
                        </div>
                        <span className="text-sm text-gray-600">
                          {logoFile ? logoFile.name : "Click to upload or drag and drop"}
                        </span>
                        <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                      </label>
                    </div>
                  </div>

                  {/* Section 1: Company Information */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-10">
                      {/* Company Name */}
                      <div data-field="companyName">
                        <UnifiedInput
                          label="Company Name"
                          placeholder="Enter company name"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          required
                          error={errors.companyName && touched.companyName ? errors.companyName : undefined}
                        />
                      </div>

                      {/* Legal Name */}
                      <div data-field="legalName">
                        <UnifiedInput
                          label="Legal Name"
                          placeholder="Enter legal name"
                          value={formData.legalName}
                          onChange={(e) => handleInputChange("legalName", e.target.value)}
                          error={errors.legalName && touched.legalName ? errors.legalName : undefined}
                        />
                      </div>

                      {/* Phone */}
                      <div data-field="phone">
                        <UnifiedInput
                          label="Phone Number"
                          type="tel"
                          prefix="+91"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          readOnly
                          error={errors.phone && touched.phone ? errors.phone : undefined}
                        />
                      </div>

                      {/* Email */}
                      <div data-field="email">
                        <UnifiedInput
                          label="Email Address"
                          type="email"
                          placeholder="company@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          error={errors.email && touched.email ? errors.email : undefined}
                        />
                      </div>

                      {/* GSTIN */}
                      <div data-field="gstnumber">
                        <UnifiedInput
                          label="GSTIN"
                          placeholder="Enter GST Number"
                          value={formData.gstnumber}
                          onChange={(e) => handleInputChange("gstnumber", e.target.value.toUpperCase())}
                          maxLength={15}
                          style={{ textTransform: "uppercase" }}
                          error={errors.gstnumber && touched.gstnumber ? errors.gstnumber : undefined}
                        />
                      </div>

                      {/* Business Type */}
                      <div data-field="business_type">
                        <label className="block text-[15px] font-semibold text-gray-700 mb-1">
                          Business Type
                        </label>
                        <Select
                          value={formData.business_type}
                          onValueChange={(value) => handleInputChange("business_type", value)}
                        >
                          <SelectTrigger className="w-full" size="lg">
                            <SelectValue placeholder="Select Business Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {businessTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.business_type && touched.business_type && (
                          <p className="text-xs text-red-500 mt-1">{errors.business_type}</p>
                        )}
                      </div>

                      {/* PAN Number */}
                      <div data-field="pan_no">
                        <UnifiedInput
                          label="PAN Number"
                          placeholder="Enter PAN Number"
                          value={formData.pan_no}
                          onChange={(e) => handleInputChange("pan_no", e.target.value.toUpperCase())}
                          maxLength={10}
                          style={{ textTransform: "uppercase" }}
                          error={errors.pan_no && touched.pan_no ? errors.pan_no : undefined}
                        />
                      </div>

                      {/* Website */}
                      <div data-field="website_url" className="md:col-span-2">
                        <UnifiedInput
                          label="Website URL"
                          placeholder="https://www.example.com"
                          value={formData.website_url}
                          onChange={(e) => handleInputChange("website_url", e.target.value)}
                          error={errors.website_url && touched.website_url ? errors.website_url : undefined}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Address Information */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Address Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-10">
                      {/* Country */}
                      <div data-field="country">
                        <label className="block text-[15px] font-semibold text-gray-700 mb-1">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={formData.country ? formData.country.toString() : ""}
                          onValueChange={(value) => handleInputChange("country", value)}
                          required
                        >
                          <SelectTrigger className="w-full" size="lg">
                            <SelectValue placeholder="Select Country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country.id} value={country.id.toString()}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.country && touched.country && (
                          <p className="text-xs text-red-500 mt-1">{errors.country}</p>
                        )}
                      </div>

                      {/* State */}
                      <div data-field="state">
                        <label className="block text-[15px] font-semibold text-gray-700 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={formData.state ? formData.state.toString() : ""}
                          onValueChange={(value) => handleInputChange("state", value)}
                          required
                        >
                          <SelectTrigger className="w-full" size="lg">
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map(state => (
                              <SelectItem key={state.id} value={state.id.toString()}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.state && touched.state && (
                          <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                        )}
                      </div>

                      {/* City */}
                      <div data-field="city">
                        <label className="block text-[15px] font-semibold text-gray-700 mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={formData.city ? formData.city.toString() : ""}
                          onValueChange={(value) => handleInputChange("city", value)}
                          required
                        >
                          <SelectTrigger className="w-full" size="lg">
                            <SelectValue placeholder="Select City" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map(city => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.city && touched.city && (
                          <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                        )}
                      </div>

                      {/* Address */}
                      <div data-field="address" className="md:col-span-2">
                        <label className="block text-[15px] font-semibold text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          placeholder="Enter address"
                          rows={3}
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.address && touched.address && (
                          <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                        )}
                      </div>

                      {/* Pincode */}
                      <div data-field="pincode">
                        <UnifiedInput
                          label="Pincode"
                          placeholder="Enter pincode"
                          value={formData.pincode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "")
                            handleInputChange("pincode", value)
                          }}
                          maxLength={6}
                          error={errors.pincode && touched.pincode ? errors.pincode : undefined}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center sm:justify-end gap-4 pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? "Registering..." : "Register Company"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
