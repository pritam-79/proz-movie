import { NextRequest, NextResponse } from 'next/server';
import { PrivatePlaylist } from '@/types/library';

// In-memory playlists store with high-fidelity defaults
let PLAYLISTS: PrivatePlaylist[] = [
  {
    id: 'pl-001',
    userId: 'proz-usr-7749',
    name: 'Midnight Cinematic Favorites',
    description: 'Ultra HD sensual and atmospheric scenes from CyberVelvet and Noir Studios.',
    isPrivate: true,
    isSharedWithGroups: [],
    itemCount: 3,
    thumbnailUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400&auto=format&fit=crop',
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-11-20T18:00:00Z',
    items: [
      {
        id: 'pli-1',
        playlistId: 'pl-001',
        mediaId: 'stash-sc-001',
        title: 'Neon Nights & Cyber City Romance',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400&auto=format&fit=crop',
        durationSeconds: 1840,
        orderIndex: 0,
        addedAt: '2026-09-01T12:00:00Z',
        sourceType: 'stash'
      },
      {
        id: 'pli-2',
        playlistId: 'pl-001',
        mediaId: 'stash-sc-002',
        title: 'Midnight Velvet Noir Session',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=400&auto=format&fit=crop',
        durationSeconds: 2120,
        orderIndex: 1,
        addedAt: '2026-09-02T14:30:00Z',
        sourceType: 'stash'
      },
      {
        id: 'pli-3',
        playlistId: 'pl-001',
        mediaId: 'stash-sc-004',
        title: 'Crimson Velvet Studio Showcase',
        thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        durationSeconds: 2450,
        orderIndex: 2,
        addedAt: '2026-09-03T16:00:00Z',
        sourceType: 'stash'
      }
    ]
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    playlists: PLAYLISTS
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, isPrivate = true, initialItems = [] } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Playlist name is required' }, { status: 400 });
    }

    const newPlaylist: PrivatePlaylist = {
      id: `pl-${Date.now()}`,
      userId: 'proz-usr-7749',
      name,
      description: description || '',
      isPrivate,
      isSharedWithGroups: [],
      itemCount: initialItems.length,
      thumbnailUrl: initialItems[0]?.thumbnailUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400&auto=format&fit=crop',
      items: initialItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    PLAYLISTS.push(newPlaylist);

    return NextResponse.json({
      success: true,
      playlist: newPlaylist
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

  PLAYLISTS = PLAYLISTS.filter(p => p.id !== id);
  return NextResponse.json({ success: true, message: 'Playlist deleted' });
}
