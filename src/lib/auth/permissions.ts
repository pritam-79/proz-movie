/**
 * PROZ Entertainment v0.02 — Server-side Multi-User & Library Permission Engine
 * Denied-by-default architecture.
 */

import { UserProfile, UserRoleType } from '@/types/content';
import { UserLibraryPermissions } from '@/types/library';

export const ROLE_HIERARCHY: Record<UserRoleType, number> = {
  super_admin: 100,
  admin: 80,
  moderator: 60,
  premium_user: 40,
  standard_user: 20,
  user: 20, // legacy fallback
  restricted_user: 10
};

export function hasRoleAtLeast(userRole: UserRoleType | undefined, requiredRole: UserRoleType): boolean {
  if (!userRole) return false;
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

export function canAccessAdult(user: UserProfile | null): boolean {
  if (!user) return false;
  if (!user.is18PlusVerified) return false;
  if (user.role === 'restricted_user') return false;
  if (hasRoleAtLeast(user.role, 'admin')) return true;
  return user.libraryPermissions?.canPlayAdult ?? true;
}

export function canDownloadMedia(user: UserProfile | null): boolean {
  if (!user) return false;
  if (hasRoleAtLeast(user.role, 'admin')) return true;
  if (user.role === 'restricted_user') return false;
  return user.libraryPermissions?.canDownload ?? (user.role === 'premium_user');
}

export function canSharePlaylists(user: UserProfile | null): boolean {
  if (!user) return false;
  if (hasRoleAtLeast(user.role, 'moderator')) return true;
  return user.libraryPermissions?.canSharePlaylists ?? true;
}

export function canAccessLibrary(user: UserProfile | null, libraryId: string, isAdult: boolean): boolean {
  if (!user) return false;
  if (isAdult && !canAccessAdult(user)) return false;
  if (hasRoleAtLeast(user.role, 'admin')) return true;
  
  if (user.libraryPermissions?.allowedLibraries) {
    return user.libraryPermissions.allowedLibraries.includes(libraryId) || 
           user.libraryPermissions.allowedLibraries.includes('*');
  }
  return true;
}

export function isItemRestrictedForUser(
  user: UserProfile | null,
  studioId?: string,
  tags?: string[]
): boolean {
  if (!user) return true;
  if (hasRoleAtLeast(user.role, 'admin')) return false;

  const perms = user.libraryPermissions;
  if (!perms) return false;

  // Check allowed studios
  if (studioId && perms.allowedStudios && perms.allowedStudios.length > 0) {
    if (!perms.allowedStudios.includes(studioId)) return true;
  }

  // Check hidden tags
  if (tags && perms.hiddenTags && perms.hiddenTags.length > 0) {
    const hasHiddenTag = tags.some(t => perms.hiddenTags!.includes(t));
    if (hasHiddenTag) return true;
  }

  return false;
}
