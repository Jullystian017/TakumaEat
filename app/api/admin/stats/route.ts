import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'month'; // day, month, year

        const now = new Date();
        let startDate: Date;

        if (period === 'day') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'year') {
            startDate = new Date(now.getFullYear(), 0, 1);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // 1. Core Metrics (Orders & Revenue)
        const { data: allOrders, error: ordersError } = await supabaseAdminClient
            .from('orders')
            .select('id, total_amount, created_at, status, order_type')
            .neq('status', 'cancelled');

        if (ordersError) throw ordersError;

        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + order.total_amount, 0);

        // 2. Customer Count (Real)
        const { count: customerCount } = await supabaseAdminClient
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer');

        // 3. Chart Data Generation
        const dailyDataMap = new Map<string, number>();

        if (period === 'day') {
            for (let i = 0; i < 24; i++) {
                dailyDataMap.set(`${i}:00`, 0);
            }
            allOrders.forEach(order => {
                const date = new Date(order.created_at);
                if (date >= startDate) {
                    const hour = `${date.getHours()}:00`;
                    dailyDataMap.set(hour, (dailyDataMap.get(hour) || 0) + 1);
                }
            });
        } else if (period === 'year') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            months.forEach(m => dailyDataMap.set(m, 0));
            allOrders.forEach(order => {
                const date = new Date(order.created_at);
                if (date.getFullYear() === now.getFullYear()) {
                    const month = months[date.getMonth()];
                    dailyDataMap.set(month, (dailyDataMap.get(month) || 0) + 1);
                }
            });
        } else {
            // Month View (Last 7 days for detail)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 6);
            for (let i = 0; i < 7; i++) {
                const d = new Date(sevenDaysAgo);
                d.setDate(d.getDate() + i);
                dailyDataMap.set(d.toLocaleDateString('id-ID', { weekday: 'short' }), 0);
            }
            allOrders.forEach(order => {
                const date = new Date(order.created_at);
                if (date >= sevenDaysAgo) {
                    const day = date.toLocaleDateString('id-ID', { weekday: 'short' });
                    if (dailyDataMap.has(day)) {
                        dailyDataMap.set(day, (dailyDataMap.get(day) || 0) + 1);
                    }
                }
            });
        }

        const chartData = Array.from(dailyDataMap.entries()).map(([label, orders]) => ({ day: label, orders }));

        // 4. Order Type Distribution
        const orderTypeCount = { delivery: 0, takeaway: 0 };
        allOrders.forEach(o => {
            if (o.order_type === 'delivery') orderTypeCount.delivery++;
            else orderTypeCount.takeaway++;
        });

        // 5. Top Selling (With Images)
        const { data: recentItems } = await supabaseAdminClient
            .from('order_items')
            .select('name, quantity, price, image_url')
            .limit(500);

        const itemMap = new Map<string, { name: string, sold: number, revenue: number, image: string | null }>();
        recentItems?.forEach(item => {
            const current = itemMap.get(item.name) || { name: item.name, sold: 0, revenue: 0, image: item.image_url };
            current.sold += item.quantity;
            current.revenue += (item.price * item.quantity);
            itemMap.set(item.name, current);
        });

        const topSelling = Array.from(itemMap.values())
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

        // 6. Recent Orders
        const { data: recentOrdersData } = await supabaseAdminClient
            .from('orders')
            .select(`id, created_at, total_amount, status, order_type, users:profiles (name)`)
            .order('created_at', { ascending: false })
            .limit(5);

        const formattedRecentOrders = recentOrdersData?.map(o => ({
            id: `#${o.id.slice(0, 8).toUpperCase()}`,
            customer: (o as any).users?.name || 'Customer',
            total: o.total_amount,
            status: o.status,
            time: new Date(o.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            order_type: o.order_type
        })) || [];

        return NextResponse.json({
            stats: {
                totalOrders: { value: totalOrders, change: '+0%', isPositive: true },
                revenue: { value: totalRevenue, change: '+0%', isPositive: true },
                customers: { value: customerCount || 0, change: '+0%', isPositive: true },
                distribution: [
                    { name: 'Delivery', value: orderTypeCount.delivery, color: '#EFB036' },
                    { name: 'Takeaway', value: orderTypeCount.takeaway, color: '#1f1a11' }
                ]
            },
            orderData: chartData,
            topSelling,
            recentOrders: formattedRecentOrders
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
    }
}
