import { SilverIcon } from '@/images/icons';
import { formatNumberToString } from '@/lib/utils';
import styles from '../styles/balance.module.scss';

export const Balance = ({
  bet,
  cash,
  disableBet = false,
  showCash = true,
  onUpdate,
}: {
  bet: number | null;
  cash: number;
  disableBet?: boolean;
  showCash?: boolean;
  onUpdate: Function;
}) => {
  const betValue = !bet || bet < 1 ? '' : bet;

  const balanceClass = showCash
    ? styles.balanceBox
    : `${styles.balanceBox} ${styles.hidden}`;

  return (
    <div className={styles.balance}>
      <div className={styles.betBox}>
        <span>{disableBet ? 'BET:' : 'ENTER BET:'}</span>
        <input
          disabled={disableBet}
          max={cash}
          min={1}
          onChange={e => {
            if (e.target.value === '') return onUpdate(null);

            const newBet = parseInt(e.target.value, 10);

            if (isNaN(newBet)) return onUpdate(null);
            else if (newBet > 0) onUpdate(newBet);
          }}
          type="number"
          value={betValue}
        />
      </div>

      <div className={balanceClass}>
        <span>CASH BALANCE:</span>
        <span className={styles.cash}>{formatNumberToString(cash)}</span>
        <SilverIcon />
      </div>
    </div>
  );
};
