'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

import { Loading } from '@/components';
import { useParthenon } from '@/hooks';
import { SilverIcon, StarIcon } from '@/images/icons';
import { formatNumberToString } from '@/lib/utils';

import { AccountLinked, Instructions, Register } from './components';
import styles from './page.module.scss';

const Dashboard = () => {
  const { user: userClerk } = useUser();
  const { isUserFetched, user } = useParthenon();

  const renderRightSection = () => {
    if (!isUserFetched) return <Loading />;
    if (!user) return <Register />;

    if (user.discord_username) {
      if (user.twitch_username) {
        return (
          <AccountLinked
            discord={user.discord_username ?? 'Discord'}
            twitch={user.twitch_username ?? 'Twitch'}
          />
        );
      } else {
        return <Instructions />;
      }
    } else {
      return user.twitch_username && <Instructions code={user.user_id} />;
    }
  };

  let displayName = '';

  if (user) {
    if (user.discord_name) displayName = `, ${user.discord_name}`;
    else if (user.discord_username) displayName = `, ${user.discord_username}`;
    else if (user.twitch_username) displayName = `, ${user.twitch_username}`;
  }

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

export default Dashboard;
