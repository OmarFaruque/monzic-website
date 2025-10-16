"use client";

import type React from "react";
import DOMPurify from "dompurify";
import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  Shield,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowLeft,
  Info,
  Loader2,
  CreditCard,
  Landmark,
} from "lucide-react";
import { useAuth } from "@/context/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import usePaddle from "@/hooks/use-paddle";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useSettings } from "@/context/settings";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import Loading from "./loading";

// Dynamically import heavy payment components
const PaymentForm = dynamic(() => import('react-square-web-payments-sdk').then(mod => mod.PaymentForm), { ssr: false, loading: () => <Loader2 className="w-5 h-5 animate-spin" /> });
const SquareCreditCard = dynamic(() => import('react-square-web-payments-sdk').then(mod => mod.CreditCard), { ssr: false });
const SquareGooglePay = dynamic(() => import('react-square-web-payments-sdk').then(mod => mod.GooglePay), { ssr: false });
const SquareApplePay = dynamic(() => import('react-square-web-payments-sdk').then(mod => mod.ApplePay), { ssr: false });

interface QuoteData {
  id?: string;
  total: number;
  startTime: string;
  expiryTime: string;
  breakdown: {
    duration: string;
    reason: string;
  };
  customerData: {
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    occupation: string;
    address: string;
    licenseType: string;
    licenseHeld: string;
    vehicleValue: string;
    reason: string;
    duration: string;
    registration: string;
    vehicle: {
      make: string;
      model: string;
      year: string;
    };
  };
  promoCode?: string;
}

interface QuoteCheckoutPageProps {
  paymentProvider: string | null;
  bankPaymentEnabled: boolean;
  squareAppId: string | null;
  squareLocationId: string | null;
}

// Dedicated Paddle button to conditionally load the usePaddle hook
const PaddleCheckoutButton = ({ quoteData, user, discountedTotal, disabled }) => {
  const { paddle, loading: isPaddleLoading } = usePaddle();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaddlePayment = async () => {
    if (!paddle) {
      toast({ variant: "destructive", title: "Payment Error", description: "Paddle is not available." });
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteData: { ...quoteData, total: discountedTotal },
          user: user,
        }),
      });
      const data = await response.json();
      if (data.priceId) {
        paddle.Checkout.open({ items: [{ priceId: data.priceId, quantity: 1 }] });
      } else {
        throw new Error(data.error || "Could not initiate Paddle payment.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Payment Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button onClick={handlePaddlePayment} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-semibold mt-6" disabled={disabled || isPaddleLoading || isProcessing}>
      {isPaddleLoading || isProcessing ? (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span>
        </div>
      ) : `Complete Payment - £${discountedTotal.toFixed(2)}`}
    </Button>
  );
};

