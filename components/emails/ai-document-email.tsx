
import * as React from 'react';

interface AIDocumentEmailProps {
  userName: string;
  downloadLink: string;
}

export const AIDocumentEmail: React.FC<Readonly<AIDocumentEmailProps>> = ({ userName, downloadLink }) => (
  <div>
    <h1>Hello {userName},</h1>
    <p>Your AI-generated document is ready for download.</p>
    <a href={downloadLink}>Download PDF</a>
  </div>
);

export default AIDocumentEmail;
