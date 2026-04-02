import { ReactNode } from 'react';

import { CloseIcon } from '@/images/icons';

import styles from '@/styles/modal.module.scss';

export const Modal = ({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.buttonContainer}>
          <button className={styles.close} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
