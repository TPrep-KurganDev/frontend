import React, { ChangeEvent, useRef, useState } from 'react';
import styles from './FileUpload.module.scss';
import {uploadCardsFile} from '../../api/exam.ts';
import {useNavigate} from 'react-router-dom';
import {useNetworkStatus} from '../../hooks/useNetworkStatus';
import {notifyOnlineOnly} from '../../utils/notifyOnlineOnly';
import {buildExamPath} from '../../utils/backNavigation';

interface FileUploadProps {
  exam_id: string;
  backPage?: string | null;
}


export const FileUpload: React.FC<FileUploadProps> = ({ exam_id: examId, backPage }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();

  const openFileDialog = () => {
    if (!isOnline) {
      notifyOnlineOnly();
      return;
    }
    inputRef.current?.click();
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // const formData = new FormData();
    // formData.append('file', file);

    setLoading(true);
    try {
      await uploadCardsFile(Number(examId), file);
      navigate(backPage ?? buildExamPath(examId))
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={styles.buttonContainer}>
      <button className={styles.yellowButton} onClick={openFileDialog} disabled={loading || !isOnline}>
        {loading ? 'Загрузка...' : isOnline ? 'Выбрать файл' : 'Только онлайн'}
      </button>

      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        hidden
        accept=".txt,.csv,.xlsx,.docx"
      />
    </div>
  );
};
