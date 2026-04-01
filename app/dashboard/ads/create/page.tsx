'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function CreateAdPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    tiktok_url: '',
    target_followers: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const targetFollowers = parseInt(form.target_followers) || 0;
  const cost = targetFollowers * 2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          tiktok_url: form.tiktok_url,
          target_followers: parseInt(form.target_followers),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create ad');
      router.push('/dashboard/ads');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create ad');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create Ad Campaign</h1>
        <p className="text-gray-400 mt-1">Set up a campaign to get followers on your TikTok</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Campaign Name"
            placeholder="My TikTok Growth Campaign"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <Input
            label="TikTok Profile URL"
            type="url"
            placeholder="https://www.tiktok.com/@username"
            value={form.tiktok_url}
            onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })}
            required
          />

          <div>
            <Input
              label="Target Followers"
              type="number"
              placeholder="100"
              min="10"
              max="10000"
              value={form.target_followers}
              onChange={(e) => setForm({ ...form, target_followers: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500 mt-1.5">Min: 10 followers, Max: 10,000 followers</p>
          </div>

          {/* Cost preview */}
          {targetFollowers >= 10 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="text-sm font-medium text-yellow-400 mb-1">Campaign Cost</div>
              <div className="text-2xl font-bold text-white">
                🪙 {cost} coins
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {targetFollowers} followers × 2 coins = {cost} coins
              </div>
            </div>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Create Campaign — Spend {cost} Coins
          </Button>
        </form>
      </Card>
    </div>
  );
}
