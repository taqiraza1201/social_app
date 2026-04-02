import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface ContactMessage {
  id: string;
  user_id: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default async function AdminContactPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  const messages = (data ?? []) as ContactMessage[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Contact Messages</h1>
        <p className="text-gray-400 mt-1">{messages.length} total message{messages.length !== 1 ? 's' : ''}</p>
      </div>

      {messages.length === 0 ? (
        <Card className="text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-400">No contact messages yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card key={msg.id} hover>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-white">{msg.subject}</div>
                  <div className="text-sm text-gray-400">{msg.email}</div>
                </div>
                <div className="text-xs text-gray-500 shrink-0 ml-4">{formatDate(msg.created_at)}</div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
