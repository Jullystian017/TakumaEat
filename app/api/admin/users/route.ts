import { NextResponse } from 'next/server';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        // Fetch all users and their order stats in one go or separate queries
        // Simplified: Fetch profiles and then aggregate orders
        const { data: users, error: usersError } = await supabaseAdminClient
            .from('profiles')
            .select('id, name, email, role, created_at, is_active')
            .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        // Fetch all non-cancelled orders to aggregate
        const { data: orders, error: ordersError } = await supabaseAdminClient
            .from('orders')
            .select('user_id, total_amount')
            .neq('status', 'cancelled');

        if (ordersError) throw ordersError;

        // Aggregate stats
        const statsMap = new Map<string, { totalOrders: number, totalSpent: number }>();
        orders?.forEach(order => {
            const current = statsMap.get(order.user_id) || { totalOrders: 0, totalSpent: 0 };
            current.totalOrders += 1;
            current.totalSpent += order.total_amount;
            statsMap.set(order.user_id, current);
        });

        const usersWithStats = users.map(user => ({
            ...user,
            totalOrders: statsMap.get(user.id)?.totalOrders || 0,
            totalSpent: statsMap.get(user.id)?.totalSpent || 0,
            isActive: user.is_active ?? true // Fallback to true if column missing or null
        }));

        return NextResponse.json({ users: usersWithStats });
    } catch (error: any) {
        console.error('Admin Users API Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
