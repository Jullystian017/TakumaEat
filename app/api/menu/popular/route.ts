import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        // 1. Try to get popular items via RPC if it exists
        const { data: popularData, error: aggregateError } = await supabaseAdminClient
            .rpc('get_popular_items');

        if (!aggregateError && popularData) {
            return NextResponse.json({ items: popularData });
        }

        // 2. Fallback: If RPC doesn't exist or fails, return 8 available menu items
        // This prevents the "aggregate function" error from clogging the logs
        const { data: fallbackItems, error: fallbackError } = await supabaseAdminClient
            .from('menu_items')
            .select('*, categories(name)')
            .eq('status', 'available')
            .limit(8);

        if (fallbackError) throw fallbackError;

        return NextResponse.json({ items: fallbackItems || [] });
    } catch (error: any) {
        console.error('[PopularItems] API Error:', error.message);
        return NextResponse.json({ items: [] }, { status: 500 });
    }
}
