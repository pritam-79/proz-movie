import { NextRequest, NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers/registry';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const registryConfigs = providerRegistry.getAllConfigs();
    let dbProviders: any[] = [];
    try {
      const supabase = createSupabaseAdminClient();
      const { data } = await supabase.from('metadata_providers').select('*');
      if (data) dbProviders = data;
    } catch {
      // Ignore database fallback
    }

    return NextResponse.json({
      success: true,
      providers: registryConfigs,
      customProviders: dbProviders,
      total: registryConfigs.length
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, providerId } = body;

    // Test API connection
    if (action === 'test' || !action) {
      if (!providerId || providerId === 'all') {
        const results = await providerRegistry.testAllConnections();
        return NextResponse.json({
          success: true,
          results
        });
      }

      const adapter = providerRegistry.get(providerId);
      if (!adapter) {
        return NextResponse.json(
          { success: false, message: `Provider ${providerId} not found in registry` },
          { status: 404 }
        );
      }

      const result = await adapter.testConnection();
      return NextResponse.json({
        success: result.success,
        providerId,
        result
      });
    }

    // Custom provider creation
    const supabase = createSupabaseAdminClient();
    const { name, type, base_url, is_active, supported_types } = body;
    if (!name || !type) return NextResponse.json({ error: 'name and type required' }, { status: 400 });
    const { data, error } = await supabase.from('metadata_providers').insert({ 
      name, 
      type, 
      base_url, 
      is_active: is_active !== false, 
      supported_types: supported_types || [] 
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
