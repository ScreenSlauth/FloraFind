"use client"

import { useState } from "react";
import { resetPassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    
    const { error } = await resetPassword(email);
    
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-script mb-6">FloraFind</h1>
          <h2 className="text-xl text-gray-600">Reset your password</h2>
        </div>

        {success ? (
          <div className="p-6 bg-green-50 border border-green-100 rounded-lg text-center">
            <h3 className="text-lg font-medium text-green-800">Check your email</h3>
            <p className="mt-2 text-green-600">
              We've sent a password reset link to {email}. Please check your inbox.
            </p>
            <Link href="/login">
              <Button className="mt-4" variant="outline">
                Return to login
              </Button>
            </Link>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-2">
              <label className="text-sm text-gray-500" htmlFor="email">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <p className="text-xs text-gray-500">
                Enter the email address you used to register. We'll send you a link to reset your password.
              </p>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button type="submit" className="w-full bg-gray-600 hover:bg-gray-700 text-white" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
            
            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 