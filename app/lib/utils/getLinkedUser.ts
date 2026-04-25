import type { ExternalAccountResource } from '@clerk/shared/types';
import { User } from '@parthenonlab/types';
import { API_URLS } from '@/constants/api';

/**
 * Resolves the linked user for the authenticated Clerk session.
 * Discord is the primary account. If both Discord and Twitch are linked,
 * attempts to merge them via the API. Falls back to Twitch-only if no Discord.
 *
 * @param accounts - The list of external accounts from Clerk
 * @param fetchGet - A GET fetch helper
 * @param fetchPost - A POST fetch helper
 * @returns The resolved user, or null if not found
 */
export const getLinkedUser = async (
  accounts: ExternalAccountResource[],
  fetchGet: <T>(url: string) => Promise<T | null>,
  fetchPost: <T>(url: string, payload: Partial<T>) => Promise<T | null>
): Promise<User | null> => {
  const discordInfo = accounts.find(account => account.provider === 'discord');
  const twitchInfo = accounts.find(account => account.provider === 'twitch');

  if (discordInfo && twitchInfo) {
    return fetchPost<User>(API_URLS.USERS, {
      discord_id: discordInfo.providerUserId,
      twitch_id: twitchInfo.providerUserId,
    });
  }

  const primary = discordInfo ?? twitchInfo;
  if (!primary) return null;

  return fetchGet<User>(
    `${API_URLS.USERS}/${primary.providerUserId}?method=${primary.provider}`,
  );
};
