'use client';

import { useState, useEffect, useCallback } from 'react';
import { VerificationCard } from '@/components/admin/VerificationCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Follow {
  id: string;
  status: string;
  screenshot_url: string | null;
  created_at: string;
  rejection_reason?: string | null;
  ad?: { name: string; tiktok_url: string } | null;
  user?: { email: string } | null;
}

export default function VerificationsPage() {
  const [follows, setFollows] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchFollows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/verifications?status=${filter}`);
      const data = await res.json();
      setFollows(data.follows || []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchFollows();
  }, [fetchFollows]);

  async function handleApprove(followId: string) {
    setProcessing(followId);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ follow_id: followId, action: 'approved' }),
      });
      if (res.ok) {
        setFollows((prev) => prev.filter((f) => f.id !== followId));
      }
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject() {
    if (!rejectModal) return;
    setProcessing(rejectModal);
    try {
      const res = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          follow_id: rejectModal,
          action: 'rejected',
          rejection_reason: rejectionReason,
        }),
      });
      if (res.ok) {
        setFollows((prev) => prev.filter((f) => f.id !== rejectModal));
        setRejectModal(null);
        setRejectionReason('');
      }
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Verifications</h1>
        <p className="text-gray-400 mt-1">Review follow proof submissions</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-tiktok-pink text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-900 animate-pulse" />
          ))}
        </div>
      ) : follows.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {follows.map((follow) => (
            <VerificationCard
              key={follow.id}
              follow={follow}
              onApprove={handleApprove}
              onReject={(id) => { setRejectModal(id); setRejectionReason(''); }}
              isProcessing={processing === follow.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">
            {filter === 'pending' ? '🎉' : '📭'}
          </div>
          <p className="text-gray-400">No {filter} verifications</p>
        </div>
      )}

      {/* Reject modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectionReason(''); }}
        title="Reject Follow Proof"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Provide a reason for rejection (optional)</p>
          <Input
            placeholder="e.g. Screenshot is unclear, not a real follow..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => { setRejectModal(null); setRejectionReason(''); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={!!processing}
              className="flex-1"
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
