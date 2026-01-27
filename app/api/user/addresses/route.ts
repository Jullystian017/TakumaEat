import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdminClient
            .from('user_addresses')
            .select('*')
            .eq('user_id', session.user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ addresses: data || [] });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { recipient_name, phone_number, address_line, detail, latitude, longitude, is_default } = body;

        if (!recipient_name || !phone_number || !address_line) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // If this is the first address or set to default, unset other defaults
        if (is_default) {
            await supabaseAdminClient
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', session.user.id);
        }

        const { data, error } = await supabaseAdminClient
            .from('user_addresses')
            .insert([{
                user_id: session.user.id,
                recipient_name,
                phone_number,
                address_line,
                detail,
                latitude,
                longitude,
                is_default: !!is_default
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ address: data }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
