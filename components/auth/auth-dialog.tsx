"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, User, ArrowRight, Shield, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/context/settings"
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onSuccess: () => void;
  disableRedirect?: boolean;
}

export function AuthDialog({
  isOpen,
  onClose,
  title,
  description,
  onSuccess,
  disableRedirect = false,
}: AuthDialogProps) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showVerification, setShowVerification] = useState(false);

  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    agreeToTerms: false,
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const settings = useSettings()
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showVerification && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setCanResend(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showVerification, timeLeft]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.email) {
        // Replace showError with a more appropriate notification for the dialog
        console.error("Missing Information", "Please fill in all required fields.");
        setIsLoading(false);
        return;
      }

      if (!isLogin) {
        if (!formData.agreeToTerms) {
          // Replace showWarning with a more appropriate notification for the dialog
          console.warn("Terms Required", "Please agree to the Terms of Service and Privacy Policy.");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          }),
        });

        if (!response.ok) {
          // Replace showError with a more appropriate notification for the dialog
          console.error("Registration Failed", "An unknown error occurred.");
        } else {
          // Replace showInfo with a more appropriate notification for the dialog
          console.info("Verification Required", "Please check your email for a 6-digit verification code to complete your registration.");
          setUserEmail(formData.email);
          setShowVerification(true);
          setTimeLeft(300);
          setCanResend(false);
        }
      } else {
        if (!formData.email) {
          // Replace showError with a more appropriate notification for the dialog
          console.error("Missing Information", "Please fill in your email address.");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/auth/request-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            toast({
              variant: "destructive",
              title: "Email Not Found",
              description: "This email is not registered. Please sign up or try a different email.",
            });
          } else {
            const errorData = await response.json().catch(() => ({}));
            toast({
              variant: "destructive",
              title: "Authentication Failed",
              description: errorData.error || "An unknown error occurred. Please try again.",
            });
          }
        } else {
          // Replace showInfo with a more appropriate notification for the dialog
          console.info("Verification Required", "Please check your email for a 6-digit verification code to sign in.");
          setUserEmail(formData.email);
          setShowVerification(true);
          setTimeLeft(300);
          setCanResend(false);
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      // Replace showError with a more appropriate notification for the dialog
      console.error("Error", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join("");

    if (code.length !== 6) {
      // Replace showWarning with a more appropriate notification for the dialog
      console.warn("Incomplete Code", "Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Replace showError with a more appropriate notification for the dialog
        console.error("Verification Failed", "An unknown error occurred.");
        setVerificationCode(["", "", "", "", "", ""]);
        document.getElementById("code-0")?.focus();
      } else {
        login({ user: data.user, token: data.token }, { redirect: !disableRedirect });
        // Replace showSuccess with a more appropriate notification for the dialog
        console.log("Email Verified!", "Your account is now active. Proceeding...");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Verification submission error:", error);
      // Replace showError with a more appropriate notification for the dialog
      console.error("Error", "An error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!userEmail) return;
    try {
      await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      setTimeLeft(300);
      setCanResend(false);
      setVerificationCode(["", "", "", "", "", ""]);
      // Replace showInfo with a more appropriate notification for the dialog
      console.info("Verification Code Resent", "A new verification code has been sent to your email.");
    } catch (error) {
      // Replace showError with a more appropriate notification for the dialog
      console.error("Error", "Failed to resend code. Please try again.");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      agreeToTerms: false,
    });
    setShowVerification(false);
    setRememberMe(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`p-0 max-w-md ${isVerifying ? 'backdrop-blur-sm' : ''}`}>
        <div className="sm:rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-6 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">{isLogin ? "Welcome Back" : `Join ${settings.siteName}`}</h2>
            <p className="text-teal-100 text-sm">
              {isLogin ? "Sign in to your account" : "Create your account to get started"}
            </p>
          </div>

          {!showVerification ? (
            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="John"
                          className="pl-10 h-12 border-2 border-gray-200 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Doe"
                          className="pl-10 h-12 border-2 border-gray-200 focus:border-teal-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className="pl-11 h-12 border-2 border-gray-200 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-5 w-5 text-teal-600 border-2 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="remember-me" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Keep me signed in
                    </label>
                    <Shield className="w-4 h-4 text-teal-600 ml-auto" />
                  </div>
                )}

                {!isLogin && (
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms-agreement"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                      className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 flex-shrink-0"
                      required
                    />
                    <label htmlFor="terms-agreement" className="text-sm text-gray-600 leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms-of-services" className="text-teal-600 hover:text-teal-700 underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy-policy" className="text-teal-600 hover:text-teal-700 underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button onClick={toggleMode} className="text-teal-600 hover:text-teal-700 font-semibold underline">
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="px-6 py-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
                <p className="text-gray-600 text-sm">We've sent a 6-digit verification code to:</p>
                <p className="font-semibold text-teal-600 mt-1 break-all">{userEmail}</p>
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Enter Verification Code
                  </label>
                  <div className="flex justify-center space-x-2 flex-wrap">
                    {verificationCode.map((digit, index) => (
                      <Input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                        className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-200 focus:border-teal-500 rounded-lg"
                        autoComplete="off"
                      />
                    ))}
                  </div>
                </div>

                

                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-teal-600 hover:text-teal-700 font-semibold underline flex items-center justify-center space-x-2 mx-auto text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend Code</span>
                    </button>
                  ) : (
                    <p className="text-gray-500 text-sm flex items-center justify-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Resend available in {formatTime(timeLeft)}</span>
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white h-12 font-semibold flex items-center justify-center space-x-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowVerification(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  Cancel and go back
                </button>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}