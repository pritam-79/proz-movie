/**
 * PROZ MOVIE v0.09.02 — Server-Side Encrypted Environment & Stash Vault Helper
 *
 * Strictly enforces server-side secrecy:
 * - Reads STASHDB_ENDPOINT, STASHDB_API_KEY, STASH_SERVER_URL, STASH_API_KEY from process.env
 * - Supports optional AES-256-GCM encrypted server-local storage (.proz-vault.enc, gitignored)
 *   for administrator-provided backend configuration when hosting platforms cannot inject at runtime.
 * - Guards Node built-ins (fs, path, crypto) behind server-only dynamic resolution so client bundles never pull Node stdlib.
 * - NEVER exposes API keys, secrets, or tokens in client responses, logs, builds, or HTML.
 */

export interface VaultRuntimeConfig {
  stashServerUrl?: string;
  stashApiKey?: string;
  stashDbEndpoint?: string;
  stashDbApiKey?: string;
  updatedAt?: string;
}

const isServerRuntime =
  typeof window === 'undefined' &&
  typeof process !== 'undefined' &&
  Boolean(process.versions?.node);

function getNodeModules(): {
  fs: typeof import('fs');
  path: typeof import('path');
  crypto: typeof import('crypto');
} | null {
  if (!isServerRuntime) return null;
  try {
    // Indirect require keeps webpack client builds from resolving Node stdlib modules.
    const nodeReq = eval('require') as (id: string) => any;
    return {
      fs: nodeReq('fs'),
      path: nodeReq('path'),
      crypto: nodeReq('crypto'),
    };
  } catch {
    return null;
  }
}

function getVaultFilePath(pathMod: typeof import('path')): string {
  return pathMod.join(process.cwd(), '.proz-vault.enc');
}

function deriveAesKey(cryptoMod: typeof import('crypto')): Buffer {
  const secret =
    process.env.JWT_PLAYBACK_SECRET ||
    process.env.ADMIN_ACCESS_KEY ||
    'proz-movie-server-vault-default-secret-v0902';
  return cryptoMod.createHash('sha256').update(secret).digest();
}

let inMemoryVault: VaultRuntimeConfig | null = null;

export function readServerVault(): VaultRuntimeConfig {
  if (!isServerRuntime) return {};
  if (inMemoryVault) return inMemoryVault;

  const mods = getNodeModules();
  if (!mods) return {};

  try {
    const vaultPath = getVaultFilePath(mods.path);
    if (!mods.fs.existsSync(vaultPath)) {
      return {};
    }
    const raw = JSON.parse(mods.fs.readFileSync(vaultPath, 'utf8'));
    if (!raw?.iv || !raw?.tag || !raw?.data) return {};

    const key = deriveAesKey(mods.crypto);
    const decipher = mods.crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(raw.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(raw.tag, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(raw.data, 'hex')),
      decipher.final(),
    ]).toString('utf8');

    const parsed = JSON.parse(decrypted) as VaultRuntimeConfig;
    inMemoryVault = parsed;
    return parsed;
  } catch {
    return {};
  }
}

export function writeServerVault(partial: Partial<VaultRuntimeConfig>): { persistedToDisk: boolean } {
  if (!isServerRuntime) return { persistedToDisk: false };

  const current = readServerVault();
  const next: VaultRuntimeConfig = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  inMemoryVault = next;

  const mods = getNodeModules();
  if (!mods) return { persistedToDisk: false };

  try {
    const vaultPath = getVaultFilePath(mods.path);
    const key = deriveAesKey(mods.crypto);
    const iv = mods.crypto.randomBytes(12);
    const cipher = mods.crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(next), 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    mods.fs.writeFileSync(
      vaultPath,
      JSON.stringify({
        v: 1,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        data: encrypted.toString('hex'),
      }),
      { mode: 0o600 }
    );
    return { persistedToDisk: true };
  } catch {
    return { persistedToDisk: false };
  }
}

export function getResolvedServerEnv() {
  if (!isServerRuntime) {
    return {
      stashServerUrl: '',
      stashApiKey: '',
      stashServerConfigured: false,
      stashDbEndpoint: '',
      stashDbApiKey: '',
      stashDbConfigured: false,
      hasSupabaseUrl: false,
      hasTmdbKey: false,
      hasWatchmodeKey: false,
      hasYoutubeKey: false,
    };
  }

  const vault = readServerVault();
  const rawStashUrl = (
    process.env.STASH_SERVER_URL ||
    process.env.STASH_GRAPHQL_URL ||
    vault.stashServerUrl ||
    ''
  ).trim();

  const rawStashApiKey = (
    process.env.STASH_API_KEY ||
    process.env.STASH_APIKEY ||
    vault.stashApiKey ||
    ''
  ).trim();

  const stashDbEndpoint = (
    process.env.STASHDB_ENDPOINT ||
    vault.stashDbEndpoint ||
    'https://stashdb.org/graphql'
  ).trim();

  const stashDbApiKey = (
    process.env.STASHDB_API_KEY ||
    vault.stashDbApiKey ||
    ''
  ).trim();

  return {
    stashServerUrl: rawStashUrl,
    stashApiKey: rawStashApiKey,
    stashServerConfigured: Boolean(rawStashUrl),
    stashDbEndpoint,
    stashDbApiKey,
    stashDbConfigured: Boolean(stashDbEndpoint && stashDbApiKey),
    hasSupabaseUrl: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo-project.supabase')
    ),
    hasTmdbKey: Boolean(process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY),
    hasWatchmodeKey: Boolean(process.env.WATCHMODE_API_KEY),
    hasYoutubeKey: Boolean(process.env.YOUTUBE_API_KEY),
  };
}
