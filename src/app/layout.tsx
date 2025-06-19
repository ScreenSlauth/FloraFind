import { Metadata } from 'next';
import { Alegreya } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { SupabaseProvider } from '@/components/supabase-provider';
import { Navbar } from '@/components/navbar';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import './globals.css';

const fontAlegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
  weight: ['400', '500', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'FloraFind',
  description: 'Identify plants and discover their secrets with FloraFind',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          "font-body antialiased min-h-screen flex flex-col bg-transparent gradient-background",
          fontAlegreya.variable
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="florafind-theme"
        >
          <SupabaseProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <div className="fixed bottom-4 right-4 md:hidden z-50">
              <ThemeToggle />
            </div>
            <Toaster />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
