import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface VerificationCardProps {
  follow: {
    id: string;
    status: string;
    screenshot_url: string | null;
    created_at: string;
    rejection_reason?: string | null;
    ad?: {
      name: string;
      tiktok_url: string;
    } | null;
    user?: {
      email: string;
    } | null;
  };
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isProcessing?: boolean;
}

export function VerificationCard({ follow, onApprove, onReject, isProcessing }: VerificationCardProps) {
  return (
    <Card hover>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-semibold text-white">{follow.user?.email || 'Unknown User'}</div>
          <div className="text-sm text-gray-400 mt-0.5">
            Ad: {follow.ad?.name || 'Unknown Ad'}
          </div>
          {follow.ad?.tiktok_url && (
            <a
              href={follow.ad.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tiktok-cyan text-xs hover:underline"
            >
              {follow.ad.tiktok_url}
            </a>
          )}
        </div>
        <StatusBadge status={follow.status} />
      </div>

      {/* Screenshot */}
      {follow.screenshot_url && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Screenshot Proof</div>
          <a href={follow.screenshot_url} target="_blank" rel="noopener noreferrer">
            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 hover:border-tiktok-pink transition-colors">
              <img
                src={follow.screenshot_url}
                alt="Follow proof screenshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                <span className="text-white text-sm font-medium">View Full Size ↗</span>
              </div>
            </div>
          </a>
        </div>
      )}

      {follow.rejection_reason && (
        <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">
          <div className="text-xs text-red-400 font-medium">Rejection Reason:</div>
          <div className="text-sm text-gray-300 mt-1">{follow.rejection_reason}</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">{formatDate(follow.created_at)}</div>
        {follow.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              onClick={() => onReject?.(follow.id)}
              disabled={isProcessing}
            >
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => onApprove?.(follow.id)}
              disabled={isProcessing}
              loading={isProcessing}
            >
              Approve
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
