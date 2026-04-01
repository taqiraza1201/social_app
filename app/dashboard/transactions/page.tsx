import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyUserToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { TransactionItem } from '@/components/dashboard/TransactionItem';

export default async function TransactionsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('user_token')?.value;
  if (!token) redirect('/auth/login');
  const payload = verifyUserToken(token);
  if (!payload) redirect('/auth/login');

  const supabase = createServerClient();
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', payload.userId)
    .order('created_at', { ascending: false });

  const totalCredits = transactions?.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0) ?? 0;
  const totalDebits = transactions?.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Transaction History</h1>
        <p className="text-gray-400 mt-1">All your coin earnings and spendings</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <Card className="bg-green-500/10 border-green-500/20">
          <div className="text-green-400 text-sm mb-1">Total Earned</div>
          <div className="text-2xl font-bold text-white">+{totalCredits} 🪙</div>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <div className="text-red-400 text-sm mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-white">-{totalDebits} 🪙</div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">All Transactions</h2>
        {transactions && transactions.length > 0 ? (
          transactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💸</div>
            <p className="text-gray-400">No transactions yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}
