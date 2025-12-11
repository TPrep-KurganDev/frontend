import styles from './RandomQuestionsModal.module.scss';
import { useState } from 'react';

type RandomQuestionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (count: number) => void;
  maxQuestions: number;
}

export function RandomQuestionsModal({
  isOpen,
  onClose,
  onConfirm,
  maxQuestions
}: RandomQuestionsModalProps) {
  const [questionCount, setQuestionCount] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (maxQuestions === 0) {
      onClose();
      setQuestionCount('');
      return;
    }
    const inputValue = questionCount.trim();
    const count = Math.max(1, Math.min(parseInt(inputValue), Math.min(maxQuestions, 9999)));
    onConfirm(count);
    onClose();
    setQuestionCount('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      const numValue = parseInt(value);
      const maxAllowed = Math.min(maxQuestions, 9999);
      if (numValue > maxAllowed) {
        value = maxAllowed.toString();
      }
    }
    setQuestionCount(value);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>Количество вопросов</div>
        <input
          type="text"
          inputMode="numeric"
          className={styles.input}
          value={questionCount}
          onChange={handleInputChange}
          placeholder="0"
          maxLength={4}
        />
        <div className={styles.button} onClick={handleConfirm}>
          Продолжить
        </div>
      </div>
    </div>
  );
}
