export enum WordleKeyStatus {
  Absent = 'absent', //   Key does not exist
  Correct = 'correct', // Key exists in the right position
  Default = 'default', // No key submitted
  Present = 'present', // Key exists in the wrong position
}

export enum WordleStatus {
  Standby,
  Answered,
  Completed,
  Playing,
  InvalidGuess,
  InvalidWord,
  NetworkError,
}
