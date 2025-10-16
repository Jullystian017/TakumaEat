import { NextResponse } from 'next/server';

import { supabaseAdminClient } from '@/lib/supabase/admin';

const DEFAULT_BRANCHES = [
  {
    id: 'jakarta',
    name: 'TakumaEat Jakarta',
    address: 'Jl. Sudirman No. 21, Jakarta',
    operation_hours: '10.00 - 22.00 WIB'
  },
  {
    id: 'surabaya',
    name: 'TakumaEat Surabaya',
    address: 'Jl. Darmo No. 12, Surabaya',
    operation_hours: '11.00 - 23.00 WIB'
  }
];

export async function GET() {
  try {
    const { data, error } = await supabaseAdminClient
      .from('branches')
      .select('id, name, address, operation_hours')
      .order('name', { ascending: true });

    if (error) {
      console.warn('[branches] Falling back to defaults:', error.message);
      return NextResponse.json({ branches: DEFAULT_BRANCHES, fallback: true }, { status: 200 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ branches: DEFAULT_BRANCHES, fallback: true }, { status: 200 });
    }

    return NextResponse.json({ branches: data, fallback: false }, { status: 200 });
  } catch (error) {
    console.error('[branches] Unexpected error', error);
    return NextResponse.json({ branches: DEFAULT_BRANCHES, fallback: true }, { status: 200 });
  }
}
