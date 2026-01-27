import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        // 1. Get most frequent items from order_items
        // We group by menu_item_id or name. Since menu_item_id is more reliable, let's try that.
        // However, if some orders are legacy without IDs, we fallback or use names.
        const { data: popularData, error: aggregateError } = await supabaseAdminClient
            .rpc('get_popular_items'); // We'll create a simple RPC for aggregation or use a manual query

        if (aggregateError) {
            // Fallback: Manual aggregation if RPC isn't set up yet
            const { data: items, error: manualError } = await supabaseAdminClient
                .from('order_items')
                .select('name, count:id.count()')
                .order('count', { ascending: false })
                .limit(8);

            if (manualError) throw manualError;

            // Map names to actual menu items to get images/stock
            const itemNames = items.map(i => i.name);
            const { data: menuDetailed, error: menuError } = await supabaseAdminClient
                .from('menu_items')
                .select('*, categories(name)')
                .in('name', itemNames);

            if (menuError) throw menuError;

            return NextResponse.json({ items: menuDetailed });
        }

        return NextResponse.json({ items: popularData });
    } catch (error: any) {
        console.error('[PopularItems] Error:', error);
        // If aggregation fails (empty DB), return a random sample of available items
        const { data: randomItems } = await supabaseAdminClient
            .from('menu_items')
            .select('*, categories(name)')
            .eq('status', 'available')
            .limit(8);

        return NextResponse.json({ items: randomItems || [] });
    }
}
