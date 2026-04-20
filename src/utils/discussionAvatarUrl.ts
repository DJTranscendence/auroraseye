/** Filenames under `public/avatars/` (served as `/avatars/<file>`). */
const SAFE_AVATAR_FILE = /^avatar-[a-z0-9-]+\.png$/i;

/**
 * URL for a discussion avatar image (desktop and mobile).
 * Assets live in `public/avatars/` — see repo `public/avatars/*.png`.
 */
export function discussionAvatarDisplayUrl(avatarFile: string): string {
  const trimmed = avatarFile.trim();
  if (!SAFE_AVATAR_FILE.test(trimmed)) {
    return '';
  }
  return `/avatars/${encodeURIComponent(trimmed)}`;
}
