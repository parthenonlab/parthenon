export enum BlackjackStatus {
  Blackjack = 'BLACKJACK',
  Bust = 'BUST',
  DealerBust = 'DEALER BUST',
  Lose = 'LOSE',
  Playing = 'PLAYING',
  Push = 'PUSH',
  Standby = 'STANDBY',
  Win = 'WIN',
  WinPending = 'WIN PENDING',
}

export enum CardSize {
  Large, //  Default
  Medium, // Size for 5 cards
  Small, //  Size for 6 cards
  XSmall, // Size for 7 cards
}
