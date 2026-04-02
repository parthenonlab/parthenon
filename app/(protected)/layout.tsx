'use client';

import { redirect } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

import { Header } from '@/components';
import { useFetch, useParthenon } from '@/hooks';
import { getLinkedUser } from '@/lib/utils';

import styles from './layout.module.scss';

const ProtectedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { isLoaded, isSignedIn, user: userClerk } = useUser();
  const { fetchGet, fetchPost } = useFetch();

  const { isUserFetched, setStateUser, user } = useParthenon();

  const fetchUser = useCallback(async () => {
    if (!userClerk) return;

    try {
      const data = await getLinkedUser(
        userClerk.externalAccounts,
        fetchGet,
        fetchPost,
      );
      setStateUser(data);
    } catch {
      setStateUser(null);
    }
  }, [fetchGet, fetchPost, setStateUser, userClerk]);

  useEffect(() => {
    if (isUserFetched || !isSignedIn) return;
    if (!user) fetchUser();
  }, [fetchUser, isSignedIn, isUserFetched, user]);

  if (isLoaded && !isSignedIn) return redirect('/');

  return (
    <>
      <Header />
      <div className={styles.container}>{children}</div>
    </>
  );
};

export default ProtectedLayout;
