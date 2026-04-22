import Header from '../../components/Header/Header';
import styles from './SearchExamPage.module.scss';
import React, { useState, useRef, useEffect } from 'react';
import {ExamOut, searchExams} from '../../api/exam.ts';
import { ExamListItem } from '../../components/ExamListItem/ExamListItem.tsx';
import { useNavigate } from 'react-router-dom';
import {getUserById} from "../../api/users.ts";

export const SearchExamPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [exams, setExams] = useState<ExamOut[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setSearchText(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (value != ''){
        searchExams(value).then((res) => {
          setExams(res)
        })
      }
      else {
        setExams([])
      }
    }, 400);
  };

  useEffect(() => {
    const fetchAuthorNames = async () => {
      const creatorIds = [...new Set(exams.map((exam) => exam.creator_id))];
      const fetchedNames: Record<string, string> = {};
      const results = await Promise.allSettled(creatorIds.map((creatorId) => getUserById(creatorId)));

      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') {
          return;
        }

        const creatorId = creatorIds[index];
        fetchedNames[creatorId!] = result.value.user_name;
      });

      setAuthorNames(fetchedNames);
    };

    if (exams.length > 0) {
      void fetchAuthorNames();
    } else {
      setAuthorNames({});
    }
  }, [exams]);

  return (
    <>
      <Header
        title={'Поиск тестов'}
        inputDisabled={true}
        inputRef={undefined}
        onInputBlur={() => {}}
        onTitleChange={() => {}}
        backButtonPage={'/'}
      />
      <div className={styles.search}>
        <img src='search2.svg' alt="search" />
        <input
          type="text"
          placeholder="Введите название теста"
          value={searchText}
          onChange={handleSearchChange}
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
  );
};
