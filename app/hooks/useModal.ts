import { useCallback, useState } from 'react';

export const useModal = <T extends string>() => {
  const [modalType, setModalType] = useState<T | null>(null);

  const openModal = useCallback((type: T) => {
    setModalType(type);
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
  }, []);

  return { modalType, openModal, closeModal };
};
