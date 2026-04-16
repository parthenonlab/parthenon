import { KEY_LIST } from '@/constants/wordle';
import { WordleKeyStatus } from '@/enums/games';
import { BackspaceIcon } from '@/images/icons';

import styles from '../styles/keyboard.module.scss';

interface KeyboardProps {
  keyResults: { [letter: string]: WordleKeyStatus };
  onDelete: () => void;
  onEnter: () => void;
  onKey: (key: string) => void;
}

export const Keyboard = ({
  keyResults,
  onDelete,
  onEnter,
  onKey,
}: KeyboardProps) => {
  const renderKey = (letter: string) => {
    const isBackspace = letter === 'Backspace';
    const isEnter = letter === 'Enter';

    const keyResult = keyResults[letter] || 'none';

    const styleClass = isBackspace
      ? `${styles.backspace} ${styles[keyResult]}`
      : isEnter
        ? `${styles.enter} ${styles[keyResult]}`
        : styles[keyResult];

    const handleKeyClick = () => {
      if (isBackspace) onDelete();
      else if (isEnter) onEnter();
      else onKey(letter);
    };

    return (
      <button key={letter} className={styleClass} onClick={handleKeyClick}>
        {isBackspace ? <BackspaceIcon /> : letter}
      </button>
    );
  };

  return (
    <div className={styles.container}>
      {KEY_LIST.map((row, i) => (
        <div className={styles.row} key={i}>
          {row.map(id => renderKey(id))}
        </div>
      ))}
    </div>
  );
};
