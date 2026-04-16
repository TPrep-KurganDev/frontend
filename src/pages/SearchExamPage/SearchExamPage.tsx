import Header from '../../components/Header/Header';
import styles from './SearchExamPage.module.scss';
import React, {useState} from 'react';
import {ExamOut} from '../../api/exam.ts';
import {ExamListItem} from '../../components/ExamListItem/ExamListItem.tsx';
import {useNavigate} from 'react-router-dom';


export const SearchExamPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [exams] = useState<ExamOut[]>([
    {
      id: 'test-1',
      title: 'Основы композиции и света',
      scope: 'beginner',
      creator_id: 'user-101',
      created_at: new Date().toISOString(),
    },
    {
      id: 'test-2',
      title: 'Продвинутая ретушь в Photoshop',
      scope: 'advanced',
      creator_id: 'user-102',
      created_at: new Date().toISOString(),
    }
  ])
  const [authorNames] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  return (
    <>
      <Header title={'Поиск тестов'} inputDisabled={true} inputRef={undefined} onInputBlur={() => {}} onTitleChange={()=>{}} backButtonPage={'/'}/>
      <div className={styles.search}>
        <img src='search2.svg'/>
        <input
          type="text"
          placeholder="Введите название теста"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <div className={styles.examList}>
        {exams.map((exam) => (
          <ExamListItem
            key={exam.id}
            exam={exam}
            authorNames={authorNames}
            isFavorites={true}
            navigate={navigate}
          />
        ))}
      </div>
    </>
  )
}
