import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Discount Management System (DMS)',
  description: 'Enterprise discount creation, coupon lifecycle management, 7-guard calculation engine, role-based access control, and usage analytics.',
  openGraph: {
    title: 'Discount Management System (DMS)',
    description: 'Centralized platform to automate discount creation, approval, application, tracking, and reporting.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discount Management System (DMS)',
    description: 'Centralized platform to automate discount creation, approval, application, tracking, and reporting.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
