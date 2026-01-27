import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdminClient
      .from('branches')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching branches:', error);
      return NextResponse.json({ branches: [], fallback: true });
    }

    return NextResponse.json({ branches: data || [] });
  } catch (error) {
    console.error('Error in branches route:', error);
    return NextResponse.json({ branches: [], fallback: true });
  }
}
