import styles from './Header.module.scss';
import React, {useEffect, useState} from 'react';

type HeaderProps = {
  title: string | undefined,
  imgSrc?: string,
  widthImg?: string,
  heightImg?: string,
  onRightImageClick?: () => void
  inputDisabled: boolean
  inputRef: React.MutableRefObject<null>
  onInputBlur: () => void
  onTitleChange: (value: string) => void
}

export default function Header({title, imgSrc, widthImg, heightImg, onRightImageClick, inputDisabled, inputRef, onInputBlur, onTitleChange}: HeaderProps) {
  const handleBack = () => {
    window.history.back();
  };

  // const [inputText, setInputText] = useState('');
  // const [inputDisabled, setInputDisabled] = useState(true);

  const handleKeyDown = (e: { key: string; }) => {
    if (e.key === 'Enter') {
      onInputBlur();
    }
  };

  if (inputDisabled == null){
    inputDisabled = true;
  }

  if (onTitleChange == null){
    onTitleChange = () => {};
  }

  useEffect(() => {
    onTitleChange(title!);
  }, [title]);


  return (
    <div className={styles.header}>
      <img src="Arrow 1.svg" className={styles.backButton} width="23" height="23" alt='backButton'
           onClick={handleBack}/>
      <input
        ref={inputRef}
        className={styles.title}
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        disabled={inputDisabled}
        onBlur={onInputBlur}
        onKeyDown={handleKeyDown}
      />
      {imgSrc &&
        <img src={imgSrc} className={styles.settingsButton} width={widthImg} height={heightImg} alt='settingsButton'
             onClick={onRightImageClick}/>}
    </div>
  );
}
