import styles from './LoginScreen.module.scss';
import {BlueButton} from '../../components/BlueButton/BlueButton.tsx';
import { useState } from 'react';
import { login } from '../../api';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      window.location.href = '/profile';
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="screenСontent screenContentCentered">
      <div className={styles.loginForm}>
        <h2>Вход</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Псевдоним или почта</label>
            <input type="text" id="username" name="username" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
          </div>

          <div className={styles.formFooter}>
            <a href="#" className={styles.forgotPassword}>Забыли пароль?</a>
          </div>

          <BlueButton title="Войти"/>
        </form>
      </div>
    </div>
  );
}
