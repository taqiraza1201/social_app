'use client';

import { Suspense } from 'react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resend: true }),
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
        <p className="text-gray-400">
          We sent a 6-digit code to{' '}
          <span className="text-white font-medium">{email}</span>
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-tiktok-pink/50 focus:border-tiktok-pink transition-colors"
              />
            ))}
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Verify Account
          </Button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-gray-400 text-sm">
            Didn&apos;t receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-tiktok-pink hover:underline font-medium disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend'}
            </button>
          </p>
          <p className="text-gray-500 text-xs">
            <Link href="/auth/signup" className="hover:text-gray-300">
              ← Back to signup
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="text-gray-400 text-center">
          <div className="text-5xl mb-4 animate-pulse">📧</div>
          <p>Loading...</p>
        </div>
      }>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
