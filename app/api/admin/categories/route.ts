import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { supabaseAdminClient } from '@/lib/supabase/admin';

// GET all categories
export async function GET() {
    try {
        const { data, error } = await supabaseAdminClient
            .from('categories')
            .select('*')
            .order('name');

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ categories: data });
    } catch (error) {
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}

// POST new category (Admin only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, description, color, icon } = await request.json();

        if (!name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdminClient
            .from('categories')
            .insert([{ name, description, color, icon }])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        return NextResponse.json({ category: data }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}
