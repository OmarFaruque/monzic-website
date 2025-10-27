"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { parseISO } from 'date-fns';

export function useQuoteExpiration(quote: any, paymentMethod?: string) {
  const [isExpired, setIsExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!quote || !quote.id || paymentMethod === 'bank_transfer') {
      return;
    }

    const quoteCreationTimestamp = localStorage.getItem('quoteCreationTimestamp');
    if (!quoteCreationTimestamp) {
      return; // No timestamp, so can't calculate expiration
    }

    let timeoutId: NodeJS.Timeout;

    try {
      const creationTime = parseInt(quoteCreationTimestamp, 10);
      const expirationTime = creationTime + 10 * 60 * 1000; // 10 minutes
      const now = new Date().getTime();

      const handleExpiration = () => {
        setIsExpired(true);
        if (quote && quote.id) {
          fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' });
        }
      };

      if (now >= expirationTime) {
        handleExpiration();
      } else {
        const remainingTime = expirationTime - now;
        timeoutId = setTimeout(handleExpiration, remainingTime);
      }
    } catch (error) {
      console.error("Error processing quote expiration timer:", error);
      return;
    }

    return () => clearTimeout(timeoutId);

  }, [quote, paymentMethod]);

  const ExpirationDialog = () => (
    <AlertDialog open={isExpired}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quote Expired</AlertDialogTitle>
          <AlertDialogDescription>
            Your quote has expired. Please run a new quote again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => {
            localStorage.removeItem("quoteData");
            localStorage.removeItem("quoteRestorationData");
            localStorage.removeItem("quoteCreationTimestamp");
            router.push('/');
          }}>
            Go to Homepage
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { ExpirationDialog };
}
