"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Banknote, Copy, CheckCircle, ArrowLeft, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { useSettings } from '@/context/settings';

interface BankSettings {
  name: string;
  sortCode: string;
  accountNumber: string;
  reference: string;
  info: string;
  iban?: string;
  bic?: string;
}

function BankPaymentDetailsContent() {
  const searchParams = useSearchParams();
  const policyNumber = searchParams.get('policynumber');
  const { toast } = useToast();
  const settings = useSettings();
  const bankDetails = settings?.bank;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: `${fieldName} copied to clipboard.`,
      });
    });
  };

  const DetailRow = ({ label, value }: { label: string; value: string | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between items-center py-3 border-b">
        <span className="text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-gray-800">{value}</span>
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(value, label)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (!settings) { // Use settings to determine loading state
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-gray-600">Loading payment instructions...</p>
      </div>
    );
  }

  if (!bankDetails) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-bold text-red-600">Error Loading Details</h2>
        <p className="text-gray-600 mt-2">We couldn't load the bank payment instructions. Please contact support.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Banknote className="w-8 h-8 text-teal-600" />
          </div>
          <CardTitle className="text-2xl">Bank Payment Instructions</CardTitle>
          <CardDescription>Please use the details below to complete your payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  You must use your <strong>Policy Number</strong> as the payment reference to avoid delays.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <DetailRow label="Payment Reference" value={policyNumber || 'N/A'} />
            <DetailRow label="Account Name" value={bankDetails.name} />
            <DetailRow label="Sort Code" value={bankDetails.sortCode} />
            <DetailRow label="Account Number" value={bankDetails.accountNumber} />
            <DetailRow label="IBAN" value={bankDetails.iban} />
            <DetailRow label="BIC/SWIFT" value={bankDetails.bic} />
          </div>

          <div className="text-center bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">{bankDetails.info}</p>
          </div>

          <div className="text-center pt-4">
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <p className="font-semibold">Your quote is saved and awaiting payment.</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">We will notify you by email once your payment is confirmed.</p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BankPaymentDetailsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>}>
      <BankPaymentDetailsContent />
    </Suspense>
  );
}
