"use client"



import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import {
  Car,
  Clock,
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Search,
  CheckCircle,
  Calculator,
  Download,
  Shield,
  AlertTriangle,
  Tag,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { useAuth } from "@/context/auth"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useToast } from "@/hooks/use-toast"
import { useQuoteExpiration } from "@/hooks/use-quote-expiration.tsx";
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"



import { occupation_list } from "@/lib/occupation";

// Add a new function to calculate the next 5-minute increment time
const getNext5MinuteTime = () => {
  const now = new Date()
  const minutes = now.getMinutes()
  const remainder = minutes % 5

  // Add minutes to round up to the next 5-minute increment
  now.setMinutes(minutes + (remainder === 0 ? 0 : 5 - remainder))
  now.setSeconds(0)
  now.setMilliseconds(0)

  return now
}

// Format date as dd/mm/yy hh:mm
const formatDateTime = (date: Date) => {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear().toString().slice(-2)
  const hours = date.getHours().toString().padStart(2, "0")
  const mins = date.getMinutes().toString().padStart(2, "0")

  return `${day}/${month}/${year} ${hours}:${mins}`
}

export default function GetQuotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registrationFromHome = searchParams.get("reg")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect to home if accessed directly without registration parameter
  useEffect(() => {
    if (isClient && !registrationFromHome) {
      router.push("/")
    }
  }, [isClient, registrationFromHome, router])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // 1. Replace the existing formData state initialization to include separate hour and minute fields:
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirthDay: "",
    dateOfBirthMonth: "",
    dateOfBirthYear: "",
    phoneNumber: "",
    occupation: "",
    postcode: "",
    address: "",
    licenseType: "",
    licenseHeld: "",
    vehicleValue: "",
    reason: "",
    durationType: "Hours",
    duration: "1 hour",
    showDurationDropdown: false,
    startDate: "Immediate Start",
    startTime: "",
    startHour: "",
    startMinute: "",
  })

  const [vehicle, setVehicle] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [showAddresses, setShowAddresses] = useState(false)
  const [isOccupationOpen, setIsOccupationOpen] = useState(false)
  const [showQuote, setShowQuote] = useState(false)
  const [quote, setQuote] = useState(null)
  const { ExpirationDialog } = useQuoteExpiration(quote);
  const [isCalculating, setIsCalculating] = useState(false)
  const [postcodeError, setPostcodeError] = useState("")
  const [showReview, setShowReview] = useState(false)
  const [ageError, setAgeError] = useState("")
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [isLoginCompleted, setIsLoginCompleted] = useState(false)
  const [isLookingUpPostcode, setIsLookingUpPostcode] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [accuracyConfirmed, setAccuracyConfirmed] = useState(false)
  const [email, setEmail] = useState("")
  const [showSummary, setShowSummary] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  })
  const [billingDetails, setBillingDetails] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
  })
  const [sameBillingAddress, setSameBillingAddress] = useState(true)
  const [reviewStartTime, setReviewStartTime] = useState(null);
  const [reviewExpiryTime, setReviewExpiryTime] = useState(null);
  const [quoteSettings, setQuoteSettings] = useState(null);
  // 1. Add a new state for showing time selection:
  const [showTimeSelection, setShowTimeSelection] = useState(false)

  useEffect(() => {
    const fetchQuoteSettings = async () => {
      try {
        const response = await fetch('/api/quote-settings');
        const data = await response.json();
        if (data.success) {
          setQuoteSettings(data.quoteFormula);
        }
      } catch (error) {
        console.error("Failed to fetch quote settings:", error);
      }
    };

    fetchQuoteSettings();
  }, []);

  useEffect(() => {
    if (isAuthenticated && isLoginCompleted) {
      if (sessionStorage.getItem("pendingPayment") === "true") {
        sessionStorage.removeItem("pendingPayment")
        proceedToPaymentLogic()
      }
      setIsLoginCompleted(false)
    }
  }, [isAuthenticated, isLoginCompleted, quote])

  useEffect(() => {
    if (registrationFromHome) {
      const fetchVehicleData = async () => {
        try {
          const response = await fetch('/api/check-vehicle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registration: registrationFromHome }),
          });
          if (response.ok) {
            const data = await response.json();
            setVehicle(data);
          } else {
            console.error("Failed to fetch vehicle data on get-quote page, redirecting to home.");
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching vehicle data on get-quote page:", error);
          router.push("/");
        }
      };
      fetchVehicleData();
    }
  }, [registrationFromHome, router]);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'review') {
      const storedData = localStorage.getItem("quoteRestorationData");
      if (storedData) {
        try {
          const { formData, quote, appliedPromo, discountAmount, reviewStartTime, reviewExpiryTime } = JSON.parse(storedData);
          
          setFormData(formData);
          setQuote(quote);
          setAppliedPromo(appliedPromo);
          setDiscountAmount(discountAmount);
          if (appliedPromo) {
            setPromoCode(appliedPromo.promoCode);
          }
          setReviewStartTime(reviewStartTime);
          setReviewExpiryTime(reviewExpiryTime);
          
          setShowReview(true);

          const reg = searchParams.get('reg');
          router.replace(`/get-quote?reg=${reg}`, undefined, { shallow: true });
          localStorage.removeItem("quoteRestorationData");
        } catch (e) {
          console.error("Failed to restore quote state from localStorage", e);
          router.push('/');
        }
      }
    }
  }, [searchParams, router]);

  const handleInputChange = (field: string, value: string | boolean) => {
    // Special handling for phone number field
    if (field === "phoneNumber" && typeof value === "string") {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, "")

      // If empty, allow it
      if (digitsOnly === "") {
        setFormData((prev) => ({
          ...prev,
          [field]: "",
        }))
        return
      }

      // Check if it starts with valid UK prefix (07 or 447)
      const isValidStart = digitsOnly.startsWith("07") || digitsOnly.startsWith("447")

      // Limit to 11 digits for UK numbers (e.g., 07123456789)
      const limitedValue = digitsOnly.slice(0, 11)

      // Only update if valid start or if user is still typing the prefix
      if (isValidStart || (digitsOnly.length <= 3 && ("07".startsWith(digitsOnly) || "447".startsWith(digitsOnly)))) {
        setFormData((prev) => ({
          ...prev,
          [field]: limitedValue,
        }))
      }
      return
    }

    let processedValue = value

    if (field === "firstName" || field === "lastName") {
      const lettersOnly = value.replace(/[^A-Za-z]/g, "")
      processedValue = lettersOnly
    }

    if (field === "occupation") {
      const lettersAndSpacesOnly = value.replace(/[^A-Za-z\s]/g, "")
      processedValue = lettersAndSpacesOnly
    }

    // 3. Update the handleInputChange function to handle startDate changes:
    // 3. Update the handleInputChange function to handle hour and minute changes:
    if (field === "startHour") {
      setFormData((prev) => ({
        ...prev,
        startHour: value as string,
        startMinute: "", // Reset minute when hour changes
        startTime: "", // Reset combined time
      }))
      return
    }

    if (field === "startMinute") {
      const combinedTime = `${formData.startHour}:${value as string}`
      setFormData((prev) => ({
        ...prev,
        startMinute: value as string,
        startTime: combinedTime,
      }))
      return
    }

    if (field === "startDate") {
      setShowTimeSelection(value !== "Immediate Start")
      if (value === "Immediate Start") {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          startTime: "",
          startHour: "",
          startMinute: "",
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [field]: value,
        }))
      }
      return
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }))
  }

  const handleCardDetailsChange = (field: string, value: string) => {
    let processedValue = value

    if (field === "cardNumber") {
      // Only allow digits and format with spaces
      const digitsOnly = value.replace(/\D/g, "")
      // Format with spaces every 4 digits
      processedValue = digitsOnly
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19) // Limit to 16 digits + 3 spaces
    }

    if (field === "cardName") {
      // Only allow letters and spaces
      processedValue = value.replace(/[^A-Za-z\s]/g, "")
    }

    if (field === "expiryMonth" || field === "expiryYear" || field === "cvv") {
      // Only allow digits
      processedValue = value.replace(/\D/g, "")

      // Limit CVV to 3 or 4 digits
      if (field === "cvv") {
        processedValue = processedValue.slice(0, 4)
      }
    }

    setCardDetails((prev) => ({
      ...prev,
      [field]: processedValue,
    }))
  }

  const handleBillingDetailsChange = (field: string, value: string) => {
    setBillingDetails((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePostcodeLookup = async () => {
    // Reset any previous errors
    setPostcodeError("")

    // Check if postcode is empty
    if (!formData.postcode.trim()) {
      setPostcodeError("Please enter a postcode before searching")
      return
    }

    setIsLookingUpPostcode(true);

    try {
      const response = await fetch(`/api/postcode-lookup?postcode=${encodeURIComponent(formData.postcode)}`);

      if (response.ok) {
        const data = await response.json();

        if (data.addresses && data.addresses.length > 0) {
          setAddresses(data.addresses);
          setShowAddresses(true);
        } else {
          setPostcodeError("No addresses found for this postcode.");
          setAddresses([]);
          setShowAddresses(false);
        }
      } else {
        setPostcodeError("Failed to fetch addresses. Please try again.");
        setShowAddresses(false);
      }
    } catch (error) {
      console.error("An error occurred during postcode lookup", error);
      setPostcodeError("An unexpected error occurred. Please try again.");
      setShowAddresses(false);
    } finally {
      setIsLookingUpPostcode(false);
    }
  }

  const calculateQuote = () => {
    if (!quoteSettings) return null;

    // Base price calculation
    const basePrice = formData.durationType === "Hours" ? quoteSettings.baseHourlyRate : quoteSettings.baseDailyRate;

    // Duration multiplier
    const durationValue = Number.parseInt(formData.duration.split(" ")[0])
    let durationMultiplier = 1

    if (formData.durationType === "Hours") {
      if (durationValue > 1) {
        const additionalHourRate = (quoteSettings.baseDailyRate - quoteSettings.baseHourlyRate) / 23;
        durationMultiplier = (quoteSettings.baseHourlyRate + (durationValue - 1) * additionalHourRate) / basePrice;
      }
    } else if (formData.durationType === "Days") {
      durationMultiplier = (durationValue * quoteSettings.baseDailyRate * (1 - quoteSettings.multiDayDiscountPercentage / 100)) / basePrice;
    } else if (formData.durationType === "Weeks") {
      durationMultiplier = (durationValue * 7 * quoteSettings.baseDailyRate * (1 - quoteSettings.multiWeekDiscountPercentage / 100)) / basePrice;
    }

    // Age factor (calculate age from DOB)
    const currentYear = new Date().getFullYear()
    const birthYear = Number.parseInt(formData.dateOfBirthYear)
        const age = currentYear - birthYear
        let ageFactor = 1.0
    
        const sortedAgeDiscounts = [...quoteSettings.ageDiscounts].sort((a, b) => b.age - a.age);
        const ageDiscount = sortedAgeDiscounts.find((d) => age >= d.age);
        if (ageDiscount) {
          ageFactor = 1 - ageDiscount.discount / 100;
        }
    
        // License experience factor
        let licenseFactor = 1.0
        const licenseHeldMonths = formData.licenseHeld === "Under 1 Year" ? 6 :
                                formData.licenseHeld === "1-2 Years" ? 18 :
                                formData.licenseHeld === "2-4 Years" ? 36 :
                                formData.licenseHeld === "5-10 Years" ? 84 :
                                120;
    
        const sortedLicenseDiscounts = [...quoteSettings.licenseHeldDiscounts].sort((a, b) => b.months - a.months);
        const licenseDiscount = sortedLicenseDiscounts.find((d) => licenseHeldMonths >= d.months);
        if (licenseDiscount) {
          licenseFactor = 1 - licenseDiscount.discount / 100;
        }
    // Vehicle value factor
    let vehicleValueFactor = 1.0
    switch (formData.vehicleValue) {
      case "£1,000 - £5,000":
        vehicleValueFactor = 0.8
        break
      case "£5,000 - £10,000":
        vehicleValueFactor = 1.0
        break
      case "£10,000 - £20,000":
        vehicleValueFactor = 1.2
        break
      case "£20,000 - £30,000":
        vehicleValueFactor = 1.4
        break
      case "£30,000 - £50,000":
        vehicleValueFactor = 1.8
        break
      case "£50,000 - £80,000":
        vehicleValueFactor = 2.2
        break
      case "£80,000+":
        vehicleValueFactor = 3.0
        break
    }

    // Reason factor
    let reasonFactor = 1.0
    switch (formData.reason) {
      case "Borrowing":
        reasonFactor = 1.1
        break
      case "Buying/Selling/Testing":
        reasonFactor = 0.9
        break
      case "Learning":
        reasonFactor = 1.5
        break
      case "Maintenance":
        reasonFactor = 0.8
        break
      case "Other":
        reasonFactor = 1.2
        break
    }

    // Calculate total
    const subtotal = basePrice * durationMultiplier * ageFactor * licenseFactor * vehicleValueFactor * reasonFactor
    const insurancePremiumTax = subtotal * 0.12 // 12% IPT
    const total = subtotal + insurancePremiumTax

    // Calculate start and expiry times
    const startTime = getNext5MinuteTime()
    const expiryTime = new Date(startTime)

    // Add duration
    const durationVal = Number.parseInt(formData.duration.split(" ")[0])
    if (formData.durationType === "Hours") {
      expiryTime.setHours(expiryTime.getHours() + durationVal)
    } else if (formData.durationType === "Days") {
      expiryTime.setDate(expiryTime.getDate() + durationVal)
    } else {
      // Weeks
      expiryTime.setDate(expiryTime.getDate() + durationVal * 7)
    }

    return {
      basePrice,
      durationMultiplier,
      ageFactor,
      licenseFactor,
      vehicleValueFactor,
      reasonFactor,
      subtotal,
      insurancePremiumTax,
      total: Math.max(total, 8.5), // Minimum premium of £8.50
      breakdown: {
        age,
        duration: `${durationValue} ${formData.durationType.toLowerCase()}`,
        licenseExperience: formData.licenseHeld,
        vehicleValue: formData.vehicleValue,
        reason: formData.reason,
      },
      startTime: formatDateTime(startTime),
      expiryTime: formatDateTime(expiryTime),
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const calculatedQuote = calculateQuote();
    setQuote(calculatedQuote);
    localStorage.setItem('quoteCreationTimestamp', Date.now().toString());

    const startTime = getNext5MinuteTime();
    const expiryTime = new Date(startTime);
    const durationValue = Number.parseInt(formData.duration.split(" ")[0]);
    if (formData.durationType === "Hours") {
      expiryTime.setHours(expiryTime.getHours() + durationValue);
    } else if (formData.durationType === "Days") {
      expiryTime.setDate(expiryTime.getDate() + durationValue);
    } else {
      expiryTime.setDate(expiryTime.getDate() + durationValue * 7);
    }
    setReviewStartTime(formatDateTime(startTime));
    setReviewExpiryTime(formatDateTime(expiryTime));

    setShowReview(true)
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNewQuote = () => {
    setShowQuote(false)
    setQuote(null)
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDurationTypeChange = (type: string) => {
    setFormData((prev) => {
      // Reset duration based on type
      let newDuration = ""
      let showDropdown = prev.showDurationDropdown

      if (type === "Hours") {
        newDuration = "1 hour"
        showDropdown = false
      } else if (type === "Days") {
        newDuration = "1 day"
        showDropdown = false
      } else if (type === "Weeks") {
        newDuration = "1 week"
        showDropdown = false
      }

      return {
        ...prev,
        durationType: type,
        duration: newDuration,
        showDurationDropdown: showDropdown,
      }
    })
  }

  const handleDurationChange = (duration: string) => {
    setFormData((prev) => ({
      ...prev,
      duration: duration,
    }))
  }

  const handleOtherDurationClick = () => {
    setFormData((prev) => ({
      ...prev,
      showDurationDropdown: true,
    }))
  }

  const generateDateOptions = () => {
    const options = ["Immediate Start"]
    const today = new Date()

    for (let i = 0; i < 28; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      let dayName = ""
      if (i === 0) dayName = "Today"
      else if (i === 1) dayName = "Tomorrow"
      else dayName = date.toLocaleDateString("en-GB", { weekday: "long" })

      const dateStr = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      })

      options.push(`${dayName}, ${dateStr}`)
    }

    return options
  }

  // Generate hour options for dropdown (1-23 hours)
  const hourOptions = Array.from({ length: 23 }, (_, i) => `${i + 1} ${i === 0 ? "hour" : "hours"}`)

  // Generate day options for dropdown (1-28 days)
  const dayOptions = Array.from({ length: 28 }, (_, i) => `${i + 1} ${i === 0 ? "day" : "days"}`)

  // Generate week options for dropdown (1-4 weeks)
  const weekOptions = Array.from({ length: 4 }, (_, i) => `${i + 1} ${i === 0 ? "week" : "weeks"}`)

  // Get the appropriate options based on duration type
  const getDurationOptions = () => {
    if (formData.durationType === "Hours") {
      return hourOptions
    } else if (formData.durationType === "Days") {
      return dayOptions
    } else {
      return weekOptions
    }
  }

  // 2. Add a function to generate time options in 5-minute increments:
  const generateTimeOptions = () => {
    const options = []
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        // Skip past times for today
        if (
          formData.startDate.includes("Today") &&
          (hour < currentHour || (hour === currentHour && minute <= currentMinute))
        ) {
          continue
        }

        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        options.push(timeString)
      }
    }

    return options
  }

  // 2. Add a function to generate available minutes based on selected hour:
  const generateMinuteOptions = (selectedHour: string) => {
    const options = []
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const hourNum = Number.parseInt(selectedHour)

    for (let minute = 0; minute < 60; minute += 5) {
      // Skip past minutes for today if it's the current hour
      if (formData.startDate.includes("Today") && hourNum === currentHour && minute <= currentMinute) {
        continue
      }

      const minuteString = minute.toString().padStart(2, "0")
      options.push(minuteString)
    }

    return options
  }

  // In the generateHourOptions function, update it to return just the hour numbers without ":00":
  const generateHourOptions = () => {
    const options = []
    const now = new Date()
    const currentHour = now.getHours()

    for (let hour = 0; hour < 24; hour++) {
      // Skip past hours for today
      if (formData.startDate.includes("Today") && hour < currentHour) {
        continue
      }

      const hourString = hour.toString().padStart(2, "0")
      options.push(hourString)
    }

    return options
  }

  const handleChangeDetails = () => {
    setShowReview(false)
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const proceedToPaymentLogic = async () => {
    setIsCalculating(true)

    const calculatedQuote = calculateQuote()
    const finalTotal = calculatedQuote.total - discountAmount

    // Gather data for blacklist check
    const cleanReg = registrationFromHome?.replace(/\s+/g, "").toUpperCase();
    const dob = `${formData.dateOfBirthDay}/${formData.dateOfBirthMonth}/${formData.dateOfBirthYear}`;

    try {
      // Get client IP for blacklist check
      const ipResponse = await fetch("/api/get-client-ip")
      const { ip } = await ipResponse.json()

      // Perform comprehensive blacklist check
      const blacklistCheckResponse = await fetch('/api/blacklist-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regNumber: cleanReg,
          ipAddress: ip,
          postcode: formData.postcode,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: dob,
          email: user?.email, // Include email if user is logged in
        }),
      });
      const blacklistResult = await blacklistCheckResponse.json();

      if (blacklistResult.isBlacklisted) {
        toast({ variant: "destructive", title: "Access Restricted", description: blacklistResult.reason || "Your access has been restricted. Please contact support for assistance." });
        setIsCalculating(false);
        return;
      }
    } catch (error) {
      console.error("Failed to perform blacklist check:", error);
      toast({ variant: "destructive", title: "Service Unavailable", description: "Could not perform blacklist check at this time. Please try again later." });
      setIsCalculating(false);
      return;
    }

    const quoteDataForCheckout = {
      userId: user.id,
      total: finalTotal,
      originalTotal: calculatedQuote.total,
      cpw: calculatedQuote.total.toFixed(2),
      update_price: finalTotal.toFixed(2),
      discountAmount: discountAmount,
      promoCode: appliedPromo ? appliedPromo.promoCode : undefined,
      startTime: calculatedQuote.startTime,
      expiryTime: calculatedQuote.expiryTime,
      breakdown: {
        duration: calculatedQuote.breakdown.duration,
        reason: calculatedQuote.breakdown.reason,
      },
      customerData: {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: `${formData.dateOfBirthDay}/${formData.dateOfBirthMonth}/${formData.dateOfBirthYear}`,
        phoneNumber: formData.phoneNumber,
        occupation: formData.occupation,
        address: formData.address,
        licenseType: formData.licenseType,
        licenseHeld: formData.licenseHeld,
        vehicleValue: formData.vehicleValue,
        reason: formData.reason,
        duration: formData.duration,
                  registration: registrationFromHome || "",
                  post_code: formData.postcode,
                  vehicle: {
                    make: vehicle?.make || "",
                    model: vehicle?.model || "",
                    year: vehicle?.year && vehicle.year !== "Unknown" ? vehicle.year : "",
                    engineCC: "1400", // You can add this to vehicle data if needed
                  },      },
    }

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quoteData: quoteDataForCheckout }),
      })

      if (!response.ok) {
        throw new Error("Failed to create quote")
      }

      const newQuote = await response.json()

      // Manually inject the correct total into the object before storing.
      const parsedQuoteData = JSON.parse(newQuote.quoteData);
      parsedQuoteData.total = finalTotal;
      if (appliedPromo) {
        parsedQuoteData.promoCode = appliedPromo.promoCode;
        parsedQuoteData.discountAmount = discountAmount;
        parsedQuoteData.originalTotal = calculatedQuote.total;
      }
      newQuote.quoteData = JSON.stringify(parsedQuoteData);

      // Save data for restoration if user navigates back
      const restorationData = {
        formData,
        quote,
        appliedPromo,
        discountAmount,
        reviewStartTime,
        reviewExpiryTime,
      };
      localStorage.setItem("quoteRestorationData", JSON.stringify(restorationData));

      // Save quote data to localStorage
      localStorage.setItem("quoteData", JSON.stringify(newQuote))

      // Redirect to checkout page
      router.push("/quote-checkout")
    } catch (error) {
      console.error("Error proceeding to payment:", error)
      toast({ variant: "destructive", title: "Error", description: "Could not proceed to payment. Please try again." })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("pendingPayment", "true")
      setIsAuthDialogOpen(true)
      return
    }
    await proceedToPaymentLogic()
  }

  const calculateDiscountedTotal = (total: number, promo: any) => {
    let discountAmount = 0
    if (promo.discount.type === "percentage") {
      discountAmount = total * (promo.discount.value / 100)
    } else if (promo.discount.type === "fixed") {
      discountAmount = promo.discount.value
    }
    if (promo.maxDiscount) {
      discountAmount = Math.min(discountAmount, parseFloat(promo.maxDiscount))
    }
    return discountAmount
  }

  const handleApplyPromo = async () => {
    if (!promoCode || !quote) return
    setIsApplyingPromo(true)
    toast({ title: "Processing", description: "Checking promo code..." })
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: promoCode, total: quote.total }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to validate promo code")

      const coupon = data
      if (typeof coupon.discount === "string") {
        coupon.discount = JSON.parse(coupon.discount)
      }

      const discount = calculateDiscountedTotal(quote.total, coupon)
      setDiscountAmount(discount)
      setAppliedPromo(coupon)

      toast({ title: "Promo Code Applied", description: `Successfully applied promo code ${data.promoCode}` })
    } catch (error: any) {
      setAppliedPromo(null)
      setDiscountAmount(0)
      toast({ variant: "destructive", title: "Invalid Code", description: error.message || "The promo code is invalid or expired" })
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handlePurchase = () => {
    if (!termsAccepted || !accuracyConfirmed) {
      alert("Please accept the terms and confirm the accuracy of your information.")
      return
    }

    // Validate card details
    if (
      !cardDetails.cardNumber ||
      !cardDetails.cardName ||
      !cardDetails.expiryMonth ||
      !cardDetails.expiryYear ||
      !cardDetails.cvv
    ) {
      alert("Please fill in all card details.")
      return
    }

    // Validate billing details if not using same address
    if (!sameBillingAddress) {
      if (!billingDetails.addressLine1 || !billingDetails.city || !billingDetails.postcode) {
        alert("Please fill in all required billing details.")
        return
      }
    }

    alert("Purchase successful! Your covernote will be emailed to you shortly.")
  }

  const toggleSummary = () => {
    setShowSummary(!showSummary)
  }

  // Function to validate age
  const validateAge = (day: string, month: string, year: string) => {
    if (day && month && year) {
      const birthDate = new Date(`${year}-${month}-${day}`)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (age < 17) {
        setAgeError("You must be at least 17 years old to get a quote.")
      } else {
        setAgeError("")
      }
    }
  }

  const monthInputRef = useRef<HTMLInputElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);

  if (!isClient || !registrationFromHome) {
    return null;
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
      <ExpirationDialog />
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-4 sm:mb-6">
            <Link href="/">
              <Button variant="outline" className="flex items-center space-x-2 text-sm sm:text-base bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>

          {/* Vehicle Information */}
          {!showQuote && !showReview && (
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Vehicle Details</h2>
                    <p className="text-sm sm:text-base text-gray-600">Vehicle information</p>
                  </div>
                </div>
                {vehicle ? (
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full self-start sm:self-auto">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full self-start sm:self-auto">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium text-sm">Unknown Registration</span>
                  </div>
                )}
              </div>

              {/* Vehicle Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="col-span-2 sm:col-span-1 bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Registration</div>
                  <div className="bg-yellow-400 border-2 border-black rounded-md p-2 sm:p-3 inline-block shadow-md">
                    <div
                      className="font-mono text-lg sm:text-2xl font-black tracking-widest"
                      style={{ fontFamily: 'monospace, "Courier New"' }}
                    >
                      {registrationFromHome || "NO REG"}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Make</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{vehicle?.make || "Unknown"}</div>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Model</div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">{vehicle?.model || "Unknown"}</div>
                </div>
              </div>
              
            </div>
          )}

          {/* Quote Display */}
          {showQuote && quote && (
            <div className="bg-white rounded-xl p-4 sm:p-8 shadow-lg border border-gray-200 mb-6 sm:mb-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Quote is Ready!</h2>
                <p className="text-base sm:text-lg text-gray-600">Here's your personalized covernote quote</p>
              </div>

              {/* Quote Summary */}
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-teal-600 mb-2">£{quote.total.toFixed(2)}</div>
                  <div className="text-base sm:text-lg text-gray-700">Total Premium</div>
                  <div className="text-sm text-gray-500 mt-1">
                    For {quote.breakdown.duration} • {vehicle?.make} {vehicle?.model}
                  </div>
                </div>
              </div>

              {/* Quote Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium text-right">
                        {vehicle?.year != 'Unknown' ? vehicle?.year : ''} {vehicle?.make} {vehicle?.model}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Registration:</span>
                      <span className="font-medium">{registrationFromHome}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{quote.breakdown.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium text-right">{formData.startDate}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium text-right">{quote.breakdown.reason}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Base Premium:</span>
                      <span className="font-medium">£{quote.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Duration Factor:</span>
                      <span className="font-medium">×{quote.durationMultiplier.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Risk Factors:</span>
                      <span className="font-medium">Applied</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">£{quote.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Insurance Premium Tax (12%):</span>
                      <span className="font-medium">£{quote.insurancePremiumTax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold text-base sm:text-lg">
                        <span>Total:</span>
                        <span className="text-teal-600">£{quote.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 text-teal-600 mr-2" />
                  What's Included
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Third Party Liability Cover</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">Instant Digital Certificate</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">24/7 Claims Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">DVLA Compliant</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/quote-checkout" className="flex-1">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Buy Now - £{quote.total.toFixed(2)}</span>
                  </Button>
                </Link>
                <Button
                  onClick={handleNewQuote}
                  variant="outline"
                  className="flex-1 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-transparent"
                >
                  Get New Quote
                </Button>
              </div>
            </div>
          )}

          {/* Review Page */}
          {showReview && !showQuote && (
            <div className="bg-white rounded-xl p-4 sm:p-8 shadow-lg border border-gray-200 mb-6 sm:mb-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Review Your Details</h2>
                <p className="text-base sm:text-lg text-gray-600">Please review your information before proceeding</p>
              </div>

              {/* Review Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-right">
                        {formData.firstName} {formData.middleName} {formData.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span className="font-medium">
                        {formData.dateOfBirthDay}/{formData.dateOfBirthMonth}/{formData.dateOfBirthYear}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formData.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Occupation:</span>
                      <span className="font-medium text-right">{formData.occupation}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium text-right">{formData.address}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">License Type:</span>
                      <span className="font-medium text-right">{formData.licenseType}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">License Held:</span>
                      <span className="font-medium text-right">{formData.licenseHeld}</span>
                    </div>
                  </div>
                </div>

                {/* Coverage Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium text-right">
                        {vehicle?.year != 'Unknown' ? vehicle?.year : ''} {vehicle?.make} {vehicle?.model}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Registration:</span>
                      <span className="font-medium">{registrationFromHome}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{formData.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Start Time:</span>
                      <span className="font-medium text-right">{reviewStartTime}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Expiry Time:</span>
                      <span className="font-medium text-right">{reviewExpiryTime}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium text-right">{formData.reason}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">Vehicle Value:</span>
                      <span className="font-medium text-right">{formData.vehicleValue}</span>
                    </div>
                  </div>
                </div>

                {/* Calculated Price */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center pt-6">
                  <div className="w-full max-w-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Calculated Price</h3>
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 sm:p-6">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-teal-600 mb-2">
                          {appliedPromo ? (
                            <>
                              <span className="text-gray-400 line-through mr-2">£{quote?.total.toFixed(2)}</span>
                              <span>£{(quote?.total - discountAmount).toFixed(2)}</span>
                            </>
                          ) : (
                            `£${quote?.total.toFixed(2)}`
                          )}
                        </div>
                        <div className="text-sm sm:text-base text-gray-700">Calculated Premium</div>
                        {appliedPromo && (
                          <div className="text-sm text-green-600 mt-1">
                            Discount applied: -£{discountAmount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Promo Code Section */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Have a promo code?</label>
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter promo code"
                          className="flex-1"
                          disabled={isApplyingPromo || !!appliedPromo}
                        />
                        <Button
                          type="button"
                          onClick={handleApplyPromo}
                          variant="outline"
                          className="px-6"
                          disabled={isApplyingPromo || !promoCode || !!appliedPromo}
                        >
                          {isApplyingPromo ? "Applying..." : appliedPromo ? "Applied" : "Apply"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={handleChangeDetails}
                  variant="outline"
                  className="flex-1 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-transparent"
                >
                  Change Details
                </Button>
                <Button
                  onClick={handleProceedToPayment}
                  disabled={isCalculating}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold"
                >
                  {isCalculating ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Proceed to Payment"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Form */}
          {!showQuote && !showReview && (
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Duration and Timing */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Duration & Timing</h2>
                </div>

                {/* Duration Type */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">DURATION TYPE?</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {["Hours", "Days", "Weeks"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleDurationTypeChange(type)}
                        className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                          formData.durationType === type
                            ? "bg-teal-500 text-white"
                            : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Amount */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">HOW LONG?</label>

                  {!formData.showDurationDropdown ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      {formData.durationType === "Hours" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDurationChange("1 hour")}
                            className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              formData.duration === "1 hour"
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                            }`}
                          >
                            1 hour
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDurationChange("3 hours")}
                            className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              formData.duration === "3 hours"
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                            }`}
                          >
                            3 hours
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDurationChange("5 hours")}
                            className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              formData.duration === "5 hours"
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                            }`}
                          >
                            5 hours
                          </button>
                          <button
                            type="button"
                            onClick={handleOtherDurationClick}
                            className="py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base bg-gray-100 text-blue-500 hover:bg-gray-200"
                          >
                            Other
                          </button>
                        </>
                      )}

                      {formData.durationType === "Days" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDurationChange("1 day")}
                            className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              formData.duration === "1 day"
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                            }`}
                          >
                            1 day
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDurationChange("3 days")}
                            className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              formData.duration === "3 days"
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                            }`}
                          >
                            3 days
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDurationChange("7 days")}
                            className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              formData.duration === "7 days"
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                            }`}
                          >
                            7 days
                          </button>
                          <button
                            type="button"
                            onClick={handleOtherDurationClick}
                            className="py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base bg-gray-100 text-blue-500 hover:bg-gray-200"
                          >
                            Other
                          </button>
                        </>
                      )}

                      {formData.durationType === "Weeks" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDurationChange("1 week")}
                            className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              formData.duration === "1 week"
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                            }`}
                          >
                            1 week
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDurationChange("2 weeks")}
                            className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              formData.duration === "2 weeks"
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                            }`}
                          >
                            2 weeks
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDurationChange("3 weeks")}
                            className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              formData.duration === "3 weeks"
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                            }`}
                          >
                            3 weeks
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDurationChange("4 weeks")}
                            className={`py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                              formData.duration === "4 weeks"
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-blue-500 hover:bg-gray-200"
                            }`}
                          >
                            4 weeks
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <select
                        value={formData.duration}
                        onChange={(e) => handleDurationChange(e.target.value)}
                        className="flex-1 h-10 sm:h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base bg-primary-foreground"
                      >
                        {getDurationOptions().map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            showDurationDropdown: false,
                          }))
                        }
                        className="px-4 text-sm sm:text-base"
                      >
                        Back
                      </Button>
                    </div>
                  )}
                </div>

                {/* 4. Replace the Start Date section with: */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">WHEN DO YOU WANT TO START?</label>
                  <div className="grid grid-cols-1 gap-3">
                    <select
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className="w-full h-10 sm:h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base bg-primary-foreground"
                      required
                    >
                      {generateDateOptions().map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    {showTimeSelection && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SELECT HOUR</label>
                          <select
                            value={formData.startHour}
                            onChange={(e) => handleInputChange("startHour", e.target.value)}
                            className="w-full h-10 sm:h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base bg-primary-foreground"
                            required
                          >
                            <option value="">Select hour...</option>
                            {generateHourOptions().map((hour) => (
                              <option key={hour} value={hour}>
                                {hour}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SELECT MINUTE</label>
                          <select
                            value={formData.startMinute}
                            onChange={(e) => handleInputChange("startMinute", e.target.value)}
                            className="w-full h-10 sm:h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base bg-primary-foreground"
                            required
                            disabled={!formData.startHour}
                          >
                            <option value="">{formData.startHour ? "Select minute..." : "Select hour first"}</option>
                            {formData.startHour &&
                              generateMinuteOptions(formData.startHour).map((minute) => (
                                <option key={minute} value={minute}>
                                  {minute}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">FIRST NAME *</label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="w-full h-10 sm:h-12 text-base"
                      required
                    />
                  </div>

                  {/* Middle Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">MIDDLE NAME</label>
                    <Input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange("middleName", e.target.value)}
                      className="w-full h-10 sm:h-12 text-base"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LAST NAME *</label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="w-full h-10 sm:h-12 text-base"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PHONE NUMBER *</label>
                    <Input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="w-full h-10 sm:h-12 text-base"
                      placeholder="07123456789"
                      required
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">DATE OF BIRTH *</label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formData.dateOfBirthDay}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 2)
                            handleInputChange("dateOfBirthDay", value)
                            validateAge(value, formData.dateOfBirthMonth, formData.dateOfBirthYear)
                            if (value.length === 2) {
                              monthInputRef.current?.focus()
                            }
                          }}
                          className="w-full h-10 sm:h-12 text-base"
                          placeholder="DD"
                          maxLength={2}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          ref={monthInputRef}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formData.dateOfBirthMonth}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "").slice(0, 2)
                            if (parseInt(value, 10) > 12) {
                              value = "12"
                            }
                            handleInputChange("dateOfBirthMonth", value)
                            validateAge(formData.dateOfBirthDay, value, formData.dateOfBirthYear)
                            if (value.length === 2) {
                              yearInputRef.current?.focus()
                            }
                          }}
                          className="w-full h-10 sm:h-12 text-base"
                          placeholder="MM"
                          maxLength={2}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          ref={yearInputRef}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formData.dateOfBirthYear}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                            handleInputChange("dateOfBirthYear", value)
                            validateAge(formData.dateOfBirthDay, formData.dateOfBirthMonth, value)
                          }}
                          className="w-full h-10 sm:h-12 text-base"
                          placeholder="YYYY"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                    {ageError && <p className="text-red-600 text-sm mt-2">{ageError}</p>}
                  </div>

                  {/* Occupation */}
                  <div className="sm:col-span-2 occupation-dropdown-container relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">OCCUPATION *</label>
                    <Popover open={isOccupationOpen} onOpenChange={setIsOccupationOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isOccupationOpen}
                          className="w-full justify-between h-10 sm:h-12 text-base font-normal"
                        >
                          <span className="truncate">
                          {formData.occupation
                            ? occupation_list.find((job) => job.desc.toLowerCase() === formData.occupation.toLowerCase())?.desc
                            : "Select occupation..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search occupation..." />
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandEmpty>No occupation found.</CommandEmpty>
                            <CommandGroup>
                              {occupation_list.map((job) => (
                                <CommandItem
                                  key={job.id}
                                  value={job.desc}
                                  onSelect={(currentValue) => {
                                    handleInputChange("occupation", currentValue === formData.occupation.toLowerCase() ? "" : job.desc)
                                    setIsOccupationOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.occupation.toLowerCase() === job.desc.toLowerCase() ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {job.desc}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="relative">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Address Information</h2>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Postcode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">POSTCODE *</label>
                      <div className="flex space-x-2 sm:space-x-3">
                        <Input
                          type="text"
                          inputMode="text"
                          value={formData.postcode}
                          onChange={(e) => {
                            handleInputChange("postcode", e.target.value.toUpperCase())
                            setPostcodeError("")
                          }}
                          className="flex-1 h-10 sm:h-12 text-base"
                          placeholder="Enter postcode"
                          required
                        />
                        <Button
                          type="button"
                          onClick={handlePostcodeLookup}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-4 sm:px-6 h-10 sm:h-12 text-sm sm:text-base flex items-center space-x-2"
                        >
                          <Search className="w-4 h-4" />
                          <span className="hidden sm:inline">Search</span>
                        </Button>
                      </div>
                      {postcodeError && <p className="text-red-600 text-sm mt-2">{postcodeError}</p>}
                    </div>

                    {/* Address Selection */}
                    {showAddresses && addresses.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SELECT ADDRESS *</label>
                        <select
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="w-full h-10 sm:h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base bg-primary-foreground"
                          required
                        >
                          <option value="">Select an address...</option>
                          {addresses.map((address: any, index) => (
                            <option key={index} value={address.address_selector}>
                              {address.address_selector}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                {isLookingUpPostcode && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Looking up postcode...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* License Information */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">License Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* License Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LICENSE TYPE *</label>
                    <select
                      value={formData.licenseType}
                      onChange={(e) => handleInputChange("licenseType", e.target.value)}
                      className="w-full h-10 sm:h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base bg-primary-foreground"
                      required
                    >
                      <option value="">Select license type...</option>
                      <option value="Full UK License">Full UK License</option>
                      <option value="Provisional License">Provisional License</option>
                      <option value="International License">International License</option>
                      <option value="EU License">EU License</option>
                    </select>
                  </div>

                  {/* License Held */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HOW LONG HELD? *</label>
                    <select
                      value={formData.licenseHeld}
                      onChange={(e) => handleInputChange("licenseHeld", e.target.value)}
                      className="w-full h-10 sm:h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base bg-primary-foreground"
                      required
                    >
                      <option value="">Select duration...</option>
                      <option value="Under 1 Year">Under 1 Year</option>
                      <option value="1-2 Years">1-2 Years</option>
                      <option value="2-4 Years">2-4 Years</option>
                      <option value="5-10 Years">5-10 Years</option>
                      <option value="10+ Years">10+ Years</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <Car className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Vehicle Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Vehicle Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">VEHICLE VALUE *</label>
                    <select
                      value={formData.vehicleValue}
                      onChange={(e) => handleInputChange("vehicleValue", e.target.value)}
                      className="w-full h-10 sm:h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base bg-primary-foreground"
                      required
                    >
                      <option value="">Select vehicle value...</option>
                      <option value="£1,000 - £5,000">£1,000 - £5,000</option>
                      <option value="£5,000 - £10,000">£5,000 - £10,000</option>
                      <option value="£10,000 - £20,000">£10,000 - £20,000</option>
                      <option value="£20,000 - £30,000">£20,000 - £30,000</option>
                      <option value="£30,000 - £50,000">£30,000 - £50,000</option>
                      <option value="£50,000 - £80,000">£50,000 - £80,000</option>
                      <option value="£80,000+">£80,000+</option>
                    </select>
                  </div>

                  {/* Reason for Cover */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">REASON FOR COVER *</label>
                    <select
                      value={formData.reason}
                      onChange={(e) => handleInputChange("reason", e.target.value)}
                      className="w-full h-10 sm:h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base bg-primary-foreground"
                      required
                    >
                      <option value="">Select reason for cover...</option>
                      <option value="Borrowing">Borrowing</option>
                      <option value="Buying/Selling/Testing">Buying/Selling/Testing</option>
                      <option value="Learning">Learning</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white py-3 sm:py-4 px-6 sm:px-12 text-base sm:text-lg font-semibold rounded-xl"
                  disabled={!!ageError}
                >
                  Review Details
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        title="Sign In to Continue"
        description="Sign in or create an account to complete your purchase."
        onSuccess={() => {
          setIsAuthDialogOpen(false)
          setIsLoginCompleted(true)
        }}
        disableRedirect={true}
      />
    </div>
  )
}
