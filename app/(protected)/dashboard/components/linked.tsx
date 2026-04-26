'use client';

import { useUser } from '@clerk/nextjs';
import { DiscordIcon, TwitchIcon } from '@/images/icons';
import { useFetch, useParthenon } from '@/hooks';

import styles from '../styles/linked.module.scss';

export const AccountLinked = ({
  discord,
  twitch,
}: {
  discord: string;
  twitch: string;
}) => {
  const { user: clerkUser } = useUser();
  const { user, setStateUser } = useParthenon();
  const { fetchPatch } = useFetch();

  const handleUnlink = async () => {
    if (!window.confirm('Are you sure you want to unlink your Twitch account?'))
      return;

    const twitchAccounts = clerkUser?.externalAccounts.filter(
      a => a.provider === 'twitch',
    );

    await Promise.all(twitchAccounts?.map(a => a.destroy()) ?? []);

    await fetchPatch(`/api/users/${user?.discord_id}`, {
      action: 'unlink_twitch',
    });

    setStateUser(
      user ? { ...user, twitch_id: null, twitch_username: null } : null,
    );
  };

  return (
    <div className={styles.linked}>
      <h2>Accounts Linked</h2>
      <div className={styles.buttons}>
        <a
          className={styles.button}
          href={`https://twitch.tv/${twitch}`}
          target="_blank">
          <TwitchIcon />
          <span>{twitch}</span>
        </a>
        <div className={styles.button}>
          <DiscordIcon />
          <span>{discord}</span>
        </div>
      </div>
      <button className={styles.note} onClick={handleUnlink}>
        Unlink Twitch Account
      </button>
    </div>
  );
};
