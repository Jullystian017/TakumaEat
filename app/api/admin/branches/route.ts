import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdminClient
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    return NextResponse.json({ branches: data });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, address, phone, operation_hours, map_url, is_active } = body;

    const { data, error } = await supabaseAdminClient
        .from('branches')
        .insert({ name, address, phone, operation_hours, map_url, is_active })
        .select()
        .single();

    if (error) {
        console.error('[branches-post] insert error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }

    console.info('[branches-post] success:', data?.id);
    return NextResponse.json({ branch: data });
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, ...updates } = body;

    const { data, error } = await supabaseAdminClient
        .from('branches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ branch: data });
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

    const { error } = await supabaseAdminClient.from('branches').delete().eq('id', id);

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    return NextResponse.json({ message: 'Deleted successfully' });
}
