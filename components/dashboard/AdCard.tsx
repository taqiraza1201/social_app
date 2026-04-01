import Link from 'next/link';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Ad } from '@/lib/types/database';

interface AdCardProps {
  ad: Ad;
  showOwnerActions?: boolean;
  showFollowAction?: boolean;
  onFollow?: (adId: string) => void;
  isFollowing?: boolean;
  alreadyFollowed?: boolean;
}

export function AdCard({
  ad,
  showOwnerActions = false,
  showFollowAction = false,
  onFollow,
  isFollowing = false,
  alreadyFollowed = false,
}: AdCardProps) {
  const progress = Math.min((ad.current_followers / ad.target_followers) * 100, 100);
  const coinsReward = 50;

  return (
    <Card hover>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white text-lg">{ad.name}</h3>
          <a
            href={ad.tiktok_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tiktok-cyan text-sm hover:underline truncate block max-w-xs"
          >
            {ad.tiktok_url}
          </a>
        </div>
        <StatusBadge status={ad.status} />
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>{ad.current_followers} / {ad.target_followers} followers</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-tiktok-pink to-brand-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Cost: {ad.cost} coins total
        </div>

        {showFollowAction && ad.status === 'active' && (
          <Button
            size="sm"
            onClick={() => onFollow?.(ad.id)}
            disabled={isFollowing || alreadyFollowed}
            loading={isFollowing}
            variant={alreadyFollowed ? 'ghost' : 'primary'}
          >
            {alreadyFollowed ? '✓ Submitted' : `Follow (+${coinsReward} coins)`}
          </Button>
        )}

        {showOwnerActions && (
          <div className="text-xs text-gray-400">
            Created by you
          </div>
        )}
      </div>
    </Card>
  );
}
