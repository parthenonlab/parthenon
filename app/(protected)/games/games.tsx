'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Loading } from '@/components';
import { useParthenon } from '@/hooks';
import { BlackjackIcon, WordleIcon } from '@/images/icons';

import styles from './page.module.scss';

export const Games = () => {
  const { isUserFetched, user } = useParthenon();

  if (!isUserFetched) return <Loading />;
  if (!user?.discord_username) redirect('/dashboard');

  return (
    <div className={styles.games}>
      <h1>GAMES</h1>
      <p className={styles.description}>
        Tired of gambling all and losing?
        <br />
        Earn coins by playing some games here!
      </p>
      <div className={styles.grid}>
        <Link className={styles.gridItem} href="/games/blackjack">
          <BlackjackIcon />
          <span>Blackjack</span>
        </Link>
        <Link className={styles.gridItem} href="/games/wordle">
          <WordleIcon />
          <span>Wordle</span>
        </Link>
      </div>
    </div>
  );
};
