"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Lock, CreditCard, Building2, Shield, Car, FileText, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [paymentView, setPaymentView] = useState<"selection" | "card-details" | "bank-details">("selection")
  const [cardNumber, setCardNumber] = useState("")
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "amex" | null>(null)
  const [shuffleIndex, setShuffleIndex] = useState(0)
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardName, setCardName] = useState("")
  const [isExpiryValid, setIsExpiryValid] = useState(true)

  const cardLogos = [
    "https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/visa.svg",
    "https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/mastercard.svg",
    "https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/american-express.svg",
    "https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/generic/card-generic-alt.svg",
  ]

  useEffect(() => {
    if (!cardType) {
      const interval = setInterval(() => {
        setShuffleIndex((prev) => (prev + 1) % cardLogos.length)
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [cardType, cardLogos.length])

  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, "")
    if (cleaned.startsWith("4")) {
      return "visa"
    } else if (/^5[1-5]/.test(cleaned) || /^222[1-9]|22[3-9]|2[3-6]|27[01]|2720/.test(cleaned)) {
      return "mastercard"
    } else if (/^3[47]/.test(cleaned)) {
      return "amex"
    }
    return null
  }

  const validateExpiry = (expiryValue: string) => {
    if (expiryValue.length < 5) {
      setIsExpiryValid(true) // Don't show error until fully entered
      return
    }

    const [month, year] = expiryValue.split("/")
    const monthNum = Number.parseInt(month, 10)
    const yearNum = Number.parseInt("20" + year, 10)

    const now = new Date()
    const currentMonth = now.getMonth() + 1 // getMonth() is 0-indexed
    const currentYear = now.getFullYear()

    // Check if month is valid (1-12)
    if (monthNum < 1 || monthNum > 12) {
      setIsExpiryValid(false)
      return
    }

    // Check if date is in the past
    if (yearNum < currentYear) {
      setIsExpiryValid(false)
    } else if (yearNum === currentYear && monthNum < currentMonth) {
      setIsExpiryValid(false)
    } else {
      setIsExpiryValid(true)
    }
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "")
    value = value.replace(/\D/g, "").slice(0, 16)
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value
    setCardNumber(formatted)
    setCardType(detectCardType(value))
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const previousLength = expiry.length

    // Remove all non-digits
    let value = inputValue.replace(/\D/g, "")

    // Detect if user is deleting
    const isDeleting = inputValue.length < previousLength

    if (!isDeleting) {
      // Smart month validation only when adding characters
      if (value.length === 1) {
        const firstDigit = Number.parseInt(value, 10)
        // If first digit is 2-9, prepend 0
        if (firstDigit >= 2 && firstDigit <= 9) {
          value = "0" + value
        }
      } else if (value.length === 2) {
        const month = Number.parseInt(value, 10)
        // If starts with 1 and second digit makes it > 12, default to 12
        if (value.startsWith("1") && month > 12) {
          value = "12"
        }
        // If month is > 12 in general, cap at 12
        if (month > 12) {
          value = "12"
        }
      }
    }

    // Limit to 4 digits total
    value = value.slice(0, 4)

    if (value.length >= 3 || (!isDeleting && value.length >= 2)) {
      value = value.slice(0, 2) + "/" + value.slice(2)
    }

    setExpiry(value)
    validateExpiry(value)
  }

  const isCardFormValid = () => {
    const cleanedCardNumber = cardNumber.replace(/\s/g, "")
    return (
      cleanedCardNumber.length >= 15 &&
      expiry.length >= 5 &&
      isExpiryValid &&
      cvv.length >= 3 &&
      cardName.trim().length > 0
    )
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-lg font-bold tracking-wide text-primary-foreground">TEMPNOW</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Quote
        </Button>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-border bg-card px-6 py-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-card-foreground">Secure Checkout</h1>
                <p className="text-sm text-muted-foreground">Your payment information is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 pb-12">
        <div className="mx-auto max-w-2xl">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="h-1 bg-gradient-to-r from-primary/80 to-primary" />

              <div className="border-b border-border bg-muted px-6 py-4">
                <h2 className="text-sm font-semibold text-card-foreground">Documents Summary</h2>
              </div>
              <div className="divide-y divide-border p-6">
                <div className="flex items-center gap-4 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground">Registration</div>
                    <div className="text-base font-semibold text-card-foreground">LX61 JYE</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground">Vehicle</div>
                    <div className="text-base font-semibold text-card-foreground">BMW 1 Series</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground">Duration</div>
                    <div className="text-base font-semibold text-card-foreground">1 hour</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground">Name</div>
                    <div className="text-base font-semibold text-card-foreground">John Doe</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="h-1 bg-gradient-to-r from-primary/80 to-primary" />

              <div className="p-6">
                <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">Payment Method</h2>
                </div>

                <div className="mb-6 rounded-lg border border-border bg-primary/5 p-5 text-center">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Amount Due
                  </div>
                  <div className="text-4xl font-bold text-primary">£24.51</div>
                </div>

                {paymentView === "selection" && (
                  <>
                    <h3 className="mb-4 text-sm font-medium text-foreground">Select Payment Method</h3>

                    <div className="space-y-3">
                      <button
                        onClick={() => setPaymentView("card-details")}
                        className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-border/80 hover:bg-accent"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium text-card-foreground">Credit or Debit Card</div>
                            <div className="text-sm text-muted-foreground">Visa, Mastercard, Amex accepted</div>
                          </div>
                          <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
                        </div>
                      </button>

                      <button
                        onClick={() => setPaymentView("bank-details")}
                        className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-border/80 hover:bg-accent"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium text-card-foreground">Bank Transfer</div>
                            <div className="text-sm text-muted-foreground">Secure direct payment from your bank</div>
                          </div>
                          <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
                        </div>
                      </button>
                    </div>
                  </>
                )}

                {paymentView === "card-details" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-4">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-card-foreground">Credit or Debit Card</div>
                        <div className="text-sm text-muted-foreground">Enter your card details below</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-sm font-medium text-foreground">
                          Card Number
                        </Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            className="h-11 pr-14"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                          />
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 transition-opacity duration-700">
                            {cardType === "visa" && (
                              <div
                                key="visa"
                                className="flex h-6 w-9 items-center justify-center rounded-sm animate-in fade-in duration-500"
                              >
                                <img
                                  src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/visa.svg"
                                  alt="Visa"
                                  className="h-full w-full rounded-sm object-contain"
                                />
                              </div>
                            )}
                            {cardType === "mastercard" && (
                              <div
                                key="mastercard"
                                className="flex h-6 w-9 items-center justify-center rounded-sm animate-in fade-in duration-500"
                              >
                                <img
                                  src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/mastercard.svg"
                                  alt="Mastercard"
                                  className="h-full w-full rounded-sm object-contain"
                                />
                              </div>
                            )}
                            {cardType === "amex" && (
                              <div
                                key="amex"
                                className="flex h-6 w-9 items-center justify-center rounded-sm animate-in fade-in duration-500"
                              >
                                <img
                                  src="https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/american-express.svg"
                                  alt="American Express"
                                  className="h-full w-full rounded-sm object-contain"
                                />
                              </div>
                            )}
                            {!cardType && (
                              <div
                                key={`shuffle-${shuffleIndex}`}
                                className="flex h-6 w-9 items-center justify-center rounded-sm animate-in fade-in duration-700"
                              >
                                <img
                                  src={cardLogos[shuffleIndex] || "/placeholder.svg"}
                                  alt="Card"
                                  className="h-full w-full rounded-sm object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry" className="text-sm font-medium text-foreground">
                            Expiry Date
                          </Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            className={`h-11 ${!isExpiryValid && expiry.length >= 5 ? "text-red-600" : ""}`}
                            value={expiry}
                            onChange={handleExpiryChange}
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv" className="text-sm font-medium text-foreground">
                            CVV
                          </Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            className="h-11"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName" className="text-sm font-medium text-foreground">
                          Cardholder Name
                        </Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          className="h-11"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                          className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          I confirm I've read and agree to the{" "}
                          <a href="#" className="font-medium text-primary hover:underline">
                            Terms of Service
                          </a>{" "}
                          and understand this is a non-refundable digital document service.
                        </span>
                      </label>
                    </div>

                    <Button
                      className="h-14 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                      disabled={!termsAccepted || !isCardFormValid()}
                    >
                      <Lock className="mr-2 h-5 w-5" />
                      Pay £24.51
                    </Button>

                    <Button variant="outline" onClick={() => setPaymentView("selection")} className="w-full gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Return to Payment Methods
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Secure & Encrypted</span>
                    </div>
                  </div>
                )}

                {paymentView === "bank-details" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-4">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium text-card-foreground">Bank Transfer</div>
                        <div className="text-sm text-muted-foreground">Direct payment from your bank</div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted p-6 text-center">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Once you confirm your order, we'll provide complete bank transfer instructions including all
                        account details needed to complete your payment securely.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox
                          id="terms-bank"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                          className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          I confirm I've read and agree to the{" "}
                          <a href="#" className="font-medium text-primary hover:underline">
                            Terms of Service
                          </a>{" "}
                          and understand this is a non-refundable digital document service.
                        </span>
                      </label>
                    </div>

                    <Button
                      className="h-14 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                      disabled={!termsAccepted}
                    >
                      <Lock className="mr-2 h-5 w-5" />
                      Pay £24.51
                    </Button>

                    <Button variant="outline" onClick={() => setPaymentView("selection")} className="w-full gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Return to Payment Methods
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Secure & Encrypted</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-card-foreground">Technical Support & Refunds</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    If you experience any technical issues during your payment or delivery, please contact our support
                    team immediately. Refunds are available if any issues occur during the delivery process that prevent
                    you from using the service as intended.
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Contact Support
                    <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
