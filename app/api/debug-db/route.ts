import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/debug-db
 *
 * Safe production-diagnosis endpoint.  Returns a JSON report with
 * pass/fail for each check.  No secrets are ever included in the
 * response.
 *
 * Protection: The request must carry the header
 *   x-debug-key: <value of DEBUG_API_KEY env var>
 * If DEBUG_API_KEY is not set the endpoint returns 404 so it is
 * invisible in production deployments that have not opted in.
 */
export async function GET(request: Request) {
  const debugKey = process.env.DEBUG_API_KEY;

  // Disable endpoint when no key is configured
  if (!debugKey) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Authenticate the caller — constant-time comparison prevents timing attacks
  const providedKey = request.headers.get('x-debug-key') ?? '';
  const keysMatch = (() => {
    try {
      const a = Buffer.from(providedKey);
      const b = Buffer.from(debugKey);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  })();

  if (!keysMatch) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const report: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, unknown>,
  };

  const checks = report.checks as Record<string, unknown>;

  // ── 1. Environment variables present (values never logged) ───────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  checks.env_supabase_url = {
    pass: Boolean(supabaseUrl),
    value_present: Boolean(supabaseUrl),
  };

  checks.env_service_role_key = {
    pass: Boolean(serviceKey),
    value_present: Boolean(serviceKey),
  };

  if (!supabaseUrl || !serviceKey) {
    checks.db_query = {
      pass: false,
      skipped: true,
      reason: 'Missing required environment variables',
    };
    return NextResponse.json({ ...report, overall: 'fail' });
  }

  // ── 2. Connectivity + minimal query ──────────────────────────────────────
  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase
      .schema('public')
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      checks.db_query = {
        pass: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        },
      };
      return NextResponse.json({ ...report, overall: 'fail' });
    }

    checks.db_query = {
      pass: true,
      rows_returned: Array.isArray(data) ? data.length : null,
    };
  } catch (err) {
    checks.db_query = {
      pass: false,
      error: {
        message: err instanceof Error ? err.message : String(err),
      },
    };
    return NextResponse.json({ ...report, overall: 'fail' });
  }

  return NextResponse.json({ ...report, overall: 'pass' });
}
