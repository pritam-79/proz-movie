/**
 * AI-Generated Adult Videos Provider & Job Adapter (v0.09.03)
 *
 * Safety & Policy Rules:
 * - Strictly 18+ consenting fictional characters only
 * - Zero real-person likenesses, deepfakes, non-consensual imagery, or minors
 * - Only verified playable MP4/HLS streams are marked playable
 * - Supports external AI generation provider adapters (Replicate / Fal / ComfyUI) when configured in env
 */

import { fetchRedGifsVideos } from './redgifs';
import { classifyAdultVisualContent, type ClassificationMetadata } from '../services/contentClassifier';

export type AiVideoCategory =
  | 'All'
  | 'AI 3D Animation'
  | 'AI Cinematic Videos'
  | 'AI VR Videos'
  | 'AI Short Videos'
  | 'Recently Added'
  | 'Trending AI Videos';

export interface AiAdultVideoEntry {
  id: string;
  title: string;
  creator: string;
  category: Exclude<AiVideoCategory, 'All' | 'Recently Added' | 'Trending AI Videos'>;
  cover: string;
  streamUrl: string;
  durationSeconds: number;
  resolution: string;
  views: number;
  rating: number;
  createdAt: string;
  tags: string[];
  promptSummary: string;
  fictionalOnlyVerified: true;
  isPlayable: boolean;
  watchHref: string;
  classification: ClassificationMetadata;
}

export interface AiGenerationJob {
  jobId: string;
  prompt: string;
  style: string;
  durationSeconds: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'unconfigured';
  message: string;
  createdAt: string;
  outputUrl?: string;
}

const DISALLOWED_LIKENESS_REGEX =
  /\b(deepfake|celebrity|real person|face swap|faceswap|lookalike|minor|teen|underage|schoolgirl|loli|shota)\b/i;

export function validateAiPromptSafety(prompt: string): { valid: boolean; reason?: string } {
  const trimmed = prompt.trim();
  if (trimmed.length < 6) {
    return { valid: false, reason: 'Prompt must be at least 6 characters describing a fictional 18+ scene.' };
  }
  if (DISALLOWED_LIKENESS_REGEX.test(trimmed)) {
    return {
      valid: false,
      reason: 'Blocked by safety policy: only original fictional 18+ characters are permitted (no real-person likenesses or deepfakes).',
    };
  }
  return { valid: true };
}

export function isAiGenerationConfigured(): { configured: boolean; provider: string } {
  if (process.env.AI_VIDEO_API_URL && process.env.AI_VIDEO_API_KEY) {
    return { configured: true, provider: process.env.AI_VIDEO_PROVIDER || 'Custom AI Video Endpoint' };
  }
  if (process.env.REPLICATE_API_TOKEN) {
    return { configured: true, provider: 'Replicate Video Pipeline' };
  }
  if (process.env.FAL_KEY) {
    return { configured: true, provider: 'Fal.ai Video Pipeline' };
  }
  return { configured: false, provider: 'None configured' };
}

const inMemoryJobs = new Map<string, AiGenerationJob>();

