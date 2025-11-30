import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Gulnara | The Interpreter of Stars',
  description:
    'Meet Gulnara Ilyasova, evolutionary astrologer helping you understand your relationship dynamics and claim your power back.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
