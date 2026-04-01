import { formatDate, formatCoins } from '@/lib/utils';
import type { Transaction } from '@/lib/types/database';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isCredit = transaction.type === 'credit';

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
            isCredit ? 'bg-green-400/10' : 'bg-red-400/10'
          }`}
        >
          {isCredit ? '⬆️' : '⬇️'}
        </div>
        <div>
          <div className="text-sm font-medium text-white">{transaction.reason}</div>
          <div className="text-xs text-gray-500">{formatDate(transaction.created_at)}</div>
        </div>
      </div>
      <div
        className={`font-semibold text-sm ${
          isCredit ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {isCredit ? '+' : '-'}{formatCoins(transaction.amount)} 🪙
      </div>
    </div>
  );
}
