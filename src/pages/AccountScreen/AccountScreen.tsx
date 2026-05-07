import React from 'react';
import Header from '../../components/Header/Header.tsx';
import styles from './AccountScreen.module.scss'
import clsx from 'clsx';
import {useNavigate} from 'react-router-dom';


export const AccountScreen: React.FC = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  }

  return (
    <>
      <Header
        title={''}
        inputDisabled={true}
        inputRef={undefined}
        onInputBlur={() => {}}
        onTitleChange={() => {}}
        backButtonPage={'/'}
      />
      <div className="screenСontent screenContentCentered">
        <img src="avatar3.png" alt="" className={styles.avatar}/>
        <p className={styles.name}>Роман</p>
        <div className={clsx(styles.logout, styles.logout_margin)}
        onClick={logout}>
          <p>Выйти</p>
        </div>
      </div>
    </>
  );
};
