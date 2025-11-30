import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Dashboard',
  robots: { index: false, follow: false }, // Tells Google to go away
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
