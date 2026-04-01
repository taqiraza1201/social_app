'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { AdCard } from '@/components/dashboard/AdCard';
import type { Ad } from '@/lib/types/database';

interface AdWithFollowStatus extends Ad {
  alreadyFollowed?: boolean;
}

export default function FollowPage() {
  const [ads, setAds] = useState<AdWithFollowStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAds = useCallback(async () => {
    try {
      const res = await fetch('/api/ads');
      const data = await res.json();
      setAds(data.ads || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  async function handleUploadScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setScreenshotUrl(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmitFollow() {
    if (!selectedAd || !screenshotUrl) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_id: selectedAd.id,
          screenshot_url: screenshotUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSuccess('Follow submitted! Pending admin verification. You\'ll earn 50 coins once approved.');
      setSelectedAd(null);
      setScreenshotUrl('');
      setAds((prev) =>
        prev.map((a) => (a.id === selectedAd.id ? { ...a, alreadyFollowed: true } : a))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Browse & Follow</h1>
        <p className="text-gray-400 mt-1">Follow TikTok creators and earn 50 coins per approved follow</p>
      </div>

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          ✅ {success}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-900 animate-pulse" />
          ))}
        </div>
      ) : ads.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ads.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              showFollowAction
              onFollow={() => setSelectedAd(ad)}
              alreadyFollowed={ad.alreadyFollowed}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-white mb-2">No ads available</h2>
          <p className="text-gray-400">Check back later for new TikTok accounts to follow</p>
        </Card>
      )}

      {/* Follow submission modal */}
      <Modal
        isOpen={!!selectedAd}
        onClose={() => { setSelectedAd(null); setScreenshotUrl(''); setError(''); }}
        title="Submit Follow Proof"
      >
        {selectedAd && (
          <div className="space-y-5">
            <div className="p-3 bg-gray-800 rounded-xl">
              <div className="text-sm text-gray-400">Following:</div>
              <div className="font-medium text-white">{selectedAd.name}</div>
              <a
                href={selectedAd.tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-tiktok-cyan text-sm hover:underline"
              >
                {selectedAd.tiktok_url} ↗
              </a>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Screenshot Proof
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-tiktok-pink/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadScreenshot}
                  className="hidden"
                  id="screenshot-upload"
                />
                <label htmlFor="screenshot-upload" className="cursor-pointer">
                  {screenshotUrl ? (
                    <div>
                      <div className="relative max-h-40 mx-auto rounded-lg mb-2 overflow-hidden h-40 w-full">
                        <Image src={screenshotUrl} alt="Screenshot" fill className="object-contain" unoptimized />
                      </div>
                      <span className="text-green-400 text-sm">✓ Screenshot uploaded</span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">{uploading ? '⏳' : '📸'}</div>
                      <div className="text-gray-400 text-sm">
                        {uploading ? 'Uploading...' : 'Click to upload screenshot'}
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="text-xs text-yellow-400">💡 You&apos;ll earn 50 coins after admin approval</div>
            </div>

            <Button
              onClick={handleSubmitFollow}
              loading={submitting}
              disabled={!screenshotUrl || uploading}
              className="w-full"
              size="lg"
            >
              Submit Follow Proof
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
