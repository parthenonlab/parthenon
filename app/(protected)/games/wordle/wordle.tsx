'use client';

import { redirect } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Stats as StatsData, WordleStats } from '@parthenonlab/types';

import { API_URLS } from '@/constants/api';
import { INITIAL_WORDLE } from '@/constants/stats';
import { MAX_ATTEMPTS, WORD_LENGTH, WORD_LIST } from '@/constants/wordle';

import {
  GameCode,
  GamePage,
  WordleKeyStatus,
  WordleStatus,
} from '@/enums/games';

import { useFetch, useModal, useParthenon, useWordle } from '@/hooks';
import { BackIcon, RulesIcon, StatsIcon } from '@/images/icons';
import { encrypt } from '@/lib/utils';

import {
  ActiveGameRequest,
  ActiveGameResult,
  WordleGuess,
} from '@/interfaces/games';

import { Loading, Modal } from '@/components';
import { AnswerGrid, Keyboard, Notice, Rules, Stats } from './components';
import styles from '../shared/styles/page.module.scss';

const initialGuessResult = Array(WORD_LENGTH).fill(WordleKeyStatus.Default);

export const Wordle = () => {
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
    onNetworkError,
    onPlay,
    onReset,
    onResume,
  } = useWordle();

  const [isGameReady, setIsGameReady] = useState(false);
  const [page, setPage] = useState(GamePage.Overview);

  const answerRef = useRef(answer);
  const currentGuessRef = useRef(currentGuess);
  const gameKeyRef = useRef<string | null>(null);
  const gameStatusRef = useRef(status);
  const isUpdatingRef = useRef(false);
  const pendingNewGameRef = useRef(false);

  currentGuessRef.current = currentGuess;
  gameStatusRef.current = status;

  const discordId = user?.discord_id;

  useEffect(() => {
    if (!isUserFetched || isStatsFetched || !discordId) return;

    fetchGet<StatsData>(`${API_URLS.STATS}/${discordId}`).then(data => {
      setStats(data?.[GameCode.Wordle] ?? INITIAL_WORDLE);
      setIsStatsFetched(true);
    });
  }, [discordId, fetchGet, isStatsFetched, isUserFetched]);

  const getGame = useCallback(async (): Promise<boolean> => {
    const game = await fetchPost<
      ActiveGameResult<WordleStats>,
      ActiveGameRequest
    >(API_URLS.GAMES, {
      code: GameCode.Wordle,
      data: {
        sessionKey: encrypt(answerRef.current),
      },
    });

    if (game) {
      gameKeyRef.current = game.key;
      setIsGameReady(true);
      return true;
    }

    return false;
  }, [fetchPost]);

  const updateGame = useCallback(
    async (guess: string): Promise<ActiveGameResult<WordleStats> | null> => {
      if (!gameKeyRef.current) return null;

      const result = await fetchPatch<
        ActiveGameResult<WordleStats>,
        ActiveGameRequest
      >(API_URLS.GAMES, {
        key: gameKeyRef.current,
        code: GameCode.Wordle,
        data: {
          sessionCode: encrypt(guess),
        },
      });

      if (result) gameKeyRef.current = result.key;
      return result;
    },
    [fetchPatch],
  );

  const modifiedEnter = useCallback(async () => {
    if (gameStatusRef.current === WordleStatus.Standby) return;

    if (
      gameStatusRef.current === WordleStatus.Answered ||
      gameStatusRef.current === WordleStatus.Completed
    ) {
      if (isUpdatingRef.current) {
        pendingNewGameRef.current = true;
      } else {
        onPlay();
      }
      return;
    }

    onEnter();

    if (currentGuessRef.current.length < WORD_LENGTH) return;
    if (!WORD_LIST.includes(currentGuessRef.current)) return;

    isUpdatingRef.current = true;
    const result = await updateGame(currentGuessRef.current);
    isUpdatingRef.current = false;

    if (!result) {
      pendingNewGameRef.current = false;
      onNetworkError();
      return;
    }

    if (result.stats) setStats(result.stats);
    if (result.cashDelta && user)
      setStateUser({ ...user, cash: user.cash + result.cashDelta });

    if (pendingNewGameRef.current) {
      pendingNewGameRef.current = false;
      onPlay();
    }
  }, [onEnter, onNetworkError, onPlay, setStateUser, updateGame, user]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const { key } = event;

      if (key === 'Enter') {
        event.preventDefault();
        modifiedEnter();
      } else if (key === 'Backspace') {
        event.preventDefault();
        onDelete();
      } else if (/^[a-zA-Z]$/.test(key)) {
        event.preventDefault();
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
    setIsGameReady(false);
    (async () => {
      const success = await getGame();
      if (!success) {
        onReset();
        setPage(GamePage.Overview);
      }
    })();
  }, [answer, getGame, onReset]);

  const handleBack = useCallback(() => {
    pendingNewGameRef.current = false;
    onReset();
    setPage(GamePage.Overview);
  }, [onReset]);

  if (isUserFetched && (!user || !user?.discord_id)) redirect('/dashboard');

  const guessesArray = useMemo<WordleGuess[]>(() => {
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
        ? [{ word: currentGuess, result: initialGuessResult }]
        : [];

    return [...guesses, ...currentGuessArray, ...fillArray];
  }, [currentGuess, guesses]);

  return (
    <div className={styles.wordle}>
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
