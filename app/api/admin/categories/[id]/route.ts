import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id } = params;

        const { data, error } = await supabaseAdminClient
            .from('categories')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ category: data });
    } catch (error) {
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        const { error } = await supabaseAdminClient
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Category deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}