function QuoteCheckoutPage({
  paymentProvider,
  bankPaymentEnabled,
  squareAppId,
  squareLocationId,
}: QuoteCheckoutPageProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [showSummary, setShowSummary] = useState(false);
  const [sameAsPersonal, setSameAsPersonal] = useState(true);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [quote, setQuote] = useState<any>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const stripe = paymentProvider === 'stripe' ? useStripe() : null;
  const elements = paymentProvider === 'stripe' ? useElements() : null;
  const airwallexCardRef = useRef(null);
  const [airwallexElement, setAirwallexElement] = useState<any>(null);
  const settings = useSettings();
  const [checkboxContent, setCheckboxContent] = useState<any>([]);

  useEffect(() => {
    if (paymentProvider) {
      setSelectedPaymentMethod(paymentProvider);
    }
  }, [paymentProvider]);

  const paymentMethods = [];
  if (paymentProvider) {
    let providerTitle = paymentProvider.charAt(0).toUpperCase() + paymentProvider.slice(1);
    let providerDescription = "Securely pay with your card.";
    if (paymentProvider === 'square') {
        providerDescription = "Pay with Card, Google Pay, or Apple Pay.";
    }
    paymentMethods.push({
      id: paymentProvider,
      title: `Pay by Card (${providerTitle})`,
      description: providerDescription,
      icon: <CreditCard className="w-8 h-8 text-gray-400" />,
    });
  }
  if (bankPaymentEnabled) {
    paymentMethods.push({
      id: 'bank',
      title: 'Pay by Bank Transfer',
      description: 'Transfer money directly from your bank account.',
      icon: <Landmark className="w-8 h-8 text-gray-400" />,
    });
  }

  useEffect(() => {
    if (!isAuthenticated) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to access this page." });
      router.push("/");
      return;
    }

    const storedQuoteData = localStorage.getItem("quoteData");
    if (storedQuoteData) {
      const parsed = JSON.parse(storedQuoteData);
      const data = typeof parsed.quoteData === "string" ? JSON.parse(parsed.quoteData) : parsed.quoteData;
      setQuoteData(data);
      setQuote(parsed);
    } else {
      router.push("/get-quote");
    }
    if (settings) {
      const checkboxContent = settings?.checkoutCheckboxContent.split('||');
      setCheckboxContent(checkboxContent);
    }
  }, [isAuthenticated, router, settings, toast]);

  useEffect(() => {
    if (selectedPaymentMethod === "airwallex" && isAuthenticated && quoteData) {
      const initAirwallex = async () => {
        try {
          const Airwallex = (await import('airwallex-payment-elements')).default;
          await Airwallex.loadAirwallex({ env: "demo" });
          const response = await fetch("/api/quote-checkout/create-airwallex-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quoteData: { ...quoteData, total: quoteData?.total },
              user: user,
            }),
          });
          const { clientSecret, intentId } = await response.json();
          const cardElement = Airwallex.createElement("card", {
            intent: { id: intentId, client_secret: clientSecret },
          });
          cardElement.mount(airwallexCardRef.current!);
          setAirwallexElement(cardElement);
        } catch (error) {
          console.error("Airwallex initialization failed:", error);
          toast({ variant: "destructive", title: "Payment Error", description: "Failed to initialize Airwallex." });
        }
      };
      initAirwallex();
    }
  }, [selectedPaymentMethod, isAuthenticated, toast, quoteData, user]);

  const [formData, setFormData] = useState({
    termsAccepted: false,
    accuracyConfirmed: false,
    billingAddress1: "",
    billingAddress2: "",
    billingCity: "",
    billingPostcode: "",
    billingCountry: "United Kingdom",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompletePayment = async () => {
    if (!formData.termsAccepted || !formData.accuracyConfirmed) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please accept the terms and confirm accuracy." });
      return;
    }
    setIsProcessingPayment(true);

    switch (selectedPaymentMethod) {
      case "mollie":
        try {
            const response = await fetch("/api/create-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quoteData: { ...quoteData, id: quote.id, policyNumber: quote.policyNumber, total: quoteData?.total },
                    user: user,
                }),
            });
            const data = await response.json();
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error(data.error || "Could not initiate Mollie payment.");
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Payment Error", description: error.message });
            setIsProcessingPayment(false);
        }
        break;

      case "stripe":
        if (!stripe || !elements) {
          toast({ variant: "destructive", title: "Payment Error", description: "Stripe is not available." });
          setIsProcessingPayment(false);
          return;
        }
        try {
          const response = await fetch("/api/quote-checkout/create-stripe-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quoteData: { ...quoteData, id: quote.id, total: quoteData?.total },
              user: user,
            }),
          });
          const { clientSecret, error: clientSecretError } = await response.json();
          if (clientSecretError) throw new Error(clientSecretError.message || "Could not initiate Stripe payment.");
          
          const cardElement = elements.getElement(CardElement);
          if (!cardElement) throw new Error("Card element not found.");

          const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement },
          });
          if (error) throw error;
          if (paymentIntent.status === "succeeded") {
            toast({ title: "Payment Successful", description: "Your payment has been processed." });
            window.location.href = "/payment-confirmation";
          }
        } catch (error: any) {
          toast({ variant: "destructive", title: "Payment Error", description: error.message });
          setIsProcessingPayment(false);
        }
        break;

      case "airwallex":
        if (!airwallexElement) {
          toast({ variant: "destructive", title: "Payment Error", description: "Airwallex is not ready." });
          setIsProcessingPayment(false);
          return;
        }
        try {
          const Airwallex = (await import('airwallex-payment-elements')).default;
          await Airwallex.confirmPaymentIntent({
            element: airwallexElement,
            id: airwallexElement.intent.id,
            client_secret: airwallexElement.intent.client_secret,
          });
          // toast({ title: "Payment Successful", description: "Your payment has been processed." });
          // window.location.href = "/payment-confirmation";

          toast({ title: "Payment Processing", description: "Your payment is processing. You will receive an email confirmation shortly." });


        } catch (error: any) {
          toast({ variant: "destructive", title: "Payment Error", description: error.message });
          setIsProcessingPayment(false);
        }
        break;

      case "bank":
        try {
          const response = await fetch('/api/quote-checkout/update-payment-method', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              policyNumber: quote?.policyNumber,
              paymentMethod: 'bank_transfer',
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update payment method');
          }

          router.push(`/bank-payment-details?policynumber=${quote?.policyNumber}`);
        } catch (error) {
          console.error('Error updating payment method:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'There was an error updating the payment method. Please try again.',
          });
        } finally {
          setIsProcessingPayment(false);
        }
        break;

      default:
        toast({ variant: "destructive", title: "Invalid Payment Method", description: "Please select a valid payment method." });
        setIsProcessingPayment(false);
    }
  };

  const handleSquarePayment = async (token: any) => {
    if (!token) return;
    setIsProcessingPayment(true);
    try {
      const response = await fetch('/api/quote-checkout/create-square-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: token.token,
          quoteData: { ...quoteData, id: quote.id, total: quoteData?.total },
          user: user,
        }),
      });
      if (response.ok) {
        toast({ title: "Payment Successful", description: "Your payment has been processed." });
        window.location.href = "/payment-confirmation";
      } else {
        const error = await response.json();
        throw new Error(error.details || "Square payment failed.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Payment Error", description: error.message });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const createPaymentRequest = () => ({
    countryCode: "GB",
    currencyCode: "GBP",
    total: {
      amount: (quoteData?.total ?? 0).toFixed(2),
      label: "Total",
    },
  });

  console.log('content array: ', settings)


  if (!quoteData) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 shadow-md">
        <div className="flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl sm:text-2xl font-bold text-white cursor-pointer hover:text-teal-100 transition-colors">
              {settings?.siteName || "TEMPNOW"}
            </h1>
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard">
              <Button variant="outline" className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent text-sm md:text-base px-3 md:px-4">
                DASHBOARD
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Button 
              onClick={() => {
                if (quoteData?.customerData?.registration) {
                  router.push(`/get-quote?reg=${quoteData.customerData.registration}&view=review`);
                } else {
                  router.push('/'); // Fallback to home if reg is not found
                }
              }} 
              variant="outline" 
              className="flex items-center space-x-2 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quote</span>
            </Button>
          </div>

          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="w-5 h-5 text-teal-600" />
                <h1 className="text-xl font-bold text-gray-900">Secure Checkout</h1>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">INFORMATION</h2>
                {isAuthenticated ? (
                  <p className="text-gray-700">Logged in as <span className="font-semibold">{user?.email}</span></p>
                ) : (
                  <p className="text-sm text-gray-600">
                    You must be logged in to complete the payment.
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">PAYMENT</h2>
                <div className="text-2xl font-bold text-gray-900 mb-6">
                  £{(quoteData.total).toFixed(2)}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPaymentMethod === method.id
                            ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <div className="flex-shrink-0 mr-4">{method.icon}</div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{method.title}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                          <div className="ml-4">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedPaymentMethod === method.id ? 'border-teal-600 bg-teal-600' : 'border-gray-300'
                              }`}
                            >
                              {selectedPaymentMethod === method.id && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPaymentMethod === "stripe" && (
                  <div className="border border-gray-200 rounded-lg p-4 mb-6"><CardElement options={{ style: { base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } }, invalid: { color: "#9e2146" } } }} /></div>
                )}
                {selectedPaymentMethod === "airwallex" && (
                  <div id="airwallex-card-element" ref={airwallexCardRef} className="border border-gray-200 rounded-lg p-4 mb-6"></div>
                )}
                {selectedPaymentMethod === 'square' && squareAppId && squareLocationId && (
                  <PaymentForm
                    applicationId={squareAppId}
                    locationId={squareLocationId}
                    cardTokenizeResponseReceived={handleSquarePayment}
                    createPaymentRequest={createPaymentRequest}
                  >
                    <div className="space-y-4 my-4">
                      <SquareGooglePay />
                      <SquareApplePay />
                      <div className="border border-gray-200 rounded-lg p-4">
                        <SquareCreditCard />
                      </div>
                    </div>
                  </PaymentForm>
                )}
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">BILLING DETAILS</h2>
                <div className="flex items-center space-x-2">
                  <Checkbox id="same-address" checked={sameAsPersonal} onCheckedChange={(c) => setSameAsPersonal(c as boolean)} />
                  <label htmlFor="same-address" className="text-sm text-gray-700">Same as personal address</label>
                </div>
                {!sameAsPersonal && (
                  <div className="space-y-4 pt-2">
                    {/* Additional billing fields would go here */}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="space-y-3">
                  {checkboxContent && checkboxContent.length > 0 && checkboxContent[0] ? (
                    checkboxContent.map((content, index) => (
                      <div className="flex items-start space-x-3" key={index}>
                        <Checkbox
                          id={`checkout-checkbox-${index}`}
                          checked={index === 0 ? formData.termsAccepted : formData.accuracyConfirmed}
                          onCheckedChange={(c) => {
                            const field = index === 0 ? "termsAccepted" : "accuracyConfirmed";
                            handleInputChange(field, c as boolean);
                          }}
                        />
                        <label
                          htmlFor={`checkout-checkbox-${index}`}
                          className="text-sm text-gray-700 richtext-label"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                        />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start space-x-3">
                        <Checkbox id="terms" checked={formData.termsAccepted} onCheckedChange={(c) => handleInputChange("termsAccepted", c as boolean)} />
                        <label htmlFor="terms" className="text-sm text-gray-700">
                          I confirm I've read and agree to the <Link href="/terms-of-services" className="text-teal-600 hover:text-teal-700">Terms of Service</Link> and understand this is a non-refundable digital document service. *
                        </label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Checkbox id="accuracy" checked={formData.accuracyConfirmed} onCheckedChange={(c) => handleInputChange("accuracyConfirmed", c as boolean)} />
                        <label htmlFor="accuracy" className="text-sm text-gray-700">
                          I acknowledge that all purchases are final and the information I have entered is accurate *
                        </label>
                      </div>
                    </>
                  )}
                </div>
                {selectedPaymentMethod === 'paddle' ? (
                    <PaddleCheckoutButton 
                        quoteData={quoteData}
                        user={user}
                        discountedTotal={quoteData.total}
                        disabled={!formData.termsAccepted || !formData.accuracyConfirmed}
                    />
                ) : selectedPaymentMethod !== 'square' && (
                  <Button onClick={handleCompletePayment} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-semibold mt-6" disabled={!formData.termsAccepted || !formData.accuracyConfirmed || isProcessingPayment}>
                    {isProcessingPayment ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span>
                      </div>
                    ) : `Complete Payment - £${(quoteData.total).toFixed(2)}`}
                  </Button>
                )}
                <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-600">
                  <Shield className="w-4 h-4" /><span>Secure & Encrypted</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:hidden mb-4">
                <Button variant="outline" onClick={() => setShowSummary(!showSummary)} className="w-full flex justify-between items-center">
                  <span>Coverage Details</span>
                  {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
              <div className={`${showSummary ? "block" : "hidden"} lg:block`}>
                <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base font-medium text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-teal-600">£{(quoteData.total).toFixed(2)}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Vehicle:</span><span className="font-medium">{quoteData.customerData.vehicle.year} {quoteData.customerData.vehicle.make} {quoteData.customerData.vehicle.model}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Registration:</span><span className="font-medium">{quoteData.customerData.registration}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Duration:</span><span className="font-medium">{quoteData.breakdown.duration}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Start Time:</span><span className="font-medium">{quoteData.startTime}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Expiry Time:</span><span className="font-medium">{quoteData.expiryTime}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Reason:</span><span className="font-medium">{quoteData.breakdown.reason}</span></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-600"><Info className="w-3 h-3 mr-1" /><span>Need help? Contact support</span></div>
                  </div>
                </div>
              </div>
            </div>

            {isProcessingPayment && (
              <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl" style={{ zIndex: 999, minHeight: '100%' }}>
                <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                <p className="mt-4 text-lg font-semibold text-gray-700">Processing...</p>
                <p className="text-sm text-gray-500">Please do not close this window.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QuoteCheckoutPageWrapper() {
  const [loading, setLoading] = useState(true);
  const [paymentProvider, setPaymentProvider] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [squareAppId, setSquareAppId] = useState<string | null>(null);
  const [squareLocationId, setSquareLocationId] = useState<string | null>(null);
  const [bankPaymentEnabled, setBankPaymentEnabled] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [paymentRes, bankRes] = await Promise.all([
          fetch("/api/settings/payment"),
          fetch("/api/settings/bank"),
        ]);

        const paymentData = await paymentRes.json();

        if (paymentRes.ok) {
          const provider = paymentData.paymentProvider;
          const activeProvider = provider?.activeProcessor || null;
          setPaymentProvider(activeProvider);

          if (activeProvider === 'stripe') {
            const stripeKeyRes = await fetch("/api/settings/stripe");
            const stripeKeyData = await stripeKeyRes.json();
            if (stripeKeyRes.ok) {
              setStripePromise(loadStripe(stripeKeyData.publishableKey));
            }
          } else if (activeProvider === 'square') {
            const squareRes = await fetch("/api/settings/square");
            const squareData = await squareRes.json();
            if (squareRes.ok) {
              setSquareAppId(squareData.appId);
              setSquareLocationId(squareData.appLocationId);
            }
          }
        }

        const bankData = await bankRes.json();

        // console.log("Bank settings:", bankData);

        if (bankRes.ok && bankData.settings?.show) {
          setBankPaymentEnabled(true);
        }
      } catch (error) {
        console.log(error);
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings(); // Initial fetch

    // Cleanup listener when the component unmounts
    return () => {
      // No-op
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  const page = (
    <QuoteCheckoutPage
      paymentProvider={paymentProvider}
      bankPaymentEnabled={bankPaymentEnabled}
      squareAppId={squareAppId}
      squareLocationId={squareLocationId}
    />
  );

  if (paymentProvider === "stripe" && stripePromise) {
    return <Elements stripe={stripePromise}>{page}</Elements>;
  }

  return page;
}