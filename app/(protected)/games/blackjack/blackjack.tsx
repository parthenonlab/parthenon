'use client';

import { redirect } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { API_URLS } from '@/constants/api';
import { GAME_OVER_STATUS_BLK } from '@/constants/cards';
import { INITIAL_BLACKJACK } from '@/constants/stats';
import { BlackjackStatus, GameCode, GamePage } from '@/enums/games';

import { useBlackjack, useFetch, useParthenon } from '@/hooks';
import { BackIcon, RulesIcon, StatsIcon } from '@/images/icons';
import { encrypt } from '@/lib/utils/encryption';

import { BlackjackStats, Stats as StatsData, User } from '@parthenonlab/types';
import { GameObject, PlayCard } from '@/interfaces/games';

import { Loading } from '@/components';
import { Balance, GameTable, Rules, Stats } from './components';
import styles from '../shared/styles/page.module.scss';

const Blackjack = () => {
  const {
    isActiveGamesFetched,
    isUserFetched,
    user,
    setStateActiveGame,
    setStateModal,
    setStateUser,
  } = useParthenon();

  const { fetchGet, fetchPatch, fetchPost } = useFetch();

  const [stats, setStats] = useState<BlackjackStats>(INITIAL_BLACKJACK);
  const [isStatsFetched, setIsStatsFetched] = useState(false);

  const {
    bet,
    dealerHand,
    deck,
    double,
    playerHand,
    status,
    onBetChange,
    onDouble,
    onHit,
    onPlay,
    onReset,
    onSetStatus,
    onStand,
  } = useBlackjack();

  const [page, setPage] = useState(GamePage.Overview);

  const [dealerLastHand, setDealerLastHand] = useState<PlayCard[]>([]);
  const [playerLastHand, setPlayerLastHand] = useState<PlayCard[]>([]);

  const betRef = useRef(bet);
  const gameKeyRef = useRef<string | undefined>(null);
  const gameSavedRef = useRef(false);

  const fetchStats = useCallback(async () => {
    if (!user?.discord_id) return;

    try {
      const data = await fetchGet<StatsData>(
        `${API_URLS.STATS}/${user.discord_id}`
      );
      setStats(data?.[GameCode.Blackjack] ?? INITIAL_BLACKJACK);
    } catch {
      setStats(INITIAL_BLACKJACK);
    } finally {
      setIsStatsFetched(true);
    }
  }, [fetchGet, user]);

  useEffect(() => {
    if (!isUserFetched || isStatsFetched) return;
    fetchStats();
  }, [fetchStats, isStatsFetched, isUserFetched]);

  const getGame = useCallback(async () => {
    const game = await fetchPost<GameObject>(API_URLS.GAMES, {
      code: GameCode.Blackjack,
      data: {
        sessionKey: encrypt('' + betRef.current),
      },
    });

    if (game) gameKeyRef.current = game.key;
    setStateActiveGame(GameCode.Blackjack, game);
  }, [fetchPost, setStateActiveGame]);

  const updateGame = useCallback(async () => {
    if (!gameKeyRef.current) return;

    const codeString = double ? status + '-double' : status;

    const game = await fetchPatch<GameObject>(API_URLS.GAMES, {
      key: gameKeyRef.current,
      code: GameCode.Blackjack,
      data: {
        sessionCode: encrypt(codeString),
      },
    });

    if (game) gameKeyRef.current = game.key;
    setStateActiveGame(GameCode.Blackjack, game);
  }, [double, status, fetchPatch, setStateActiveGame]);

  const updateStats = useCallback(
    (payload: BlackjackStats) => {
      setStats({ ...payload });
    },
    [],
  );

  const updateUser = useCallback(
    async (payload: Partial<User>) => {
      if (!user) return;
      setStateUser({ ...user, ...payload });
    },
    [user, setStateUser],
  );

  useEffect(() => {
    betRef.current = bet;
  }, [bet]);

  useEffect(() => {
    if (!user || !bet) return;
    if (!GAME_OVER_STATUS_BLK.includes(status) || gameSavedRef.current) return;

    gameSavedRef.current = true;
    updateGame();

    const baseStats = stats ?? INITIAL_BLACKJACK;
    const newStats = { ...baseStats, totalPlayed: baseStats.totalPlayed + 1 };

    if (status === BlackjackStatus.Blackjack) {
      updateStats({
        ...newStats,
        totalBlackjack: newStats.totalBlackjack + 1,
        totalWon: newStats.totalWon + 1,
      });

      const reward = double ? bet + bet * 2 : bet + Math.round(bet * 1.5);

      updateUser({
        ...user,
        cash: user.cash + reward,
      });
    } else if (
      status === BlackjackStatus.Win ||
      status === BlackjackStatus.DealerBust
    ) {
      updateStats({
        ...newStats,
        totalWon: newStats.totalWon + 1,
      });

      const reward = double ? bet + bet * 2 : bet * 2;

      updateUser({
        ...user,
        cash: user.cash + reward,
      });
    } else if (status === BlackjackStatus.Push) {
      updateUser({
        ...user,
        cash: user.cash + bet,
      });
    } else {
      if (double) {
        updateUser({
          ...user,
          cash: user.cash - bet,
        });
      }
    }
  }, [bet, double, stats, status, updateGame, updateStats, updateUser, user]);

  useEffect(() => {
    if (!playerHand.length || !dealerHand.length) return;
    if (playerHand.length === 2) gameSavedRef.current = false;
    onSetStatus();
  }, [dealerHand, playerHand, onSetStatus]);

  if (isUserFetched && (!user || !user?.discord_username))
    redirect('/dashboard');

  return (
    <div className={styles.blackjack}>
      <div className={styles.header}>
        <div className={styles.leftButtons}>
          {page !== GamePage.Overview && (
            <>
              <button
                className={styles.back}
                onClick={() => {
                  onReset();
                  setDealerLastHand([]);
                  setPlayerLastHand([]);
                  setPage(GamePage.Overview);
                }}>
                <BackIcon />
              </button>
              <button
                className={styles.backDesktop}
                onClick={() => {
                  onReset();
                  setDealerLastHand([]);
                  setPlayerLastHand([]);
                  setPage(GamePage.Overview);
                }}>
                <BackIcon />
                <span>QUIT</span>
              </button>
            </>
          )}
        </div>
        <h1>BLACKJACK</h1>
        <div className={styles.rightButtons}>
          {page === GamePage.Overview && (
            <>
              <button
                className={styles.rulesOverview}
                onClick={() =>
                  setStateModal({
                    isOpen: true,
                    content: <Rules />,
                  })
                }>
                <RulesIcon />
              </button>
              <button
                className={styles.rulesDesktop}
                onClick={() =>
                  setStateModal({
                    isOpen: true,
                    content: <Rules />,
                  })
                }>
                RULES
              </button>
            </>
          )}
          {page !== GamePage.Overview && (
            <>
              <button
                className={styles.rules}
                onClick={() =>
                  setStateModal({
                    isOpen: true,
                    content: <Rules />,
                  })
                }>
                <RulesIcon />
              </button>
              <button
                className={styles.stats}
                onClick={() =>
                  setStateModal({
                    isOpen: true,
                    content: <Stats data={stats} />,
                  })
                }>
                <StatsIcon />
              </button>
            </>
          )}
        </div>
      </div>
      {page === GamePage.Overview && (
        <div className={styles.overview}>
          <p className={styles.description}>
            Adjust your bet then hit PLAY when ready!
          </p>
          {isUserFetched && user && (
            <>
              <Balance bet={bet} cash={user.cash} onUpdate={onBetChange} />
              <button
                className={`${styles.play} ${styles.casino}`}
                disabled={!bet || bet > user.cash || user.cash === 0}
                onClick={() => {
                  if (bet) {
                    setPage(GamePage.Playing);
                    getGame();
                    onPlay(bet);
                    updateUser({
                      ...user,
                      cash: user.cash - bet,
                    });
                  }
                }}>
                PLAY
              </button>
            </>
          )}
          <div className={styles.statsContainer}>
            {(!isUserFetched || !isStatsFetched) && <Loading />}
            {isStatsFetched && <Stats data={stats} />}
          </div>
        </div>
      )}
      {page === GamePage.Playing && (
        <div className={styles.playing}>
          {(!isUserFetched || !isActiveGamesFetched) && <Loading />}
          {isUserFetched && user && isActiveGamesFetched && (
            <GameTable
              bet={bet}
              cash={user.cash}
              deckSize={deck.length}
              dealerLastHand={dealerLastHand}
              dealerHand={dealerHand}
              double={double}
              getGame={getGame}
              playerLastHand={playerLastHand}
              playerHand={playerHand}
              status={status}
              setDealerLastHand={setDealerLastHand}
              setPlayerLastHand={setPlayerLastHand}
              onBetChange={onBetChange}
              onDouble={onDouble}
              onHit={onHit}
              onPlay={onPlay}
              onStand={onStand}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Blackjack;
