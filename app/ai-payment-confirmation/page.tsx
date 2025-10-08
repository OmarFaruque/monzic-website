"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Download } from 'lucide-react';

export default function AIPaymentConfirmationPage() {
  const [documentContent, setDocumentContent] = useState('');
  const [documentType, setDocumentType] = useState('');

  useEffect(() => {
    const content = localStorage.getItem("aiDocumentContent");
    const type = localStorage.getItem("aiDocumentType");
    if (content) {
      setDocumentContent(content);
    }
    if (type) {
      setDocumentType(type);
    }
  }, []);

  const handleDownload = () => {
    // This is a placeholder for the PDF generation and download logic.
    // For now, we can download as a text file.
    const blob = new Blob([documentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-document.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your AI-generated document is ready to be downloaded.</p>
        
        <div className="bg-gray-100 p-4 rounded-lg text-left mb-6">
          <p className="text-sm text-gray-500">Document Type:</p>
          <p className="font-semibold">{documentType}</p>
        </div>

        <Button onClick={handleDownload} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-semibold h-14 mb-4">
          <Download className="w-5 h-5 mr-2" />
          Download Document
        </Button>

        <Link href="/dashboard">
          <Button variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}