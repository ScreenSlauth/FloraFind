"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export default function SignupConfirmPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F5F5DC] bg-[radial-gradient(circle_at_50%_50%,rgba(56,142,60,0.1),transparent_70%)]">
      <div className="max-w-[450px] w-full bg-white rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Banner Header */}
        <div className="relative bg-primary p-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-script text-white tracking-wide transform -rotate-2 text-shadow">
              FloraFind
            </h1>
          </div>
          <div className="absolute top-3 right-4 text-3xl animate-bounce">🌿</div>
        </div>

        {/* Main Content */}
        <div className="p-8 text-center space-y-6">
          <div className="space-y-3">
            <p className="text-lg italic text-gray-600">Your green journey starts here!</p>
            <h2 className="text-2xl font-semibold text-gray-800">Check your email</h2>
            <p className="text-gray-600 leading-relaxed">
              We've sent a confirmation link to your email address. Please check your inbox and click the link to activate your account.
            </p>
          </div>

          {/* Help Box */}
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="font-medium text-gray-800">Didn't receive the email?</h3>
            <p className="text-sm mt-2 text-gray-600">
              Check your spam folder or click below to resend the confirmation email.
            </p>
            <Button 
              className="mt-4 group relative overflow-hidden"
              variant="outline"
            >
              <span className="relative z-10">Resend confirmation email</span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg group-hover:animate-sway">
                🪴
              </span>
            </Button>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Already confirmed?{" "}
              <Link 
                href="/login" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}