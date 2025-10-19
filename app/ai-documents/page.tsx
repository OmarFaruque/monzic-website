"use client";

import React from "react";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import Cookies from "js-cookie";
import Link from "next/link";
import {
  Download,
  Sparkles,
  Paperclip,
  Edit3,
  FileText,
  Tag,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Shield,
  X,
  Menu,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import usePaddle from "@/hooks/use-paddle";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import Airwallex from "airwallex-payment-elements";

import { PaymentForm, CreditCard as SquareCreditCard } from 'react-square-web-payments-sdk';

import { useSettings } from "@/context/settings";

const StripePayment = React.forwardRef(
  ({ docData, user, tip, discount, totalWithTip, onProcessingChange }, ref) => {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();

    React.useImperativeHandle(ref, () => ({
      async handlePayment() {
        if (!stripe || !elements) {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "Stripe is not available. Please try again later.",
          });
          onProcessingChange(false);
          return;
        }
        onProcessingChange(true);

        try {
          const response = await fetch(
            "/api/ai-documents/create-stripe-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                docData,
                user,
                tip,
                discount,
              }),
            }
          );

          const { clientSecret, error: clientSecretError } =
            await response.json();

          if (clientSecretError) {
            toast({
              variant: "destructive",
              title: "Payment Error",
              description:
                clientSecretError.message ||
                "Could not initiate payment. Please try again.",
            });
            onProcessingChange(false);
            return;
          }

          const cardElement = elements.getElement(CardElement);

          if (!cardElement) {
            toast({
              variant: "destructive",
              title: "Payment Error",
              description: "Card element not found. Please try again later.",
            });
            onProcessingChange(false);
            return;
          }

          const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            {
              payment_method: {
                card: cardElement,
              },
            }
          );

          if (error) {
            toast({
              variant: "destructive",
              title: "Payment Error",
              description:
                error.message ||
                "An unexpected error occurred. Please try again.",
            });
          } else if (paymentIntent.status === "succeeded") {
            toast({
              title: "Payment Successful",
              description: "Your payment has been processed successfully.",
            });

            fetch("/api/ai-documents/save-document", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Cookies.get("auth_token")}`,
              },
              body: JSON.stringify({
                docDetails: {
                  prompt: docData.prompt,
                  content: docData.content,
                  price: totalWithTip,
                },
                userDetails: user,
                transaction: paymentIntent,
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to save document");
                }
                return response.json();
              })
              .then((data) => {
                localStorage.setItem("aiDocumentContent", docData.content);
                localStorage.setItem(
                  "aiDocumentType",
                  docData.prompt.substring(0, 100) + "..."
                );
                window.location.href = "/ai-payment-confirmation";
              })
              .catch((error) => {
                console.error("Error saving AI document:", error);
                toast({
                  variant: "destructive",
                  title: "Document Save Failed",
                  description:
                    "An error occurred while saving the document. Please try again.",
                });
              });
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "An unexpected error occurred. Please try again.",
          });
        } finally {
          onProcessingChange(false);
        }
      },
    }));

    return (
      <div className="border border-gray-200 rounded-xl p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
    );
  }
);
StripePayment.displayName = "StripePayment";

function AIDocumentsPage({ paymentProvider }: { paymentProvider: string | null }) {
  const [documentRequest, setDocumentRequest] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const settings = useSettings();
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [expandedSection, setExpandedSection] = useState("");
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const { toast } = useToast();
  const { paddle, loading: isPaddleLoading } = usePaddle();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const airwallexCardRef = useRef(null);
  const [airwallexElement, setAirwallexElement] = useState(null);
  const stripePaymentRef = useRef<{ handlePayment: () => Promise<void> }>(null);


  const documentPrice = settings?.openai?.price ?? 10;

  const getDiscountAmount = useCallback(() => {
    if (!appliedDiscount || appliedDiscount.error) return 0;
    if (appliedDiscount.discount.type === "percentage") {
      return (documentPrice * appliedDiscount.discount.value) / 100;
    } else {
      return Math.min(documentPrice, appliedDiscount.discount.value);
    }
  }, [appliedDiscount, documentPrice]);

  useEffect(() => {
    if (paymentProvider === "airwallex" && showPaymentPopup) {
      const initAirwallex = async () => {
        try {
          await Airwallex.loadAirwallex({ env: "demo" });
          const response = await fetch(
            "/api/ai-documents/create-airwallex-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                docData: {
                  prompt: documentRequest,
                  content: generatedText,
                  price: documentPrice,
                },
                user: user,
                tip: tipAmount,
                discount: appliedDiscount ? getDiscountAmount() : 0,
              }),
            }
          );
          const { clientSecret, intentId } = await response.json();

          const cardElement = Airwallex.createElement("card", {
            intent: {
              id: intentId,
              client_secret: clientSecret,
            },
          });
          cardElement.mount(airwallexCardRef.current);
          setAirwallexElement(cardElement);
        } catch (error) {
          console.error("Airwallex initialization failed:", error);
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "Failed to initialize Airwallex.",
          });
        }
      };
      initAirwallex();
    }
  }, [paymentProvider, showPaymentPopup, documentRequest, generatedText, documentPrice, user, tipAmount, appliedDiscount, getDiscountAmount, toast]);

  const quickTemplates = useMemo(
    () => [
      "Write a comprehensive marketing strategy for a new mobile app",
      "Create a detailed technical specification for a web platform",
      "Draft a professional investor pitch deck for a fintech startup",
      "Develop a strategic business expansion plan for international markets",
    ],
    []
  );

  const handleTemplateClick = useCallback((template: string) => {
    setDocumentRequest(template);
  }, []);

  const generateDocument = useCallback(async () => {
    if (!documentRequest.trim()) return;

    setIsGenerating(true);

    try {
      const token = Cookies.get("auth_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/ai-documents", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          prompt: documentRequest,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.content) {
        setGeneratedText(data.content);
        setShowOutput(true);
      } else {
        throw new Error("No content received from the server.");
      }
    } catch (error) {
      console.error("Error generating document:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [documentRequest]);

  const handleGenerateDocument = useCallback(async () => {
    if (!documentRequest.trim()) return;

    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    await generateDocument();
  }, [documentRequest, isAuthenticated, generateDocument]);

  const handleEditRequest = useCallback(() => {
    setShowOutput(false);
  }, []);

  const handleDownloadPDF = useCallback(() => {
    setShowPaymentPopup(true);
  }, []);

  const finalPrice = documentPrice - getDiscountAmount();
  const totalWithTip = finalPrice + tipAmount;

  const handlePayment = useCallback(async (token) => {
    switch (paymentProvider) {
      case 'square':
          if (token) {
              setIsSubmitting(true);
              try {
                  const response = await fetch('/api/ai-documents/create-square-payment', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                          sourceId: token.token,
                          docData: {
                            prompt: documentRequest,
                            content: generatedText,
                            price: documentPrice,
                        },
                        user: user,
                        tip: tipAmount,
                        discount: appliedDiscount ? getDiscountAmount() : 0,
                      }),
                  });

                  if (response.ok) {
                    toast({
                        title: "Payment Successful",
                        description: "Your payment has been processed successfully.",
                    });
                    fetch("/api/ai-documents/save-document", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${Cookies.get("auth_token")}`,
                        },
                        body: JSON.stringify({
                          docDetails: {
                            prompt: documentRequest,
                            content: generatedText,
                            price: totalWithTip,
                          },
                          userDetails: user,
                          transaction: 'paid',
                        }),
                      })
                        .then((response) => {
                          if (!response.ok) {
                            throw new Error("Failed to save document");
                          }
                          return response.json();
                        })
                        .then((data) => {
                          localStorage.setItem("aiDocumentContent", generatedText);
                          localStorage.setItem(
                            "aiDocumentType",
                            documentRequest.substring(0, 100) + "..."
                          );
                          window.location.href = "/ai-payment-confirmation";
                        })
                        .catch((error) => {
                          console.error("Error saving AI document:", error);
                          toast({
                            variant: "destructive",
                            title: "Document Save Failed",
                            description:
                              "An error occurred while saving the document. Please try again.",
                          });
                        });
                  } else {
                    const error = await response.json();
                    toast({
                        variant: "destructive",
                        title: "Payment Error",
                        description: error.details || "An unexpected error occurred. Please try again.",
                    });
                  }
              } catch (error) {
                  toast({
                      variant: "destructive",
                      title: "Payment Error",
                      description: "An unexpected error occurred. Please try again.",
                  });
              } finally {
                  setIsSubmitting(false);
              }
          }
          break;
      case 'paddle':
        if (!paddle) {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "Paddle is not available. Please try again later.",
          });
          return;
        }

        setIsSubmitting(true);

        try {
          const response = await fetch("/api/ai-documents/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              docData: {
                prompt: documentRequest,
                content: generatedText,
                price: documentPrice,
              },
              user: user,
              tip: tipAmount,
              discount: appliedDiscount ? getDiscountAmount() : 0,
            }),
          });

          const data = await response.json();

          if (data.priceId) {
            paddle.Checkout.open({
              items: [
                {
                  priceId: data.priceId,
                  quantity: 1,
                },
              ],
              customer: {
                email: user.email,
              },
              customData: {
                document_details: JSON.stringify({
                  prompt: documentRequest,
                  content: generatedText,
                  price: documentPrice,
                }),
                user_details: JSON.stringify(user),
              },
            });
          } else {
            toast({
              variant: "destructive",
              title: "Payment Error",
              description:
                data.error || "Could not initiate payment. Please try again.",
            });
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "An unexpected error occurred. Please try again.",
          });
        } finally {
          setIsSubmitting(false);
        }
        break;
      case 'mollie':
        setIsSubmitting(true);
        try {
          const response = await fetch("/api/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              docData: {
                prompt: documentRequest,
                content: generatedText,
                price: documentPrice,
              },
              user: user,
              tip: tipAmount,
              discount: appliedDiscount ? getDiscountAmount() : 0,
            }),
          });

          const data = await response.json();

          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
          } else {
            toast({
              variant: "destructive",
              title: "Payment Error",
              description:
                data.error || "Could not initiate payment. Please try again.",
            });
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "An unexpected error occurred. Please try again.",
          });
        } finally {
          setIsSubmitting(false);
        }
        break;
      case 'stripe':
        if (stripePaymentRef.current) {
          await stripePaymentRef.current.handlePayment();
        } else {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "Stripe component not ready.",
          });
          setIsSubmitting(false);
        }
        break;
      case 'airwallex':
        if (!airwallexElement) {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description: "Airwallex is not ready. Please try again later.",
          });
          return;
        }
        setIsSubmitting(true);
        try {
          await Airwallex.confirmPaymentIntent({
            element: airwallexElement,
            id: airwallexElement.intent.id,
            client_secret: airwallexElement.intent.client_secret,
          });
          // Handle success
          toast({
            title: "Payment Processing",
            description: "Your payment is processing. You will receive an email with your document shortly.",
          });
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Payment Error",
            description:
              error.message || "An unexpected error occurred. Please try again.",
          });
        } finally {
          setIsSubmitting(false);
        }
        break;
    }
  }, [paddle, documentRequest, generatedText, documentPrice, user, tipAmount, appliedDiscount, toast, paymentProvider, airwallexElement, getDiscountAmount, totalWithTip]);

  const onPayClick = async () => {
      if (paymentProvider !== 'square') {
          setIsSubmitting(true);
          handlePayment();
      }
  }


  const applyDiscountCode = useCallback(async () => {
    if (!discountCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a promo code",
      });
      return;
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoCode: discountCode,
          total: documentPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          toast({
            variant: "destructive",
            title: "Invalid Code",
            description:
              data.error || "The promo code is invalid or expired.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error || "Failed to validate promo code.",
          });
        }
        setAppliedDiscount({ error: data.error || "Invalid discount code" });
      } else {
        setAppliedDiscount(data);
        toast({
          title: "Promo Code Applied",
          description: `Successfully applied promo code ${data.promoCode}`
        });
      }
    } catch (error: any) {
      setAppliedDiscount({ error: "Invalid discount code" });
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  }, [discountCode, documentPrice, toast]);

  const removeDiscount = useCallback(() => {
    setAppliedDiscount(null);
    setDiscountCode("");
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => (prev === section ? "" : section));
  }, []);

  const formatCardNumber = useCallback((value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(" ") : value;
  }, []);

  const formatExpiry = useCallback((value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    return v.length >= 2 ? `${v.substring(0, 2)} / ${v.substring(2, 4)}` : v;
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-teal-600 px-4 sm:px-6 py-3 sm:py-4 shadow-md flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl sm:text-2xl font-bold text-white hover:text-teal-100 transition-colors"
            >
              {settings?.siteName}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex gap-2 md:gap-3">
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent text-sm md:text-base px-3 md:px-4"
              >
                Contact
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent text-sm md:text-base px-3 md:px-4"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent text-sm md:text-base px-3 md:px-4"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-white hover:bg-teal-700 rounded-md transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pb-4 border-t border-teal-500 pt-4">
            <div className="flex flex-col space-y-3">
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
                >
                  Contact
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full border-teal-400 text-white hover:bg-teal-500 hover:border-white bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>AI-Powered Document Generation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight px-4">
              Transform Ideas into
              <span className="text-teal-600 block">
                Professional Documents
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Our advanced AI technology creates high-quality, personalized
              documents in seconds. From business proposals to technical
              specifications, get professionally formatted content instantly.
            </p>

            {/* Feature highlights */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 mt-4 px-4">
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                <span className="text-sm sm:text-base">
                  Instant Generation
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                <span className="text-sm sm:text-base">
                  Professional Quality
                </span>
              </div>
            </div>

            {/* Pricing Comparison */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mt-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  How It Works
                </h2>
                <p className="text-sm text-gray-600">
                  Generate unlimited documents for free, download when ready
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Free Section */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200 relative">
                  <div className="absolute -top-2 left-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      FREE
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Eye className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Generate & Preview
                      </h3>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1.5">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Unlimited document generation</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Full preview & editing</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>No time limits</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Paid Section */}
                <div className="bg-teal-50 rounded-lg p-4 border border-teal-200 relative">
                  <div className="absolute -top-2 left-4">
                    <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded">
                      £{documentPrice}
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center">
                        <Download className="w-4 h-4 text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        Professional PDF
                      </h3>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1.5">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                        <span>High-quality PDF format</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                        <span>Print-ready quality</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full"></div>
                        <span>Instant download</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 mt-4 max-w-2xl mx-auto">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    <span className="font-medium">
                      Perfect for trying before buying:
                    </span>{" "}
                    Generate and perfect your document completely free, then
                    pay only when you're satisfied and ready to download.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Generation Section */}
          {!showOutput && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Generate Your Document
                    </h2>
                    <p className="text-teal-100 text-sm sm:text-base">
                      Describe what you need and let our AI create it for you
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                <div className="relative">
                  <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
                    What type of document do you need?
                  </label>
                  <div className="relative">
                    <Textarea
                      value={documentRequest}
                      onChange={(e) => setDocumentRequest(e.target.value)}
                      placeholder="e.g., A comprehensive business proposal for a tech startup, a detailed marketing strategy for a mobile app launch, a technical specification document..."
                      className="min-h-20 sm:min-h-24 resize-none text-sm sm:text-base border-2 border-gray-200 focus:border-teal-500 rounded-xl"
                      disabled={isGenerating}
                    />
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-teal-600 hover:bg-teal-50 hover:text-teal-700 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                      >
                        <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Attach Files</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Templates */}
                <div className="space-y-3">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                    Quick Start Templates
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {quickTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => handleTemplateClick(template)}
                        className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 text-left group touch-manipulation"
                        disabled={isGenerating}
                      >
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
                          <FileText className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium text-sm leading-relaxed">
                            {template}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateDocument}
                  disabled={!documentRequest.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Your Document...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-5 h-5" />
                      <span>Generate Document</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Generated Document Section */}
          {showOutput && generatedText && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Document Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 sm:px-6 py-4 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Your Document is Ready!
                    </h3>
                    <p className="text-emerald-100 text-sm sm:text-base">
                      Review your generated content below
                    </p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <Button
                    onClick={handleEditRequest}
                    variant="outline"
                    className="border-teal-300 text-teal-100 hover:bg-teal-500 hover:border-white bg-transparent flex items-center justify-center space-x-2 text-sm sm:text-base h-12 touch-manipulation"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Request</span>
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-white text-teal-700 hover:bg-gray-50 flex items-center justify-center space-x-2 font-semibold text-sm sm:text-base h-12 touch-manipulation"
                  >
                    <Download className="w-4 h-4" />
                    <span>{`Download PDF - £${documentPrice}`}</span>
                  </Button>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-4 sm:p-6">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 max-h-[60vh] overflow-y-auto border border-gray-200">
                  <div
                    className="prose prose-sm sm:prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedText }}
                  />
                </div>
              </div>
            </div>
          )}

          <AuthDialog
            isOpen={isAuthDialogOpen}
            onClose={() => setIsAuthDialogOpen(false)}
            title="Sign In to Generate Documents"
            description="Sign in to your account to access our AI document generation service."
            onSuccess={() => {
              setIsAuthDialogOpen(false);
              // we need to trigger document generation again
              generateDocument();
            }}
            disableRedirect={true}
          />

          {/* Payment Popup */}
          {showPaymentPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`relative bg-white rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl overflow-y-auto ${isSubmitting ? '' : 'max-h-[90vh]'}`}>
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Download className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Complete Your Purchase
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Your document is ready! Complete your purchase to download
                    the PDF.
                  </p>
                </div>

                {paymentProvider === 'square' && settings?.square?.appId && settings?.square?.appLocationId ? (
                    <PaymentForm
                        applicationId={settings.square.appId}
                        locationId={settings.square.appLocationId}
                        cardTokenizeResponseReceived={async (token) => {
                            handlePayment(token);
                        }}
                    >
                        <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
                            {/* Order Summary */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                <div className="flex justify-between items-center text-sm sm:text-base">
                                <span className="text-gray-700 font-medium">
                                    AI Generated Document
                                </span>
                                <span className="font-semibold text-gray-900">
                                    £{documentPrice.toFixed(2)}
                                </span>
                                </div>

                                {appliedDiscount && !appliedDiscount.error && (
                                <div className="flex justify-between items-center text-green-600 text-xs sm:text-sm">
                                    <span>Discount ({appliedDiscount.promoCode})</span>
                                    <span>-£{getDiscountAmount().toFixed(2)}</span>
                                </div>
                                )}

                                {tipAmount > 0 && (
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span>Tip</span>
                                    <span>£{tipAmount.toFixed(2)}</span>
                                </div>
                                )}

                                <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center font-bold text-base sm:text-lg">
                                    <span>Total</span>
                                    <span className="text-teal-600">
                                    £{totalWithTip.toFixed(2)}
                                    </span>
                                </div>
                                </div>
                            </div>

                            {/* Discount Code Section */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                Discount Code
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                    type="text"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    placeholder="Enter discount code"
                                    className="pl-10 h-12 text-sm sm:text-base text-gray-900"
                                    disabled={appliedDiscount && !appliedDiscount.error}
                                    />
                                </div>
                                {appliedDiscount && !appliedDiscount.error ? (
                                    <Button
                                    onClick={removeDiscount}
                                    variant="outline"
                                    className="text-red-600 border-red-300 h-12 text-sm sm:text-base touch-manipulation"
                                    >
                                    Remove
                                    </Button>
                                ) : (
                                    <Button
                                    onClick={applyDiscountCode}
                                    variant="outline"
                                    disabled={!discountCode.trim()}
                                    className="h-12 text-sm sm:text-base touch-manipulation"
                                    >
                                    Apply
                                    </Button>
                                )}
                                </div>

                                {appliedDiscount?.error && (
                                <p className="text-xs text-red-600">
                                    {appliedDiscount.error}
                                </p>
                                )}

                                {appliedDiscount && !appliedDiscount.error && (
                                <p className="text-xs text-green-600">
                                    ✓ Discount applied successfully!
                                </p>
                                )}
                            </div>

                            <div
                                className="border border-gray-200 rounded-xl p-4"
                                onClick={() => {
                                    setIsSubmitting(true);
                                }}
                            >
                               <SquareCreditCard />
                            </div>

                            {/* Collapsible Tip Section */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                onClick={() => toggleSection("tip")}
                                className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-gray-50 transition-colors touch-manipulation"
                                >
                                <div className="flex items-center">
                                    <span className="font-medium text-sm sm:text-base">
                                    {tipAmount > 0
                                        ? `Tip: £${tipAmount}`
                                        : "Tip (optional)"}
                                    </span>
                                </div>
                                {expandedSection === "tip" ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                                </button>

                                {expandedSection === "tip" && (
                                <div className="p-4 border-t border-gray-200 bg-gray-50">
                                    <p className="text-xs text-gray-600 mb-3">
                                    Add a tip to show your appreciation for our service.
                                    </p>
                                    <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={Math.min(tipAmount, 50)}
                                    onChange={(e) =>
                                        setTipAmount(Number(e.target.value))
                                    }
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    style={{
                                        background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${
                                        (Math.min(tipAmount, 50) / 50) * 100
                                        }%, #e5e7eb ${
                                        (Math.min(tipAmount, 50) / 50) * 100
                                        }%, #e5e7eb 100%)`,
                                    }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                                    <span>£0</span>
                                    <span>£50</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                    <span className="text-gray-700">£</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="999"
                                        value={tipAmount}
                                        onChange={(e) => {
                                        const value = Math.max(
                                            0,
                                            Math.min(999, Number(e.target.value) || 0)
                                        );
                                        setTipAmount(value);
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base text-gray-900 h-12"
                                    />
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                            <Button
                                onClick={() => setShowPaymentPopup(false)}
                                variant="outline"
                                className="flex-1 h-12 text-sm sm:text-base touch-manipulation"
                            >
                                Cancel
                            </Button>
                        </div>
                    </PaymentForm>
                ) : (
                    <>
                        <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
                            {/* Order Summary */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                <div className="flex justify-between items-center text-sm sm:text-base">
                                <span className="text-gray-700 font-medium">
                                    AI Generated Document
                                </span>
                                <span className="font-semibold text-gray-900">
                                    £{documentPrice.toFixed(2)}
                                </span>
                                </div>

                                {appliedDiscount && !appliedDiscount.error && (
                                <div className="flex justify-between items-center text-green-600 text-xs sm:text-sm">
                                    <span>Discount ({appliedDiscount.promoCode})</span>
                                    <span>-£{getDiscountAmount().toFixed(2)}</span>
                                </div>
                                )}

                                {tipAmount > 0 && (
                                <div className="flex justify-between items-center text-xs sm:text-sm">
                                    <span>Tip</span>
                                    <span>£{tipAmount.toFixed(2)}</span>
                                </div>
                                )}

                                <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center font-bold text-base sm:text-lg">
                                    <span>Total</span>
                                    <span className="text-teal-600">
                                    £{totalWithTip.toFixed(2)}
                                    </span>
                                </div>
                                </div>
                            </div>

                            {/* Discount Code Section */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                Discount Code
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                    type="text"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    placeholder="Enter discount code"
                                    className="pl-10 h-12 text-sm sm:text-base text-gray-900"
                                    disabled={appliedDiscount && !appliedDiscount.error}
                                    />
                                </div>
                                {appliedDiscount && !appliedDiscount.error ? (
                                    <Button
                                    onClick={removeDiscount}
                                    variant="outline"
                                    className="text-red-600 border-red-300 h-12 text-sm sm:text-base touch-manipulation"
                                    >
                                    Remove
                                    </Button>
                                ) : (
                                    <Button
                                    onClick={applyDiscountCode}
                                    variant="outline"
                                    disabled={!discountCode.trim()}
                                    className="h-12 text-sm sm:text-base touch-manipulation"
                                    >
                                    Apply
                                    </Button>
                                )}
                                </div>

                                {appliedDiscount?.error && (
                                <p className="text-xs text-red-600">
                                    {appliedDiscount.error}
                                </p>
                                )}

                                {appliedDiscount && !appliedDiscount.error && (
                                <p className="text-xs text-green-600">
                                    ✓ Discount applied successfully!
                                </p>
                                )}
                            </div>

                            {paymentProvider === "stripe" && (
                              <StripePayment
                                ref={stripePaymentRef}
                                docData={{
                                  prompt: documentRequest,
                                  content: generatedText,
                                  price: documentPrice,
                                }}
                                user={user}
                                tip={tipAmount}
                                discount={appliedDiscount ? getDiscountAmount() : 0}
                                totalWithTip={totalWithTip}
                                onProcessingChange={setIsSubmitting}
                              />
                            )}

                            {paymentProvider === "airwallex" && (
                                <div
                                id="airwallex-card-element"
                                ref={airwallexCardRef}
                                className="border border-gray-200 rounded-xl p-4"
                                ></div>
                            )}

                            {/* Collapsible Tip Section */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                onClick={() => toggleSection("tip")}
                                className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-gray-50 transition-colors touch-manipulation"
                                >
                                <div className="flex items-center">
                                    <span className="font-medium text-sm sm:text-base">
                                    {tipAmount > 0
                                        ? `Tip: £${tipAmount}`
                                        : "Tip (optional)"}
                                    </span>
                                </div>
                                {expandedSection === "tip" ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                                </button>

                                {expandedSection === "tip" && (
                                <div className="p-4 border-t border-gray-200 bg-gray-50">
                                    <p className="text-xs text-gray-600 mb-3">
                                    Add a tip to show your appreciation for our service.
                                    </p>
                                    <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={Math.min(tipAmount, 50)}
                                    onChange={(e) =>
                                        setTipAmount(Number(e.target.value))
                                    }
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    style={{
                                        background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${
                                        (Math.min(tipAmount, 50) / 50) * 100
                                        }%, #e5e7eb ${
                                        (Math.min(tipAmount, 50) / 50) * 100
                                        }%, #e5e7eb 100%)`,
                                    }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-2">
                                    <span>£0</span>
                                    <span>£50</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                    <span className="text-gray-700">£</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="999"
                                        value={tipAmount}
                                        onChange={(e) => {
                                        const value = Math.max(
                                            0,
                                            Math.min(999, Number(e.target.value) || 0)
                                        );
                                        setTipAmount(value);
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base text-gray-900 h-12"
                                    />
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                            <Button
                                onClick={() => setShowPaymentPopup(false)}
                                variant="outline"
                                className="flex-1 h-12 text-sm sm:text-base touch-manipulation"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onPayClick}
                                disabled={isSubmitting || isPaddleLoading}
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white h-12 text-sm sm:text-base font-semibold touch-manipulation"
                            >
                                {isSubmitting || isPaddleLoading
                                ? "Processing..."
                                : `Pay £${totalWithTip.toFixed(2)}`}
                            </Button>
                        </div>
                    </>
                )}
                {isSubmitting && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl" style={{ zIndex: 999, minHeight: '100%' }}>
                    <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
                    <p className="mt-4 text-lg font-semibold text-gray-700">Processing Payment...</p>
                    <p className="text-sm text-gray-500">Please do not close this window.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AIDocumentsPageWrapper() {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const settings = useSettings();
  const paymentProvider = settings?.paymentProvider?.activeProcessor;

  useEffect(() => {
    if (paymentProvider === 'stripe' && settings?.stripe?.publishableKey) {
      setStripePromise(loadStripe(settings.stripe.publishableKey));
    }
  }, [paymentProvider, settings]);

  if (!settings) { // Check if settings are loaded
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (paymentProvider === 'stripe') {
    if (stripePromise) {
        return (
          <Elements stripe={stripePromise}>
            <AIDocumentsPage paymentProvider={paymentProvider} />
          </Elements>
        );
    } else {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center p-4">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                    <h2 className="mt-2 text-xl font-bold">Payment Gateway Error</h2>
                    <p className="mt-1 text-gray-600">Could not initialize the payment provider. Please contact support.</p>
                </div>
            </div>
        )
    }
  }

  return <AIDocumentsPage paymentProvider={paymentProvider} />;
}
