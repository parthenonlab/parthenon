import { useEffect } from 'react';

import { WordleStatus } from '@/enums/games';
import { SilverIcon } from '@/images/icons';

import styles from '../styles/notice.module.scss';

interface NoticeProps {
  answer: string;
  currentGuess: string;
  status: WordleStatus;
  reward: number | null;
  onResume: () => void;
}

export const Notice = ({
  answer,
  currentGuess,
  status,
  reward,
  onResume,
}: NoticeProps) => {
  useEffect(() => {
    if (
      status === WordleStatus.InvalidGuess ||
      status === WordleStatus.InvalidWord ||
      status === WordleStatus.NetworkError
    ) {
      const timer = setTimeout(onResume, 750);
      return () => clearTimeout(timer);
    }
  }, [status, onResume]);

  return (
    <div className={styles.container}>
      {status === WordleStatus.Answered && (
        <p className={styles.note}>
          Congrats!{' '}
          {reward && (
            <>
              Reward: <span className={styles.reward}>{reward}</span>
              <span className={styles.coin}>
                <SilverIcon />
              </span>
            </>
          )}{' '}
          Press ENTER to play again.
        </p>
      )}
      {status === WordleStatus.Completed && (
        <p className={styles.note}>
          Answer: <span className={styles.answer}>{answer}</span>. Press ENTER
          to play again.
        </p>
      )}
      {status === WordleStatus.InvalidGuess && (
        <p className={`${styles.note} ${styles.noteFade}`}>
          <span className={styles.answer}>{currentGuess}</span>
          <span>does not have enough letters.</span>
        </p>
      )}
      {status === WordleStatus.InvalidWord && (
        <p className={`${styles.note} ${styles.noteFade}`}>
          <span className={styles.answer}>{currentGuess}</span>
          <span>is not in the dictionary.</span>
        </p>
      )}
      {status === WordleStatus.NetworkError && (
        <p className={`${styles.note} ${styles.noteFade}`}>
          <span>Could not sync guess. Check your connection.</span>
        </p>
      )}
    </div>
  );
};
