import { WordleKeyStatus, WordleStatus } from '@/enums/games';
import { WordleState } from '@/interfaces/games';
import { wordleReducer } from '@/lib/reducers/wordle';

jest.mock('@/constants/wordle', () => ({
  ANSWER_LIST: ['crane', 'brain'],
  INITIAL_STATE_WDL: {
    answer: '',
    currentGuess: '',
    guesses: [],
    keyResults: {},
    reward: null,
    status: WordleStatus.Standby,
  },
  MAX_ATTEMPTS: 6,
  WORD_LENGTH: 5,
  WORD_LIST: ['crane', 'brain', 'slate', 'light', 'chair', 'grape'],
  WORDLE_REWARDS: [10000, 1000, 500, 250, 100, 50],
}));

const playingState = (answer: string, overrides: Partial<WordleState> = {}): WordleState => ({
  answer,
  currentGuess: '',
  guesses: [],
  keyResults: {},
  reward: null,
  status: WordleStatus.Playing,
  ...overrides,
});

describe('key', () => {
  it('appends a letter to the current guess', () => {
    const state = wordleReducer(playingState('crane'), { type: 'key', letter: 'c' });
    expect(state.currentGuess).toBe('c');
  });

  it('does not append past WORD_LENGTH', () => {
    const state = playingState('crane', { currentGuess: 'crane' });
    const result = wordleReducer(state, { type: 'key', letter: 'x' });
    expect(result.currentGuess).toBe('crane');
  });

  it('does not append when game is over', () => {
    const state = playingState('crane', { status: WordleStatus.Answered });
    const result = wordleReducer(state, { type: 'key', letter: 'c' });
    expect(result.currentGuess).toBe('');
  });

  it('does not append when status is Standby', () => {
    const state = playingState('crane', { status: WordleStatus.Standby });
    const result = wordleReducer(state, { type: 'key', letter: 'c' });
    expect(result.currentGuess).toBe('');
  });
});

describe('delete', () => {
  it('removes the last letter from the current guess', () => {
    const state = playingState('crane', { currentGuess: 'cra' });
    expect(wordleReducer(state, { type: 'delete' }).currentGuess).toBe('cr');
  });

  it('does nothing when the guess is empty', () => {
    const state = playingState('crane', { currentGuess: '' });
    expect(wordleReducer(state, { type: 'delete' }).currentGuess).toBe('');
  });

  it('does nothing when game is over', () => {
    const state = playingState('crane', { status: WordleStatus.Answered, currentGuess: 'cran' });
    expect(wordleReducer(state, { type: 'delete' }).currentGuess).toBe('cran');
  });
});

describe('enter', () => {
  it('returns InvalidGuess when current guess is shorter than WORD_LENGTH', () => {
    const state = playingState('crane', { currentGuess: 'cra' });
    expect(wordleReducer(state, { type: 'enter' }).status).toBe(WordleStatus.InvalidGuess);
  });

  it('returns InvalidWord when guess is not in the word list', () => {
    const state = playingState('crane', { currentGuess: 'zzzzz' });
    expect(wordleReducer(state, { type: 'enter' }).status).toBe(WordleStatus.InvalidWord);
  });

  it('returns Answered and assigns reward when guess matches the answer', () => {
    const state = playingState('crane', { currentGuess: 'crane' });
    const result = wordleReducer(state, { type: 'enter' });
    expect(result.status).toBe(WordleStatus.Answered);
    expect(result.reward).toBe(10000); // first guess reward
  });

  it('assigns reward based on guess number', () => {
    const state = playingState('crane', {
      currentGuess: 'crane',
      guesses: [
        { word: 'brain', result: [] },
        { word: 'slate', result: [] },
      ],
    });
    const result = wordleReducer(state, { type: 'enter' });
    expect(result.reward).toBe(500); // third guess
  });

  it('returns Playing and clears currentGuess on a valid incorrect guess', () => {
    const state = playingState('crane', { currentGuess: 'brain' });
    const result = wordleReducer(state, { type: 'enter' });
    expect(result.status).toBe(WordleStatus.Playing);
    expect(result.currentGuess).toBe('');
  });

  it('appends the guess to the guesses list', () => {
    const state = playingState('crane', { currentGuess: 'brain' });
    const result = wordleReducer(state, { type: 'enter' });
    expect(result.guesses).toHaveLength(1);
    expect(result.guesses[0].word).toBe('brain');
  });

  it('returns Completed when the final attempt is used without winning', () => {
    const state = playingState('crane', {
      currentGuess: 'brain',
      guesses: [
        { word: 'slate', result: [] },
        { word: 'light', result: [] },
        { word: 'chair', result: [] },
        { word: 'grape', result: [] },
        { word: 'slate', result: [] },
      ],
    });
    const result = wordleReducer(state, { type: 'enter' });
    expect(result.status).toBe(WordleStatus.Completed);
    expect(result.reward).toBeNull();
  });
});

describe('enter — letter results', () => {
  it('marks all letters Correct when guess matches the answer exactly', () => {
    const state = playingState('crane', { currentGuess: 'crane' });
    const result = wordleReducer(state, { type: 'enter' });
    expect(result.guesses[0].result).toEqual([
      WordleKeyStatus.Correct,
      WordleKeyStatus.Correct,
      WordleKeyStatus.Correct,
      WordleKeyStatus.Correct,
      WordleKeyStatus.Correct,
    ]);
  });

  it('marks letters Absent when none appear in the answer', () => {
    // 'light' shares no letters with 'crane'
    const state = playingState('crane', { currentGuess: 'light' });
    const result = wordleReducer(state, { type: 'enter' });
    expect(result.guesses[0].result).toEqual([
      WordleKeyStatus.Absent,
      WordleKeyStatus.Absent,
      WordleKeyStatus.Absent,
      WordleKeyStatus.Absent,
      WordleKeyStatus.Absent,
    ]);
  });

  it('marks letters Present when they exist in the answer at a different position', () => {
    // 'brain' vs answer 'crane': r=Correct(1), a=Correct(2), n=Present(3→4), b=Absent, e... wait
    // Let me use a simpler case: answer 'crane', guess 'chair'
    // c(0)=Correct, h(1)=Absent, a(2)=Correct, i(3)=Absent, r(4)=Present (r is in crane at pos 1)
    const state = playingState('crane', { currentGuess: 'chair' });
    const result = wordleReducer(state, { type: 'enter' });
    expect(result.guesses[0].result[0]).toBe(WordleKeyStatus.Correct); // c
    expect(result.guesses[0].result[1]).toBe(WordleKeyStatus.Absent);  // h
    expect(result.guesses[0].result[2]).toBe(WordleKeyStatus.Correct); // a
    expect(result.guesses[0].result[3]).toBe(WordleKeyStatus.Absent);  // i
    expect(result.guesses[0].result[4]).toBe(WordleKeyStatus.Present); // r
  });
});

describe('reset', () => {
  it('resets state to initial values', () => {
    const state = playingState('crane', { currentGuess: 'cra', guesses: [{ word: 'brain', result: [] }] });
    const result = wordleReducer(state, { type: 'reset' });
    expect(result.currentGuess).toBe('');
    expect(result.guesses).toHaveLength(0);
    expect(result.answer).toBe('');
    expect(result.status).toBe(WordleStatus.Standby);
  });
});

describe('resume', () => {
  it('sets status to Playing', () => {
    const state = playingState('crane', { status: WordleStatus.InvalidWord });
    expect(wordleReducer(state, { type: 'resume' }).status).toBe(WordleStatus.Playing);
  });
});
