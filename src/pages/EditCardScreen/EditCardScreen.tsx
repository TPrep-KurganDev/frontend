import Header from '../../components/Header/Header.tsx';
import styles from './EditCardScreen.module.scss';

type EditCardScreenProps = {
  canEdit: boolean;
}

export function EditCardScreen({canEdit}: EditCardScreenProps) {
  return (
    <>
      <Header title='Вопрос 2' {...(canEdit && {
        imgSrc: 'deleteCard.svg',
        widthImg: '38',
        heightImg: '30',
      })}/>
      <div className={`${styles.question} ${!canEdit ? styles.noEdit : ''}`}>Текст вопроса</div>
      <div className={`${styles.answer} ${!canEdit ? styles.noEdit : ''}`}>Текст ответа</div>
    </>
  )
}
