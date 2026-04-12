'use client';

import { redirect } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Stats as StatsData, WordleStats } from '@parthenonlab/types';

import { API_URLS } from '@/constants/api';
import { INITIAL_WORDLE } from '@/constants/stats';
import { MAX_ATTEMPTS, WORD_LENGTH, WORD_LIST } from '@/constants/wordle';
import { GameCode, GamePage } from '@/enums/games';
import { WordleKeyStatus, WordleStatus } from '@/enums/games';

import { useFetch, useModal, useParthenon, useWordle } from '@/hooks';
import { BackIcon, RulesIcon, StatsIcon } from '@/images/icons';
import { ActiveGame, ActiveGameRequest, WordleGuess } from '@/interfaces/games';
import { encrypt } from '@/lib/utils';

import { Loading, Modal } from '@/components';
import { AnswerGrid, Keyboard, Notice, Rules, Stats } from './components';
import styles from '../shared/styles/page.module.scss';

const Wordle = () => {
  const { isUserFetched, setStateUser, user } = useParthenon();
  const { modalType, openModal, closeModal } = useModal<'rules' | 'stats'>();
  const { fetchGet, fetchPatch, fetchPost } = useFetch();

  const [stats, setStats] = useState<WordleStats>(INITIAL_WORDLE);
  const [isStatsFetched, setIsStatsFetched] = useState(false);

  const {
    answer,
    currentGuess,
    guesses,
    keyResults,
    reward,
    status,
    onDelete,
    onEnter,
    onKey,
    onPlay,
    onReset,
    onResume,
  } = useWordle();

  const [isGameReady, setIsGameReady] = useState(false);
  const [isStatsUpdated, setIsStatsUpdated] = useState(false);
  const [page, setPage] = useState(GamePage.Overview);

  const answerRef = useRef(answer);
  const currentGuessRef = useRef(currentGuess);
  const gameKeyRef = useRef<string | undefined>(null);
  const gameStatusRef = useRef(status);

  const fetchStats = useCallback(async () => {
    if (!user?.discord_id) return;

    try {
      const data = await fetchGet<StatsData>(
        `${API_URLS.STATS}/${user.discord_id}`,
      );
      setStats(data?.[GameCode.Wordle] ?? INITIAL_WORDLE);
    } catch {
      setStats(INITIAL_WORDLE);
    } finally {
      setIsStatsFetched(true);
    }
  }, [fetchGet, user]);

  useEffect(() => {
    if (!isUserFetched || isStatsFetched) return;
    fetchStats();
  }, [fetchStats, isStatsFetched, isUserFetched]);

  const getGame = useCallback(async () => {
    const game = await fetchPost<ActiveGame, ActiveGameRequest>(
      API_URLS.GAMES,
      {
        code: GameCode.Wordle,
        data: {
          sessionKey: encrypt(answerRef.current),
        },
      },
    );

    if (game) gameKeyRef.current = game.key;
    setIsGameReady(true);
  }, [fetchPost]);

  const updateGame = useCallback(
    async (guess: string) => {
      if (!gameKeyRef.current) return;

      const game = await fetchPatch<ActiveGame, ActiveGameRequest>(
        API_URLS.GAMES,
        {
          key: gameKeyRef.current,
          code: GameCode.Wordle,
          data: {
            sessionCode: encrypt(guess),
          },
        },
      );

      if (game) gameKeyRef.current = game.key;
    },
    [fetchPatch],
  );

  const modifiedEnter = useCallback(async () => {
    if (gameStatusRef.current === WordleStatus.Standby) return;

    if (
      gameStatusRef.current === WordleStatus.Answered ||
      gameStatusRef.current === WordleStatus.Completed
    ) {
      onPlay();
      return;
    }

    onEnter();

    if (currentGuessRef.current.length < WORD_LENGTH) return;
    if (!WORD_LIST.includes(currentGuessRef.current)) return;

    updateGame(currentGuessRef.current);
  }, [onEnter, onPlay, updateGame]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();

      const { key } = event;

      if (key === 'Enter') {
        modifiedEnter();
      } else if (key === 'Backspace') {
        onDelete();
      } else if (/^[a-zA-Z]$/.test(key)) {
        onKey(key.toLowerCase());
      }
    },
    [modifiedEnter, onDelete, onKey],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (answer.length === 0 || answer === answerRef.current) return;
    answerRef.current = answer;
    getGame();
  }, [answer, getGame]);

  useEffect(() => {
    currentGuessRef.current = currentGuess;
  }, [currentGuess]);

  useEffect(() => {
    gameStatusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!user || !user.discord_id || isStatsUpdated) return;

    if (status === WordleStatus.Answered) {
      setIsStatsUpdated(true);

      const newDistribution = [...stats.distribution];
      newDistribution[guesses.length - 1] += 1;

      setStats({
        currentStreak: stats.currentStreak + 1,
        distribution: newDistribution,
        maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1),
        totalPlays: stats.totalPlays + 1,
        totalWon: stats.totalWon + 1,
      });

      if (reward) {
        setStateUser({
          ...user,
          cash: user.cash + reward,
        });
      }
    } else if (status === WordleStatus.Completed) {
      setIsStatsUpdated(true);

      setStats({
        ...stats,
        currentStreak: 0,
        totalPlays: stats.totalPlays + 1,
      });
    }
  }, [
    guesses.length,
    isStatsUpdated,
    reward,
    setStateUser,
    stats,
    status,
    user,
  ]);

  useEffect(() => {
    if (status === WordleStatus.Playing && isStatsUpdated) {
      setIsStatsUpdated(false);
    }
  }, [status, isStatsUpdated]);

  if (isUserFetched && (!user || !user?.discord_id)) redirect('/dashboard');

  const initialGuessResult = Array(WORD_LENGTH).fill(WordleKeyStatus.Default);

  // + 1 to take into account the current guess
  const fillLength = MAX_ATTEMPTS - (guesses.length + 1);

  const fillArray: WordleGuess[] =
    fillLength > 0
      ? Array.from({ length: fillLength }, () => ({
          word: '',
          result: [...initialGuessResult],
        }))
      : [];

  const currentGuessArray: WordleGuess[] =
    guesses.length < MAX_ATTEMPTS
      ? [
          {
            word: currentGuess,
            result: initialGuessResult,
          },
        ]
      : [];

  const guessesArray: WordleGuess[] = [
    ...guesses,
    ...currentGuessArray,
    ...fillArray,
  ];

  return (
    <div className={styles.wordle}>
      <div className={styles.header}>
        <div className={styles.leftButtons}>
          {page !== GamePage.Overview && (
            <>
              <button
                className={styles.back}
                onClick={() => {
                  onReset();
                  setPage(GamePage.Overview);
                }}>
                <BackIcon />
              </button>
              <button
                className={styles.backDesktop}
                onClick={() => {
                  onReset();
                  setPage(GamePage.Overview);
                }}>
                <BackIcon />
                <span>QUIT</span>
              </button>
            </>
          )}
        </div>
        <h1>WORDLE</h1>
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
          <button
            className={styles.play}
            onClick={() => {
              onPlay();
              setPage(GamePage.Playing);
            }}>
            PLAY
          </button>
          <div className={styles.statsContainer}>
            {!isStatsFetched && <Loading />}
            {isStatsFetched && <Stats data={stats} />}
          </div>
        </div>
      )}
      {page === GamePage.Playing && (
        <div className={styles.playing}>
          {!isGameReady && <Loading />}
          {isGameReady && (
            <>
              <Notice
                answer={answer}
                currentGuess={currentGuess}
                status={status}
                reward={reward}
                onResume={onResume}
              />
              <AnswerGrid
                currentTurn={guesses.length}
                guesses={guessesArray}
                status={status}
              />
              <Keyboard
                keyResults={keyResults}
                onDelete={onDelete}
                onEnter={modifiedEnter}
                onKey={onKey}
              />
            </>
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

export default Wordle;
