import type { ExternalAccountResource } from '@clerk/shared/types';
import { User } from '@parthenonlab/types';
import { API_URLS } from '@/constants/api';

/**
 * Resolves the linked user for the authenticated Clerk session.
 * If only one external account is linked, fetches the user by that account.
 * If both Discord and Twitch are linked, attempts to merge the two accounts via the API.
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
  let data = null;

  if (accounts.length < 2) {
    const userAccount = accounts[0];

    const url = `${API_URLS.USERS}/${userAccount.providerUserId}?method=${userAccount.provider}`;
    data = await fetchGet<User>(url);
  } else {
    const discordInfo = accounts.find(
      account => account.provider === 'discord'
    );
    const twitchInfo = accounts.find(account => account.provider === 'twitch');

    data = await fetchPost<User>(API_URLS.USERS, {
      discord_id: discordInfo!.providerUserId,
      twitch_id: twitchInfo!.providerUserId,
    });
  }

  return data;
};
