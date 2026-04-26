'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

import { Loading } from '@/components';
import { useParthenon } from '@/hooks';
import { SilverIcon, StarIcon } from '@/images/icons';
import { formatNumberToString } from '@/lib/utils';

import { AccountLinked, Instructions, Register } from './components';
import styles from './page.module.scss';

export const Dashboard = () => {
  const { user: userClerk } = useUser();
  const { isUserFetched, user } = useParthenon();

  const renderRightSection = () => {
    if (!isUserFetched) return <Loading />;
    if (!user) return <Register />;

    if (!user.discord_username)
      return user.twitch_username ? <Instructions code={user.user_id} /> : null;

    if (!user.twitch_username) return <Instructions />;

    return (
      <AccountLinked
        discord={user.discord_username}
        twitch={user.twitch_username}
      />
    );
  };

  const nameLabel =
    user &&
    (user.discord_name ?? user.discord_username ?? user.twitch_username);

  const displayName = nameLabel ? `, ${nameLabel}` : '';

  return (
    <div className={styles.dashboard}>
      <div className={styles.info}>
        <h1>Welcome{displayName}!</h1>
        <div className={styles.bio}>
          <figure className={styles.avatar}>
            {userClerk && (
              <Image
                alt="Avatar"
                height={200}
                priority
                quality={100}
                src={userClerk.imageUrl}
                width={200}
              />
            )}
          </figure>
          <div className={styles.balance}>
            <div className={styles.item}>
              <p className={styles.label}>
                <span>POINTS</span>
                <span>{user ? formatNumberToString(user.cash) : 0}</span>
              </p>
              <SilverIcon />
            </div>
            <div className={styles.item}>
              <p className={styles.label}>
                <span>STARS</span>
                <span>{user ? formatNumberToString(user.stars) : 0}</span>
              </p>
              <StarIcon />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.status}>{renderRightSection()}</div>
    </div>
  );
};
