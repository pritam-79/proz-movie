import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { MOCK_CONTENT } from '@/lib/data/mockContent';

const JWT_SECRET = process.env.JWT_PLAYBACK_SECRET || 'proz-movie-playback-session-signature-secret-key-32chars';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contentId, episodeId, userRole = 'user', is18PlusVerified = false, planId = 'plan_premium' } = body;

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // 1. Locate Content
    const content = MOCK_CONTENT.find(c => c.id === contentId);
    if (!content) {
      return NextResponse.json({ error: 'Content not found in catalog' }, { status: 404 });
    }

    // 2. Check Age Restriction (18+)
    if (content.isRestricted18Plus && !is18PlusVerified) {
      return NextResponse.json({ 
        error: 'Age Verification Required', 
        code: 'AGE_VERIFICATION_REQUIRED',
        message: 'This content is restricted to verified users 18 years of age or older.'
      }, { status: 403 });
    }

    // 3. Verify Content License Validity
    const now = new Date();
    const licenseExpiry = new Date(content.license.expiryDate);
    if (now > licenseExpiry) {
      return NextResponse.json({ 
        error: 'Content License Expired', 
        code: 'LICENSE_EXPIRED',
        message: 'This title is temporarily unavailable in your region due to license window renewal.'
      }, { status: 403 });
    }

    // 4. Resolve Target Stream URL
    let streamUrl = content.streamUrl;
    let fallbackMp4 = content.fallbackMp4;
    let introStartSec = 0;
    let introEndSec = 0;

    if (content.type === 'series' && episodeId) {
      let targetEp;
      for (const season of content.seasons || []) {
        const found = season.episodes.find(e => e.id === episodeId);
        if (found) {
          targetEp = found;
          break;
        }
      }
      if (targetEp) {
        streamUrl = targetEp.streamUrl;
        fallbackMp4 = targetEp.fallbackMp4 || fallbackMp4;
        introStartSec = targetEp.introStartSec || 0;
        introEndSec = targetEp.introEndSec || 0;
      }
    }

    // 5. Determine Quality Ceiling based on Subscription Plan
    let maxQuality = '1080p';
    if (planId === 'plan_premium') {
      maxQuality = '4K UHD';
    } else if (planId === 'plan_free') {
      maxQuality = '720p HD';
    }

    // 6. Generate Cryptographic Playback Session Token
    const sessionId = `proz_sess_${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = Date.now() + (4 * 60 * 60 * 1000); // 4 hours validity
    const payload = `${sessionId}:${contentId}:${episodeId || 'main'}:${expiresAt}:${maxQuality}`;
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');

    const signedToken = `${payload}:${signature}`;

    return NextResponse.json({
      success: true,
      session: {
        token: signedToken,
        sessionId,
        contentId,
        episodeId,
        expiresAt,
        maxQuality,
        streamUrl,
        dashUrl: content.dashUrl || null,
        fallbackMp4: fallbackMp4 || null,
        drm: {
          system: "Authorized Stream Engine (Widevine/FairPlay/ClearKey Ready)",
          licenseServerUrl: "/api/drm/license",
          isEncrypted: false // Active clear/token authorization on demo open streams
        },
        metadata: {
          title: content.title,
          maturityRating: content.maturityRating,
          introStartSec,
          introEndSec,
          subtitles: content.subtitles,
          audioTracks: content.audioTracks
        }
      }
    });
  } catch (error: any) {
    console.error('Playback authorization error:', error);
    return NextResponse.json({ error: 'Internal Server Error during playback authorization' }, { status: 500 });
  }
}
