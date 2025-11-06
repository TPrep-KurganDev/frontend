import login_styles from '../LoginScreen/LoginScreen.module.scss';
import styles from './RegistrationScreen.module.scss'
import {BlueButton} from '../../components/BlueButton/BlueButton.tsx';
import { useState } from 'react';
import { register } from '../../api/auth.ts';

export function RegistrationScreen() {
  const [email, setEmail] = useState('');
  const [user_name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirm, setPasswordConfirm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password_confirm){
      return;
    }
    try {
      await register({ email, user_name, password });
      window.location.href = '/profile';
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="screenСontent screenContentCentered">
      <div className={`${styles.registrationForm} ${styles.gap2}`}>
        <h2 className={styles.title}>Регистрация</h2>

        <form onSubmit={handleSubmit}>
          <div className={login_styles.formGroup}>
            <label htmlFor="email">Почта</label>
            <input type="text" id="email" name="email" placeholder="example@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          </div>

          <div className={login_styles.formGroup}>
            <label htmlFor="user_name">Псевдоним</label>
            <input type="text" id="user_name" name="user_name" placeholder="nickname" value={user_name} onChange={(e) => setUsername(e.target.value)} required/>
          </div>

          <div className={login_styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
          </div>

          <div className={`${login_styles.formGroup} ${styles.gap}`}>
            <label htmlFor="password_confirm">Потверждение пароля</label>
            <input type="password" id="password_confirm" name="password_confirm" value={password_confirm} onChange={(e) => setPasswordConfirm(e.target.value)} required/>
          </div>

          <BlueButton title="Готово"/>
        </form>
      </div>

      <div className={`${styles.yellowButton} ${styles.yellowButtonPadding}`}>
        <p className={styles.yellowButtonP}>или</p>
        <p className={styles.yellowButtonTitle}>Вход</p>
      </div>
    </div>
  );
}
