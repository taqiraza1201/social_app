import { formatCoins } from '@/lib/utils';

interface CoinBalanceProps {
  coins: number;
  change?: number;
}

export function CoinBalance({ coins, change }: CoinBalanceProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
      <div className="text-3xl">🪙</div>
      <div>
        <div className="text-2xl font-bold text-white">{formatCoins(coins)}</div>
        <div className="text-xs text-gray-400">Coins Available</div>
      </div>
      {change !== undefined && change !== 0 && (
        <div className={`ml-auto text-sm font-medium ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? '+' : ''}{change}
        </div>
      )}
    </div>
  );
}
