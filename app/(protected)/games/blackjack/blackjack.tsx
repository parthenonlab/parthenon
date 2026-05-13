'use client';

import { redirect } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { BlackjackStats, Stats as StatsData, User } from '@parthenonlab/types';

import { API_URLS } from '@/constants/api';
import { GAME_OVER_STATUS_BLK } from '@/constants/cards';
import { INITIAL_BLACKJACK } from '@/constants/stats';
import { GameCode, GamePage } from '@/enums/games';

import { useBlackjack, useFetch, useModal, useParthenon } from '@/hooks';
import { BackIcon, RulesIcon, StatsIcon } from '@/images/icons';
import { ActiveGameRequest, ActiveGameResult } from '@/interfaces/games';
import { encrypt } from '@/lib/utils/encryption';
import { getHandValue } from '@/lib/utils/cards';

import { Loading, Modal } from '@/components';
import { Balance, GameTable, Rules, Stats } from './components';
import styles from '../shared/styles/page.module.scss';

export const Blackjack = () => {
  const { isUserFetched, user, setStateUser } = useParthenon();
  const { modalType, openModal, closeModal } = useModal<'rules' | 'stats'>();
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

  const [isGameReady, setIsGameReady] = useState(false);
  const [page, setPage] = useState(GamePage.Overview);

  const betRef = useRef(bet);
  const gameKeyRef = useRef<string | null>(null);
  const gameSavedRef = useRef(false);

  const fetchStats = useCallback(async () => {
    if (!user?.discord_id) return;

    const data = await fetchGet<StatsData>(
      `${API_URLS.STATS}/${user.discord_id}`,
    );
    setStats(data?.[GameCode.Blackjack] ?? INITIAL_BLACKJACK);
    setIsStatsFetched(true);
  }, [fetchGet, user]);

  useEffect(() => {
    if (!isUserFetched || isStatsFetched) return;
    fetchStats();
  }, [fetchStats, isStatsFetched, isUserFetched]);

  const getGame = useCallback(async (skipLoading = false): Promise<boolean> => {
    if (!skipLoading) setIsGameReady(false);
    const game = await fetchPost<
      ActiveGameResult<BlackjackStats>,
      ActiveGameRequest
    >(API_URLS.GAMES, {
      code: GameCode.Blackjack,
      data: {
        sessionKey: encrypt('' + betRef.current),
      },
    });

    if (game) {
      gameKeyRef.current = game.key;
      setIsGameReady(true);
      return true;
    }

    return false;
  }, [fetchPost]);

  const updateGame =
    useCallback(async (): Promise<ActiveGameResult<BlackjackStats> | null> => {
      const key = gameKeyRef.current;
      if (!key) return null;

      const codeString = double ? status + '-double' : status;

      const result = await fetchPatch<
        ActiveGameResult<BlackjackStats>,
        ActiveGameRequest
      >(API_URLS.GAMES, {
        key,
        code: GameCode.Blackjack,
        data: {
          sessionCode: encrypt(codeString),
        },
      });

      if (result && gameKeyRef.current === key) gameKeyRef.current = result.key;
      return result ?? null;
    }, [double, status, fetchPatch]);

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

    (async () => {
      try {
        const result = await updateGame();
        if (!result) return;
        if (result.stats) setStats(result.stats);
        if (result.cashDelta !== undefined) {
          updateUser({ cash: user.cash + result.cashDelta });
          fetchPost(API_URLS.NOTIFY_BLACKJACK, {
            playerTotal: getHandValue(playerHand),
            dealerTotal: getHandValue(dealerHand),
            result: status,
            cashDelta: result.cashDelta,
          });
        }
      } catch {
        // game result failed to save — outcome is not persisted
      }
    })();
  }, [bet, status, updateGame, updateUser, user]);

  useEffect(() => {
    if (!playerHand.length || !dealerHand.length) return;
    if (playerHand.length === 2) gameSavedRef.current = false;
    onSetStatus();
  }, [dealerHand, playerHand, onSetStatus]);

  if (isUserFetched && (!user || !user.discord_username))
    redirect('/dashboard');

  const handleBack = () => {
    onReset();
    setPage(GamePage.Overview);
  };

  return (
    <div className={styles.blackjack}>
      <div className={styles.header}>
        <div className={styles.leftButtons}>
          {page !== GamePage.Overview && (
            <>
              <button className={styles.back} onClick={handleBack}>
                <BackIcon />
              </button>
              <button className={styles.backDesktop} onClick={handleBack}>
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
                onClick={() => openModal('rules')}>
                <RulesIcon />
              </button>
              <button
                className={styles.rulesDesktop}
                onClick={() => openModal('rules')}>
                RULES
              </button>
            </>
          )}
          {page !== GamePage.Overview && (
            <>
              <button
                className={styles.rules}
                onClick={() => openModal('rules')}>
                <RulesIcon />
              </button>
              <button
                className={styles.stats}
                onClick={() => openModal('stats')}>
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
                onClick={async () => {
                  setPage(GamePage.Playing);
                  const success = await getGame();
                  if (!success) {
                    setPage(GamePage.Overview);
                    return;
                  }
                  onPlay(bet!);
                  updateUser({ cash: user.cash - bet! });
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
          {(!isUserFetched || !isGameReady) && <Loading />}
          {isUserFetched && user && isGameReady && (
            <GameTable
              bet={bet}
              cash={user.cash}
              deckSize={deck.length}
              dealerHand={dealerHand}
              double={double}
              getGame={getGame}
              playerHand={playerHand}
              status={status}
              onBetChange={onBetChange}
              onDouble={onDouble}
              onHit={onHit}
              onPlay={onPlay}
              onStand={onStand}
            />
          )}
        </div>
      )}
      {modalType && (
        <Modal onClose={closeModal}>
          {modalType === 'rules' ? <Rules /> : <Stats data={stats} />}
        </Modal>
      )}
    </div>
  );
};
