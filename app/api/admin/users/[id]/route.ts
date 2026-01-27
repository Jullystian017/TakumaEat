import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        console.log('[API-USER-GET] Request received for ID:', params?.id);
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            console.warn('[API-USER-GET] No session found');
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        if (session.user.role !== 'admin') {
            console.warn('[API-USER-GET] Unauthorized role:', session.user.role);
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        if (!id) {
            console.error('[API-USER-GET] Missing ID parameter');
            return NextResponse.json({ message: 'ID is required' }, { status: 400 });
        }

        // Fetch basic profile info
        console.log('[API-USER-GET] Fetching profile...');
        const { data: profile, error: profileError } = await supabaseAdminClient
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (profileError) {
            console.error('[API-USER-GET] Profile DB Error:', profileError);
            return NextResponse.json({ message: profileError.message }, { status: 500 });
        }

        if (!profile) {
            console.warn('[API-USER-GET] Profile not found for ID:', id);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Fetch stats and order history
        console.log('[API-USER-GET] Fetching orders for user:', id);
        const { data: orders, error: ordersError } = await supabaseAdminClient
            .from('orders')
            .select('id, created_at, total_amount, status, payment_method, order_type')
            .eq('user_id', id)
            .order('created_at', { ascending: false });

        if (ordersError) {
            console.error('[API-USER-GET] Orders DB Error:', ordersError);
            return NextResponse.json({ message: ordersError.message }, { status: 500 });
        }

        // Calculate stats
        const relevantOrders = orders?.filter(o => o.status !== 'cancelled') || [];
        const totalSpent = relevantOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const orderCount = orders?.length || 0;
        const successCount = relevantOrders.length;
        const lastOrderDate = orders?.[0]?.created_at || null;

        console.log('[API-USER-GET] Success. Orders count:', orderCount);

        return NextResponse.json({
            profile,
            stats: {
                totalSpent,
                orderCount,
                successCount,
                lastOrderDate,
                avgOrderValue: successCount > 0 ? totalSpent / successCount : 0
            },
            orders: orders?.slice(0, 10) || []
        });
    } catch (error: any) {
        console.error('Admin Fetch User Critical Error:', error);
        return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { role, isActive } = body;

        const updates: any = {};
        if (role) updates.role = role.toLowerCase();
        if (typeof isActive === 'boolean') updates.is_active = isActive;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: 'No updates provided' }, { status: 400 });
        }

        const { error } = await supabaseAdminClient
            .from('profiles')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error: any) {
        console.error('Admin User Update Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Prevent deleting self
        if (id === session.user.id) {
            return NextResponse.json({ message: 'Cannot delete your own account' }, { status: 400 });
        }

        const { error } = await supabaseAdminClient
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Admin User Delete Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
