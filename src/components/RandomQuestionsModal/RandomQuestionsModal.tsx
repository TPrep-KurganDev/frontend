import styles from './RandomQuestionsModal.module.scss';
import {useEffect, useMemo, useState} from 'react';

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
  const [validationMessage, setValidationMessage] = useState('');

  const maxAllowed = useMemo(() => Math.min(maxQuestions, 9999), [maxQuestions]);

  useEffect(() => {
    if (!isOpen) {
      setQuestionCount('');
      setValidationMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (maxQuestions === 0) {
      onClose();
      setQuestionCount('');
      return;
    }

    const inputValue = questionCount.trim();
    const parsedCount = Number.parseInt(inputValue, 10);

    if (!Number.isFinite(parsedCount) || parsedCount < 1) {
      setValidationMessage(`Введите число от 1 до ${maxAllowed}`);
      return;
    }

    const count = Math.min(parsedCount, maxAllowed);

    setValidationMessage('');
    onConfirm(count);
    onClose();
    setQuestionCount('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      const numValue = parseInt(value);
      if (numValue > maxAllowed) {
        value = maxAllowed.toString();
      }
    }

    setValidationMessage('');
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
        {validationMessage && <div className={styles.validationMessage}>{validationMessage}</div>}
        <div className={styles.button} onClick={handleConfirm}>
          Продолжить
        </div>
      </div>
    </div>
  );
}
