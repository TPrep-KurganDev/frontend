import React from 'react';
import styles from '../../pages/ExamListScreen/ExamListScreen.module.scss';
import {buildExamCoverPath} from '../../utils/backNavigation';

interface ExamListItemProps {
  exam: {
    id: string | number;
    title: string;
    creator_id: number | string | null | undefined;
  };
  authorNames: Record<string | number, string>;
  isFavorites: boolean;
  backPage: string;
  navigate: (path: string, options?: { state: Record<string, unknown> }) => void;
}

export const ExamListItem: React.FC<ExamListItemProps> = ({
                                                            exam,
                                                            authorNames,
                                                            isFavorites,
                                                            backPage,
                                                            navigate,
                                                          }) => {
  const handleClick = () => {
    const creatorName = authorNames[exam.creator_id!] ?? '';
    navigate(buildExamCoverPath(exam.id, backPage), {
      state: {
        examTitle: exam.title,
        creatorName,
        creatorId: exam.creator_id,
      },
    });
  };

  return (
    <div
      className={`${styles.listItem} ${isFavorites ? styles.favorites : ''}`}
      onClick={handleClick}
    >
      <div className={styles.name}>{exam.title}</div>
      {isFavorites && (
        <div className={styles.author}>
          автор: {authorNames[exam.creator_id!] || 'Загрузка...'}
        </div>
      )}
    </div>
  );
};
