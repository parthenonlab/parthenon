'use client';

import { redirect } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

import { API_URLS } from '@/constants/api';
import { INITIAL_BLACKJACK, INITIAL_WORDLE } from '@/constants/stats';
import { GameCode } from '@/enums/games';

import { Header, Modal } from '@/components';
import { useFetch, useParthenon } from '@/hooks';
import { getLinkedUser } from '@/lib/utils';

import { GameObject } from '@/interfaces/games';
import { Stats } from '@parthenonlab/types';

import styles from './layout.module.scss';

const ProtectedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { isLoaded, isSignedIn, user: userClerk } = useUser();
  const { fetchGet, fetchGetArray, fetchPost } = useFetch();

  const {
    activeGames,
    isActiveGamesFetched,
    isStatsFetched,
    isUserFetched,
    modal,
    setStateActiveGames,
    setStateStats,
    setStateUser,
    stats,
    user,
  } = useParthenon();

  const fetchGames = useCallback(
    async (discordId: string | null) => {
      if (!discordId) return setStateActiveGames([]);

      const url = `${API_URLS.GAMES}/${discordId}`;
      const games = await fetchGetArray<GameObject>(url);

      setStateActiveGames(games);
    },
    [fetchGetArray, setStateActiveGames]
  );

  const fetchStats = useCallback(
    async (discordId: string | null) => {
      if (!discordId) return;

      const url = `${API_URLS.STATS}/${discordId}`;
      const stats = await fetchGet<Stats>(url);

      setStateStats(
        stats ?? {
          discord_id: discordId,
          [GameCode.Blackjack]: INITIAL_BLACKJACK,
          [GameCode.Wordle]: INITIAL_WORDLE,
        }
      );
    },
    [fetchGet, setStateStats]
  );

  const fetchUser = useCallback(async () => {
    if (!userClerk) return;

    try {
      const data = await getLinkedUser(
        userClerk.externalAccounts,
        fetchGet,
        fetchPost
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

  useEffect(() => {
    if (!isUserFetched || !user || isStatsFetched) return;
    if (!stats) fetchStats(user.discord_id);
  }, [fetchStats, isStatsFetched, isUserFetched, stats, user]);

  useEffect(() => {
    if (!isUserFetched || !user || isActiveGamesFetched) return;
    if (!activeGames) fetchGames(user.discord_id);
  }, [activeGames, fetchGames, isActiveGamesFetched, isUserFetched, user]);

  if (isLoaded && !isSignedIn) return redirect('/');

  return (
    <>
      <Header />
      <div className={styles.container}>{children}</div>
      {modal.isOpen && <Modal />}
    </>
  );
};

export default ProtectedLayout;
