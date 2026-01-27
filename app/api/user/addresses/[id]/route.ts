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
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();

        if (body.is_default) {
            await supabaseAdminClient
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', session.user.id);
        }

        const { data, error } = await supabaseAdminClient
            .from('user_addresses')
            .update(body)
            .eq('id', id)
            .eq('user_id', session.user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ address: data });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { error } = await supabaseAdminClient
            .from('user_addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) throw error;

        return NextResponse.json({ message: 'Address deleted' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
