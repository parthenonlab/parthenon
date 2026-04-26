'use client';

import Image from 'next/image';

import { Loading } from '@/components';
import { useParthenon } from '@/hooks';

import styles from './page.module.scss';

const whitelist = process.env.NEXT_PUBLIC_DISCORD_TEAM?.split(',') ?? [];
const inviteURL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? '';

export const Invite = () => {
  const { isUserFetched, user } = useParthenon();

  if (!isUserFetched) return <Loading />;

  const isRestricted =
    !user || !whitelist.includes(user.discord_username ?? '');

  return (
    <div className={styles.invite}>
      <h1>
        INVITE <span>LITTLEOWL</span>
      </h1>
      <figure className={styles.avatar}>
        <Image
          alt="Little Owl"
          height={72}
          priority
          quality={100}
          src="/owl.png"
          width={72}
        />
      </figure>
      {isRestricted && (
        <div>
          <p>Only specific users can invite Little Owl.</p>
          <p>
            If you are a member of the Little Owl Team, contact{' '}
            <a href="mailto:athena@parthenon.app">athena@parthenon.app</a> for
            access.
          </p>
        </div>
      )}
      {!isRestricted && (
        <a className={styles.inviteButton} href={inviteURL}>
          ADD TO SERVER
        </a>
      )}
    </div>
  );
};
