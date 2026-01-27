import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdminClient
        .from('promos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ promos: data });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { code, name, description, discount_type, discount_value, min_purchase, max_discount, start_date, end_date, usage_limit, is_active } = body;

    const { data, error } = await supabaseAdminClient
        .from('promos')
        .insert({
            code: code.toUpperCase(),
            name,
            description,
            discount_type,
            discount_value,
            min_purchase,
            max_discount,
            start_date,
            end_date,
            usage_limit,
            is_active
        })
        .select()
        .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ promo: data });
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;

    if (updates.code) updates.code = updates.code.toUpperCase();

    const { data, error } = await supabaseAdminClient
        .from('promos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ promo: data });
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

    const { error } = await supabaseAdminClient.from('promos').delete().eq('id', id);

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Deleted successfully' });
}
