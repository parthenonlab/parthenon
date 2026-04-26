import { INITIAL_BLACKJACK } from '@/constants/stats';
import { BlackjackStats } from '@parthenonlab/types';

import styles from '../styles/stats.module.scss';

export const Stats = ({
  data = INITIAL_BLACKJACK,
}: {
  data?: BlackjackStats;
}) => {
  return (
    <div className={styles.stats}>
      <div className={styles.statsBox}>
        <h3>STATS</h3>
        <p>Total Blackjacks: {data.totalBlackjack}</p>
        <p>Total Wins: {data.totalWon}</p>
        <p>Total Times Played: {data.totalPlays}</p>
      </div>
    </div>
  );
};
