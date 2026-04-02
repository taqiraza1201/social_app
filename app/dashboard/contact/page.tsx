'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function ContactPage() {
  const [form, setForm] = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setSuccess(true);
      setForm({ subject: '', message: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Contact Support</h1>
        <p className="text-gray-400 mt-1">Have a question or issue? We&apos;ll get back to you shortly.</p>
      </div>

      {success ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-white mb-2">Message Sent!</h2>
          <p className="text-gray-400 mb-6">
            Thank you for reaching out. Our team will review your message and respond soon.
          </p>
          <Button onClick={() => setSuccess(false)} variant="outline">
            Send Another Message
          </Button>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Subject"
              placeholder="e.g. Issue with coin balance, screenshot not accepted..."
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Message
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your issue or question in detail..."
                rows={6}
                required
                className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tiktok-pink/50 focus:border-tiktok-pink transition-colors resize-none"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Send Message
            </Button>
          </form>
        </Card>
      )}

      <Card className="bg-gray-900/50">
        <h3 className="font-semibold text-white mb-3">Common Issues</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-tiktok-pink mt-0.5">•</span>
            <span><strong className="text-gray-300">Coins not credited?</strong> Admin approval can take up to 24 hours.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tiktok-pink mt-0.5">•</span>
            <span><strong className="text-gray-300">Screenshot rejected?</strong> Ensure the screenshot clearly shows the follow button and the profile name.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-tiktok-pink mt-0.5">•</span>
            <span><strong className="text-gray-300">OTP not received?</strong> Check your spam folder, or use the resend option on the verification page.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
