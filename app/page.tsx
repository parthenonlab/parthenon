'use client';

import Image from 'next/image';
import { redirect, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { SignInButton, useUser } from '@clerk/nextjs';

import { Header, Loading } from '@/components';
import { SOCIAL_URLS } from '@/constants/navigation';
import avatar from '@/images/avatar.png';

import {
  BskyIcon,
  GithubIcon,
  InstagramIcon,
  TwitchIcon,
  XIcon,
} from '@/images/icons';

import styles from '@/styles/page.module.scss';

const HomeContent = () => {
  const { isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') ?? '/dashboard';

  if (isSignedIn) return redirect(redirectUrl);

  return (
    <>
      <Header />
      {!isLoaded ? (
        <Loading />
      ) : (
        <div className={styles.container}>
          <figure className={styles.avatar}>
            <Image
              alt="Athena Avatar"
              className={styles.avatarImg}
              height={300}
              priority
              src={avatar}
              width={300}
            />
          </figure>
          <div className={styles.description}>
            <h1>Welcome to the Parthenon!</h1>
            <p>The official website of the AthenaUS community</p>
          </div>
          <div className={styles.login}>
            <SignInButton forceRedirectUrl={redirectUrl}>LOGIN</SignInButton>
          </div>
          <div className={styles.social}>
            <p>Connect with me!</p>
            <div className={styles.socialIcons}>
              <a href={SOCIAL_URLS.Twitch} target="_blank">
                <TwitchIcon />
              </a>
              <a href={SOCIAL_URLS.X} target="_blank">
                <XIcon />
              </a>
              <a href={SOCIAL_URLS.Bluesky} target="_blank">
                <BskyIcon />
              </a>
              <a href={SOCIAL_URLS.Github} target="_blank">
                <GithubIcon />
              </a>
              <a href={SOCIAL_URLS.Instagram} target="_blank">
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Home = () => (
  <Suspense fallback={<Loading />}>
    <HomeContent />
  </Suspense>
);

export default Home;