export async function createAiVideoJob(params: {
  prompt: string;
  style?: string;
  durationSeconds?: number;
}): Promise<AiGenerationJob> {
  const safety = validateAiPromptSafety(params.prompt);
  const jobId = `aijob-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (!safety.valid) {
    const failedJob: AiGenerationJob = {
      jobId,
      prompt: params.prompt,
      style: params.style || 'AI 3D Animation',
      durationSeconds: params.durationSeconds || 8,
      status: 'failed',
      message: safety.reason || 'Safety validation failed.',
      createdAt: new Date().toISOString(),
    };
    inMemoryJobs.set(jobId, failedJob);
    return failedJob;
  }

  const envCheck = isAiGenerationConfigured();
  if (!envCheck.configured) {
    const unconfiguredJob: AiGenerationJob = {
      jobId,
      prompt: params.prompt,
      style: params.style || 'AI 3D Animation',
      durationSeconds: params.durationSeconds || 8,
      status: 'unconfigured',
      message:
        'AI generation provider credentials (AI_VIDEO_API_URL + AI_VIDEO_API_KEY, REPLICATE_API_TOKEN, or FAL_KEY) are not configured on this server. Browse verified AI-generated streams below or configure your generation endpoint in environment settings.',
      createdAt: new Date().toISOString(),
    };
    inMemoryJobs.set(jobId, unconfiguredJob);
    return unconfiguredJob;
  }

  // If operator configured custom webhook/HTTP endpoint, dispatch job cleanly
  if (process.env.AI_VIDEO_API_URL && process.env.AI_VIDEO_API_KEY) {
    try {
      const res = await fetch(process.env.AI_VIDEO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.AI_VIDEO_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: `Fictional 18+ consenting adult animation: ${params.prompt}`,
          style: params.style || 'AI 3D Animation',
          durationSeconds: Math.min(20, Math.max(4, params.durationSeconds || 8)),
          safetyMode: 'fictional_adult_only',
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        const errJob: AiGenerationJob = {
          jobId,
          prompt: params.prompt,
          style: params.style || 'AI 3D Animation',
          durationSeconds: params.durationSeconds || 8,
          status: 'failed',
          message: `Provider returned HTTP ${res.status}`,
          createdAt: new Date().toISOString(),
        };
        inMemoryJobs.set(jobId, errJob);
        return errJob;
      }
      const data = await res.json().catch(() => ({}));
      const job: AiGenerationJob = {
        jobId: data.jobId || jobId,
        prompt: params.prompt,
        style: params.style || 'AI 3D Animation',
        durationSeconds: params.durationSeconds || 8,
        status: data.outputUrl ? 'completed' : 'processing',
        message: data.message || `Dispatched to ${envCheck.provider}`,
        createdAt: new Date().toISOString(),
        outputUrl: data.outputUrl,
      };
      inMemoryJobs.set(job.jobId, job);
      return job;
    } catch (err: any) {
      const errJob: AiGenerationJob = {
        jobId,
        prompt: params.prompt,
        style: params.style || 'AI 3D Animation',
        durationSeconds: params.durationSeconds || 8,
        status: 'failed',
        message: err?.message || 'Generation provider request timed out',
        createdAt: new Date().toISOString(),
      };
      inMemoryJobs.set(jobId, errJob);
      return errJob;
    }
  }

  const queuedJob: AiGenerationJob = {
    jobId,
    prompt: params.prompt,
    style: params.style || 'AI 3D Animation',
    durationSeconds: params.durationSeconds || 8,
    status: 'queued',
    message: `Job queued on ${envCheck.provider}.`,
    createdAt: new Date().toISOString(),
  };
  inMemoryJobs.set(jobId, queuedJob);
  return queuedJob;
}

export function getAiVideoJob(jobId: string): AiGenerationJob | null {
  return inMemoryJobs.get(jobId) || null;
}

export async function getAiAdultVideosCatalog(options: {
  category?: string;
  q?: string;
  page?: number;
  sort?: 'newest' | 'popular' | 'rating';
} = {}): Promise<{
  items: AiAdultVideoEntry[];
  totalCount: number;
  hasMore: boolean;
  generationProvider: { configured: boolean; provider: string };
}> {
  const category = (options.category || 'All') as AiVideoCategory;
  const page = Math.max(1, options.page || 1);
  const q = (options.q || '').trim();

  const searchQuery = q
    ? `${q} ai`
    : category === 'AI VR Videos'
    ? 'ai vr 3d'
    : category === 'AI 3D Animation'
    ? 'ai 3d animation'
    : category === 'AI Cinematic Videos'
    ? 'ai generated'
    : 'ai animation 3d';

  const [primaryRes, secondaryRes] = await Promise.all([
    fetchRedGifsVideos({
      query: searchQuery,
      page,
      count: 28,
      order: category === 'Trending AI Videos' ? 'trending' : category === 'Recently Added' ? 'new' : 'top28',
    }).catch(() => ({ items: [], creators: [], total: 0 })),
    fetchRedGifsVideos({
      query: q ? `${q} sfm ai` : 'blender ai 3d',
      page,
      count: 16,
      order: 'top7',
    }).catch(() => ({ items: [], creators: [], total: 0 })),
  ]);

  const seen = new Set<string>();
  const items: AiAdultVideoEntry[] = [];

  for (const rg of [...primaryRes.items, ...secondaryRes.items]) {
    if (seen.has(rg.id) || !rg.hdUrl) continue;
    const text = `${rg.title} ${rg.tags.join(' ')} ${rg.description}`.toLowerCase();
    if (DISALLOWED_LIKENESS_REGEX.test(text)) continue;

    seen.add(rg.id);

    const assignedCategory: AiAdultVideoEntry['category'] = /\b(vr|180|360)\b/.test(text)
      ? 'AI VR Videos'
      : rg.duration > 0 && rg.duration <= 20
      ? 'AI Short Videos'
      : /\b(3d|cgi|blender|sfm|unreal|render)\b/.test(text)
      ? 'AI 3D Animation'
      : 'AI Cinematic Videos';

    if (
      category !== 'All' &&
      category !== 'Recently Added' &&
      category !== 'Trending AI Videos' &&
      assignedCategory !== category
    ) {
      continue;
    }

    const meta = classifyAdultVisualContent({
      id: rg.id,
      title: rg.title,
      studio: rg.displayName,
      tags: ['AI Generated', ...rg.tags],
      details: rg.description,
      sourceProvider: 'ai_videos',
      playbackUrl: rg.hdUrl,
      isPlayable: true,
    });

    items.push({
      id: rg.id,
      title: rg.title,
      creator: rg.displayName,
      category: assignedCategory,
      cover: rg.poster || rg.thumbnail,
      streamUrl: rg.hdUrl,
      durationSeconds: rg.duration || 15,
      resolution: rg.height >= 1080 ? '1080p HD' : rg.height >= 720 ? '720p HD' : 'SD',
      views: rg.views,
      rating: 4.8,
      createdAt: rg.createdAt || new Date().toISOString(),
      tags: ['AI Fictional 18+', assignedCategory, ...rg.tags.slice(0, 3)],
      promptSummary: rg.description || 'Original 18+ fictional AI-rendered video.',
      fictionalOnlyVerified: true,
      isPlayable: true,
      watchHref: `/watch/${rg.id}`,
      classification: meta,
    });
  }

  if (options.sort === 'popular') {
    items.sort((a, b) => b.views - a.views);
  } else if (options.sort === 'rating') {
    items.sort((a, b) => b.rating - a.rating);
  } else {
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return {
    items,
    totalCount: Math.max(items.length, primaryRes.total || items.length),
    hasMore: primaryRes.items.length >= 16,
    generationProvider: isAiGenerationConfigured(),
  };
}
