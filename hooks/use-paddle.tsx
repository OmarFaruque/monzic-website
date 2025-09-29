"use client";

import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export default function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);
  const [loading, setLoading] = useState(true);

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
            console.log("Paddle Event:", event);
            if (event.name === "checkout.error") {
                console.error("Paddle Checkout Error:", event);
            }
        
            if (event.name === "checkout.completed") {
                const storedQuoteData = localStorage.getItem("quoteData");
                const token = Cookies.get("auth_token");
                let user = null;
                if (token) {
                    user = jwtDecode(token);
                }

                if (storedQuoteData) {
                    const quoteData = JSON.parse(storedQuoteData);
                    fetch("/api/quotes", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ quoteData, user })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        return response.json();
                    })
                    .then(data => {
                        if(data.success){
                            window.location.href = "/payment-confirmation";
                        }
                    })
                    .catch(error => {
                        console.error("Error sending quote data:", error);
                    });
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
