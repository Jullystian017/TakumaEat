import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

        // 1. Fetch this month's orders
        const { data: thisMonthOrders, error: orderError } = await supabaseAdminClient
            .from('orders')
            .select('total_amount, status, created_at')
            .gte('created_at', firstDayThisMonth);

        if (orderError) throw orderError;

        // 2. Fetch last month's orders for comparison
        const { data: lastMonthOrders, error: lastMonthError } = await supabaseAdminClient
            .from('orders')
            .select('total_amount')
            .gte('created_at', firstDayLastMonth)
            .lt('created_at', firstDayThisMonth);

        if (lastMonthError) throw lastMonthError;

        // 3. Simple analytics
        const totalOrders = thisMonthOrders.length;
        const revenue = thisMonthOrders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + (o.total_amount || 0), 0);

        const prevTotalOrders = lastMonthOrders.length;
        const prevRevenue = lastMonthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

        const orderChange = prevTotalOrders === 0 ? 100 : ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100;
        const revenueChange = prevRevenue === 0 ? 100 : ((revenue - prevRevenue) / prevRevenue) * 100;

        return NextResponse.json({
            stats: {
                totalOrders: {
                    value: totalOrders,
                    change: `${orderChange >= 0 ? '+' : ''}${orderChange.toFixed(1)}%`,
                    isPositive: orderChange >= 0
                },
                revenue: {
                    value: revenue,
                    change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
                    isPositive: revenueChange >= 0
                },
                newCustomers: {
                    value: 0, // Placeholder for now
                    change: '+0%',
                    isPositive: true
                }
            }
        });
    } catch (error) {
        console.error('[AdminStats] Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
