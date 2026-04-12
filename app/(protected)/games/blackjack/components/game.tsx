import { useCallback, useEffect, useState } from 'react';
import { useParthenon } from '@/hooks';

import { GAME_OVER_STATUS_BLK } from '@/constants/cards';
import { BlackjackAnimation, BlackjackStatus, CardSize } from '@/enums/games';
import { PlayCard } from '@/interfaces/games';

import { delay } from '@/lib/utils';
import { getHandValue } from '@/lib/utils/cards';

import { Balance } from './balance';
import { CardBox } from './card';

import styles from '../styles/game.module.scss';

export const GameTable = ({
  bet,
  cash,
  deckSize,
  dealerLastHand,
  dealerHand,
  double,
  getGame,
  playerLastHand,
  playerHand,
  status,
  setDealerLastHand,
  setPlayerLastHand,
  onBetChange,
  onDouble,
  onHit,
  onPlay,
  onStand,
}: {
  bet: number | null;
  cash: number;
  deckSize: number;
  dealerLastHand: PlayCard[];
  dealerHand: PlayCard[];
  double: boolean;
  getGame: () => void;
  playerLastHand: PlayCard[];
  playerHand: PlayCard[];
  status: BlackjackStatus;
  setDealerLastHand: (hand: PlayCard[]) => void;
  setPlayerLastHand: (hand: PlayCard[]) => void;
  onBetChange: (bet: number | null) => void;
  onDouble: () => void;
  onHit: () => void;
  onPlay: (bet: number) => void;
  onStand: () => void;
}) => {
  const { setStateUser, user } = useParthenon();

  const [dealerTotal, setDealerTotal] = useState(0);
  const [playerTotal, setPlayerTotal] = useState(0);

  const [animation, setAnimation] = useState(BlackjackAnimation.Done);

  const handleDouble = useCallback(() => {
    setAnimation(BlackjackAnimation.Standby);
    onDouble();
  }, [onDouble]);

  const handleHit = useCallback(() => {
    setAnimation(BlackjackAnimation.Standby);
    onHit();
  }, [onHit]);

  const handleStand = useCallback(() => {
    setAnimation(BlackjackAnimation.Standby);
    onStand();
  }, [onStand]);

  const handleReset = useCallback(async () => {
    if (user && bet) {
      setAnimation(BlackjackAnimation.Standby);
      setDealerTotal(0);
      setPlayerTotal(0);
      setDealerLastHand([]);
      setPlayerLastHand([]);
      getGame();
      onPlay(bet);
      setStateUser({
        ...user,
        cash: user.cash - bet,
      });
    }
  }, [
    bet,
    getGame,
    onPlay,
    setStateUser,
    setAnimation,
    setDealerLastHand,
    setPlayerLastHand,
    user,
  ]);

  const animateCards = useCallback(
    async (hand: string, cards: PlayCard[]) => {
      let currentHand = [...playerLastHand];
      if (hand === 'dealer') currentHand = [...dealerLastHand];

      for (const card of cards) {
        await delay(500);

        currentHand.push(card);
        const updatedTotal = getHandValue(currentHand);

        if (hand === 'dealer') setDealerTotal(updatedTotal);
        else setPlayerTotal(updatedTotal);
      }
    },
    [dealerLastHand, playerLastHand],
  );

  useEffect(() => {
    if (status !== BlackjackStatus.WinPending) return;

    const forceStand = async () => {
      await delay(1000);
      handleStand();
    };

    forceStand();
  }, [handleStand, status]);

  useEffect(() => {
    const dealerDelta = dealerHand.length !== dealerLastHand.length;
    const playerDelta = playerHand.length !== playerLastHand.length;

    if (animation === BlackjackAnimation.Ongoing) return;
    if (!dealerDelta && !playerDelta) return;

    const dealCards = async () => {
      if (double) {
        await animateCards('player', playerHand.slice(playerLastHand.length));
        await animateCards('dealer', dealerHand.slice(dealerLastHand.length));

        setPlayerLastHand(playerHand);
        setDealerLastHand(dealerHand);
      } else {
        if (dealerDelta) {
          await animateCards('dealer', dealerHand.slice(dealerLastHand.length));

          if (playerDelta) {
            await animateCards(
              'player',
              playerHand.slice(playerLastHand.length),
            );
            setPlayerLastHand(playerHand);
          }

          setDealerLastHand(dealerHand);
        } else if (playerDelta) {
          await animateCards('player', playerHand.slice(playerLastHand.length));
          setPlayerLastHand(playerHand);
        }
      }

      setAnimation(BlackjackAnimation.Done);
    };

    setAnimation(BlackjackAnimation.Ongoing);
    dealCards();
  }, [
    animation,
    animateCards,
    dealerHand,
    dealerLastHand.length,
    double,
    playerHand,
    playerLastHand.length,
    setAnimation,
    setDealerLastHand,
    setPlayerLastHand,
  ]);

  const isGameOver = GAME_OVER_STATUS_BLK.includes(status);

  const toAnimateDealer: number[] = [];
  const toAnimatePlayer: number[] = [];

  dealerHand.forEach((_card, i) => {
    if (!dealerLastHand[i]) toAnimateDealer.push(i);
  });

  playerHand.forEach((_card, i) => {
    if (!playerLastHand[i]) toAnimatePlayer.push(i);
  });

  const initialDeal =
    toAnimateDealer.length > 0 && toAnimatePlayer.length > 0 && !double;

  return (
    <div className={styles.game}>
      <div className={styles.board}>
        <p className={styles.deck}>Deck: {deckSize}</p>
        <div className={styles.dealer}>
          <div className={styles.info}>
            <p className={styles.name}>DEALER</p>
            <p className={styles.value}>{dealerTotal}</p>
          </div>
          <div className={styles.cards}>
            {dealerHand.map((card, i) => {
              let size = card.size;

              if (dealerHand.length === 5) size = CardSize.Medium;
              else if (dealerHand.length === 6) size = CardSize.Small;
              else if (dealerHand.length > 6) size = CardSize.XSmall;

              return (
                <CardBox
                  key={i}
                  order={toAnimateDealer.indexOf(i)}
                  animate="down"
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
            animation === BlackjackAnimation.Done &&
            status !== BlackjackStatus.WinPending && (
              <>
                <button disabled={!bet || bet > cash} onClick={handleDouble}>
                  DOUBLE
                </button>
                <button onClick={handleHit}>HIT</button>
                <button onClick={handleStand}>STAND</button>
              </>
            )}
          {isGameOver && animation === BlackjackAnimation.Done && (
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
            <p className={styles.value}>{playerTotal}</p>
          </div>
          <div className={styles.cards}>
            {playerHand.map((card, i) => {
              let size = card.size;

              if (playerHand.length === 5) size = CardSize.Medium;
              else if (playerHand.length === 6) size = CardSize.Small;
              else if (playerHand.length > 6) size = CardSize.XSmall;

              const order = toAnimatePlayer.indexOf(i);
              const updatedOrder =
                order > -1 && initialDeal ? order + 1 : order;

              return (
                <CardBox
                  key={i}
                  order={updatedOrder}
                  animate="up"
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
        showCash={
          !isGameOver ||
          (isGameOver && animation !== BlackjackAnimation.Ongoing)
        }
        onUpdate={onBetChange}
      />
    </div>
  );
};
