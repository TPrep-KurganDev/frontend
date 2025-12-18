import React, { ChangeEvent, useRef, useState } from 'react';
import styles from './FileUpload.module.scss';
import {uploadCardsFile} from '../../api/exam.ts';
import {useNavigate} from "react-router-dom";

interface FileUploadProps {
  exam_id: string;
}


export const FileUpload: React.FC<FileUploadProps> = ({ exam_id: examId }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(file);

    // const formData = new FormData();
    // formData.append('file', file);

    setLoading(true);
    try {
      await uploadCardsFile(Number(examId), file);
      navigate(`/exam?examId=${examId}`)
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className={styles.buttonContainer}>
      <button className={styles.yellowButton} onClick={openFileDialog} disabled={loading}>
        {loading ? 'Загрузка...' : 'Выбрать файл'}
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
