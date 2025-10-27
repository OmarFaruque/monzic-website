"use client";

import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNotifications } from "@/hooks/use-notifications"

interface DecodedToken {
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  iat: number;
  exp: number;
}

export default function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { notifications, addNotification, removeNotification } = useNotifications()

  useEffect(() => {
    const fetchClientToken = async () => {
      try {
        const response = await fetch("/api/paddle/client-token");
        const data = await response.json();
        return data.clientToken;
      } catch (error) {
        console.error("Error fetching client token:", error);
        return null;
      }
    };

    const fetchEnvironment = async () => {
      try {
        const response = await fetch("/api/paddle/environment");
        const data = await response.json();
        return data.environment;
      } catch (error) {
        console.error("Error fetching environment:", error);
        return "sandbox"; // Default to sandbox on error
      }
    };

    const initPaddle = async () => {
      const clientToken = await fetchClientToken();
      const environment = await fetchEnvironment();
      if (clientToken) {
        initializePaddle({
          environment: environment,
          token: clientToken,
          eventCallback: function(event) {
            
            if (event.name === "checkout.error") {
                console.error("Paddle Checkout Error:", event);
                 addNotification({
                  type: "error",
                  title: "Payment Failed",
                  message: "An error occurred during the payment process. Please try again.",
                });
            }
        
            if (event.name === "checkout.completed") {
                const token = Cookies.get("auth_token");
                const transactionId = event.data?.transaction_id || event.data?.checkout?.id;
                let user: DecodedToken | null = null;
                if (token) {
                    user = jwtDecode<DecodedToken>(token);
                }


                

                const customData = event.data.custom_data;


                if (customData && customData.document_details) {
                    const docDetails = JSON.parse(customData.document_details);
                    const userDetails = JSON.parse(customData.user_details);

                    fetch("/api/ai-documents/save-document", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ 
                            docDetails,
                            userDetails,
                            transaction: event.data,
                        })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Failed to save document");
                        }
                        return response.json();
                    })
                    .then(data => {
                        localStorage.setItem("aiDocumentContent", docDetails.content);
                        localStorage.setItem("aiDocumentType", docDetails.prompt.substring(0, 100) + "...");
                        window.location.href = "/ai-payment-confirmation";
                    })
                    .catch(error => {
                        console.error("Error saving AI document:", error);
                        addNotification({
                          type: "error",
                          title: "Document Save Failed",
                          message: "An error occurred while saving the document. Please try again.",
                        });
                    });
                } else {
                    const storedQuoteData = localStorage.getItem("quoteData");

                 

                    if (storedQuoteData) {
                        const quoteData = JSON.parse(storedQuoteData);
                        const quoteId = quoteData.id;
                        fetch(`/api/quotes/${quoteId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(
                              { 
                                PaymentStatus: "paid", 
                                PaymentMethod: "paddle",
                                PaymentIntentId: transactionId, 
                                userId: user?.id,
                                updatePrice: quoteData?.quoteData?.update_price,
                                promoCode: quoteData?.quoteData?.promoCode
                              }
                            )
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error("Network response was not ok");
                            }
                            return response.json();
                        })
                        .then(data => {
                            localStorage.removeItem('quoteCreationTimestamp');
                            window.location.href = "/payment-confirmation";
                        })
                        .catch(error => {
                            console.error("Error updating quote data:", error);
                            addNotification({
                              type: "error",
                              title: "Quote Update Failed",
                              message: "An error occurred while updating the quote. Please try again.",
                            });
                        });
                    }
                }
            }
        }
        }).then((paddleInstance: Paddle | undefined) => {
          if (paddleInstance) {
            setPaddle(paddleInstance);
            setLoading(false);
          }
        });
      }
    };

    if (typeof window !== "undefined" && !paddle) {
      initPaddle();
    }
  }, [paddle]);

  return { paddle, loading };
}
