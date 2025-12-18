import React, {useEffect, useState} from 'react';
import styles from './FileUploadScreen.module.scss';
import Header from '../../components/Header/Header.tsx';
import {FileUpload} from '../../components/FileUpload/FileUpload.tsx';
import {useSearchParams} from 'react-router-dom';

export const FileUploadScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [examId, setExamId] = useState('');

  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (!examIdParam) return;

    setExamId(examIdParam);
  }, [searchParams])

  return (
    <>
      <Header title={'Загрузка файла'} inputDisabled={true} inputRef={undefined} onInputBlur={() => {}}
              onTitleChange={() => {}} backButtonPage={`/exam?examId=${examId}`}/>
      <h1 className={styles.title}>Формат</h1>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Простые текстовые файлы (.txt, .log, .md)</h2>
        <p className={styles.cardText}>
          Одна строка — одна карточка. Вопрос и ответ внутри карточки
          разделяются вертикальной чертой (|)
        </p>
        <div className={styles.example}>
          <p>Вопрос 1 | Ответ 1</p>
          <p>Вопрос 2 | Ответ 2</p>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Табличные файлы (.csv, .xlsx)</h2>
        <p className={styles.cardText}>
          Каждая строка в файле представляет одну карточку
        </p>

        <table className={styles.table}>
          <thead>
          <tr>
            <th>Столбец 1</th>
            <th>Столбец 2</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>Вопрос 1</td>
            <td>Ответ 1</td>
          </tr>
          <tr>
            <td>Вопрос 2</td>
            <td>Ответ 2</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Документы Word (.docx)</h2>
        <p className={styles.cardText}>
          Каждый абзац в документе представляет одну карточку.
          Вопрос и ответ внутри абзаца разделяются вертикальной чертой (|)
        </p>
        <div className={styles.example}>
          <p>вопрос 1 | ответ 1</p>
          <p>вопрос 2 | ответ 2</p>
        </div>
      </div>

      {/*<button className={styles.yellowButton}>Выбрать файл</button>*/}
      <FileUpload exam_id={examId}/>
    </>
  )
}
