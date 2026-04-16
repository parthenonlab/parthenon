import { useCallback, useEffect, useRef, useState } from 'react';
import { useParthenon } from '@/hooks';

import { GAME_OVER_STATUS_BLK } from '@/constants/cards';
import { BlackjackStatus, CardSize } from '@/enums/games';
import { PlayCard } from '@/interfaces/games';

import { getHandValue } from '@/lib/utils/cards';

import { Balance } from './balance';
import { CardBox } from './card';

import styles from '../styles/game.module.scss';

const CARD_DURATION = 750;
const CARD_STAGGER = 750;

export const GameTable = ({
  bet,
  cash,
  deckSize,
  dealerHand,
  double,
  getGame,
  playerHand,
  status,
  onBetChange,
  onDouble,
  onHit,
  onPlay,
  onStand,
}: {
  bet: number | null;
  cash: number;
  deckSize: number;
  dealerHand: PlayCard[];
  double: boolean;
  getGame: () => Promise<boolean>;
  playerHand: PlayCard[];
  status: BlackjackStatus;
  onBetChange: (bet: number | null) => void;
  onDouble: () => void;
  onHit: () => void;
  onPlay: (bet: number) => void;
  onStand: () => void;
}) => {
  const { setStateUser, user } = useParthenon();

  const [dealerTotal, setDealerTotal] = useState(0);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const prevPlayerLengthRef = useRef(0);
  const prevDealerLengthRef = useRef(0);

  const playerDealStart = prevPlayerLengthRef.current;
  const dealerDealStart = prevDealerLengthRef.current;

  const handleStand = useCallback(() => {
    onStand();
  }, [onStand]);

  const handleReset = useCallback(async () => {
    if (!user || !bet) return;
    prevPlayerLengthRef.current = 0;
    prevDealerLengthRef.current = 0;
    setGameKey(k => k + 1);
    setDealerTotal(0);
    setPlayerTotal(0);
    const success = await getGame();
    if (!success) return;
    onPlay(bet);
    setStateUser({ ...user, cash: user.cash - bet });
  }, [bet, getGame, onPlay, setStateUser, user]);

  useEffect(() => {
    if (status !== BlackjackStatus.WinPending) return;
    const timer = setTimeout(handleStand, 1000);
    return () => clearTimeout(timer);
  }, [handleStand, status]);

  // Update score totals after the last new card finishes animating.
  // Refs are updated inside the timeout (not a separate effect) so that the
  // re-render triggered by setIsAnimating(true) still reads the old lengths
  // and keeps the animation classes in place.
  useEffect(() => {
    if (!playerHand.length && !dealerHand.length) return;

    const initialDeal =
      dealerDealStart === 0 &&
      playerDealStart === 0 &&
      dealerHand.length > 0 &&
      playerHand.length > 0 &&
      !double;

    const lastNewDealerOrder = Math.max(
      dealerHand.length - dealerDealStart - 1,
      0,
    );
    const lastNewPlayerRawOrder = Math.max(
      playerHand.length - playerDealStart - 1,
      0,
    );
    const lastNewPlayerOrder = initialDeal
      ? lastNewPlayerRawOrder + 1
      : lastNewPlayerRawOrder;
    const lastNewOrder = Math.max(lastNewDealerOrder, lastNewPlayerOrder);
    const animDelay = lastNewOrder * CARD_STAGGER + CARD_DURATION + 100;

    setIsAnimating(true);

    const nextPlayerLength = playerHand.length;
    const nextDealerLength = dealerHand.length;

    const timer = setTimeout(() => {
      prevPlayerLengthRef.current = nextPlayerLength;
      prevDealerLengthRef.current = nextDealerLength;
      setDealerTotal(getHandValue(dealerHand));
      setPlayerTotal(getHandValue(playerHand));
      setIsAnimating(false);
    }, animDelay);

    return () => clearTimeout(timer);
  }, [playerHand, dealerHand]); // eslint-disable-line react-hooks/exhaustive-deps

  const isGameOver = GAME_OVER_STATUS_BLK.includes(status);

  const initialDeal =
    dealerDealStart === 0 &&
    playerDealStart === 0 &&
    dealerHand.length > 0 &&
    playerHand.length > 0 &&
    !double;

  return (
    <div className={styles.game}>
      <div className={styles.board}>
        <p className={styles.deck}>Deck: {deckSize}</p>
        <div className={styles.dealer}>
          <div className={styles.info}>
            <p className={styles.name}>DEALER</p>
            <p className={styles.value}>{dealerTotal || ''}</p>
          </div>
          <div className={styles.cards}>
            {dealerHand.map((card, i) => {
              let size = card.size;

              if (dealerHand.length === 5) size = CardSize.Medium;
              else if (dealerHand.length === 6) size = CardSize.Small;
              else if (dealerHand.length > 6) size = CardSize.XSmall;

              const order =
                i >= dealerDealStart ? i - dealerDealStart : undefined;

              return (
                <CardBox
                  key={`${gameKey}-${i}`}
                  order={order}
                  animate={order !== undefined ? 'down' : undefined}
                  size={size}
                  suit={card.suit}
                  rank={card.rank}
                />
              );
            })}
          </div>
        </div>
        <div className={isGameOver ? styles.result : styles.actions}>
          {!isGameOver &&
            !isAnimating &&
            status !== BlackjackStatus.WinPending && (
              <>
                <button disabled={!bet || bet > cash} onClick={onDouble}>
                  DOUBLE
                </button>
                <button onClick={onHit}>HIT</button>
                <button onClick={handleStand}>STAND</button>
              </>
            )}
          {isGameOver && !isAnimating && (
            <div>
              <p className={styles.resultLabel}>{status}</p>
              <button disabled={!bet || bet > cash} onClick={handleReset}>
                PLAY AGAIN
              </button>
            </div>
          )}
        </div>
        <div className={styles.player}>
          <div className={styles.info}>
            <p className={styles.name}>
              {user?.discord_name || user?.twitch_username || 'PLAYER'}
            </p>
            <p className={styles.value}>{playerTotal || ''}</p>
          </div>
          <div className={styles.cards}>
            {playerHand.map((card, i) => {
              let size = card.size;

              if (playerHand.length === 5) size = CardSize.Medium;
              else if (playerHand.length === 6) size = CardSize.Small;
              else if (playerHand.length > 6) size = CardSize.XSmall;

              const rawOrder =
                i >= playerDealStart ? i - playerDealStart : undefined;
              const order =
                rawOrder !== undefined && initialDeal ? rawOrder + 1 : rawOrder;

              return (
                <CardBox
                  key={`${gameKey}-${i}`}
                  order={order}
                  animate={order !== undefined ? 'up' : undefined}
                  size={size}
                  suit={card.suit}
                  rank={card.rank}
                />
              );
            })}
          </div>
        </div>
      </div>
      <Balance
        bet={bet}
        cash={cash}
        disableBet={!isGameOver}
        showCash={!isGameOver || !isAnimating}
        onUpdate={onBetChange}
      />
    </div>
  );
};
