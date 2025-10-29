import styles from './LoginScreen.module.scss';
import {BlueButton} from '../../components/BlueButton/BlueButton.tsx';

export function LoginScreen() {
  return (
    <div className="screenСontent screenContentCentered">
      <div className={styles.loginForm}>
        <h2>Вход</h2>

        <form>
          <div className={styles.formGroup}>
            <label htmlFor="username">Псевдоним или почта</label>
            <input type="text" id="username" name="username" required/>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" name="password" required/>
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
