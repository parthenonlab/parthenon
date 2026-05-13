import { useCallback, useEffect, useRef, useState } from 'react';
import { useParthenon } from '@/hooks';

import { GAME_OVER_STATUS_BLK } from '@/constants/cards';
import { BlackjackStatus, CardSize } from '@/enums/games';
import { PlayCard } from '@/interfaces/games';

import { getHandValue } from '@/lib/utils/cards';

import { Balance } from './balance';
import { CardBox } from './card';

import styles from '../styles/game.module.scss';

const CARD_DURATION = 650;
const CARD_STAGGER = 650;

const getCardSize = (handLength: number, baseSize: CardSize): CardSize => {
  if (handLength === 5) return CardSize.Medium;
  if (handLength === 6) return CardSize.Small;
  if (handLength > 6) return CardSize.XSmall;
  return baseSize;
};

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
  getGame: (skipLoading?: boolean) => Promise<boolean>;
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
  const [displayedDeckSize, setDisplayedDeckSize] = useState(deckSize);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const prevPlayerLengthRef = useRef(0);
  const prevDealerLengthRef = useRef(0);

  const playerDealStart = prevPlayerLengthRef.current;
  const dealerDealStart = prevDealerLengthRef.current;

  const handleReset = useCallback(async () => {
    if (!user || !bet) return;

    setDealerTotal(0);
    setPlayerTotal(0);
    setIsResetting(true);

    const success = await getGame(true);

    if (!success) {
      setIsResetting(false);
      return;
    }

    prevPlayerLengthRef.current = 0;
    prevDealerLengthRef.current = 0;
    setIsResetting(false);
    setGameKey(k => k + 1);
    onPlay(bet);
    setStateUser({ ...user, cash: user.cash - bet });
  }, [bet, getGame, onPlay, setStateUser, user]);

  useEffect(() => {
    if (status !== BlackjackStatus.WinPending) return;
    const timer = setTimeout(onStand, 1000);
    return () => clearTimeout(timer);
  }, [onStand, status]);

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

    const newDealerCount = dealerHand.length - dealerDealStart;
    const newPlayerCount = playerHand.length - playerDealStart;
    const lastNewDealerOrder = Math.max(newDealerCount - 1, 0);
    const lastNewPlayerOrder = Math.max(
      initialDeal ? newPlayerCount : newPlayerCount - 1,
      0,
    );
    const lastNewOrder = Math.max(lastNewDealerOrder, lastNewPlayerOrder);
    const animDelay = lastNewOrder * CARD_STAGGER + CARD_DURATION + 100;

    setIsAnimating(true);
    setDisplayedDeckSize(deckSize + newDealerCount + newPlayerCount);

    const cardTimers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < newDealerCount; i++) {
      cardTimers.push(
        setTimeout(() => setDisplayedDeckSize(prev => prev - 1), i * CARD_STAGGER),
      );
    }
    for (let i = 0; i < newPlayerCount; i++) {
      const order = initialDeal ? i + 1 : i;
      cardTimers.push(
        setTimeout(() => setDisplayedDeckSize(prev => prev - 1), order * CARD_STAGGER),
      );
    }

    const nextPlayerLength = playerHand.length;
    const nextDealerLength = dealerHand.length;

    const timer = setTimeout(() => {
      prevPlayerLengthRef.current = nextPlayerLength;
      prevDealerLengthRef.current = nextDealerLength;
      setDealerTotal(getHandValue(dealerHand));
      setPlayerTotal(getHandValue(playerHand));
      setDisplayedDeckSize(deckSize);
      setIsAnimating(false);
    }, animDelay);

    return () => {
      clearTimeout(timer);
      cardTimers.forEach(clearTimeout);
    };
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
        <p className={styles.deck}>Deck: {displayedDeckSize}</p>
        <div className={styles.dealer}>
          <div className={styles.info}>
            <p className={styles.name}>DEALER</p>
            <p className={styles.value}>{dealerTotal}</p>
          </div>
          <div className={styles.cards}>
            {dealerHand.map((card, i) => {
              const order = i >= dealerDealStart ? i - dealerDealStart : undefined;
              return (
                <CardBox
                  key={`${gameKey}-${i}`}
                  order={order}
                  animate={order !== undefined ? 'down' : undefined}
                  size={getCardSize(dealerHand.length, card.size)}
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
                <button onClick={onStand}>STAND</button>
              </>
            )}
          {isGameOver && !isAnimating && (
            <div>
              <p className={styles.resultLabel}>{status}</p>
              <button
                disabled={!bet || bet > cash || isResetting}
                onClick={handleReset}>
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
            <p className={styles.value}>{playerTotal}</p>
          </div>
          <div className={styles.cards}>
            {playerHand.map((card, i) => {
              const rawOrder =
                i >= playerDealStart ? i - playerDealStart : undefined;
              const order =
                rawOrder !== undefined && initialDeal ? rawOrder + 1 : rawOrder;
              return (
                <CardBox
                  key={`${gameKey}-${i}`}
                  order={order}
                  animate={order !== undefined ? 'up' : undefined}
                  size={getCardSize(playerHand.length, card.size)}
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
