import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/types/database';

export const createMiddlewareSupabaseClient = (req: NextRequest, res: NextResponse) =>
  createMiddlewareClient<Database>({ req, res });
