'use client';
import { Logo } from "@/components/logo";
import { FirebaseClientProvider } from "@/firebase";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
      <main className="flex flex-col items-center justify-center min-h-screen bg-muted/50 p-4">
          <div className="mb-8">
              <Logo />
          </div>
          {children}
      </main>
    </FirebaseClientProvider>
  );
}
