import login_styles from '../LoginScreen/LoginScreen.module.scss';
import styles from './RegistrationScreen.module.scss'
import {BlueButton} from '../../components/BlueButton/BlueButton.tsx';

export function RegistrationScreen() {
  return (
    <div className="screenСontent screenContentCentered">
      <div className={`${styles.registrationForm} ${styles.gap2}`}>
        <h2 className={styles.title}>Регистрация</h2>

        <form>
          <div className={login_styles.formGroup}>
            <label htmlFor="email">Почта</label>
            <input type="text" id="email" name="email" placeholder="example@example.com" required/>
          </div>

          <div className={login_styles.formGroup}>
            <label htmlFor="username">Псевдоним</label>
            <input type="text" id="username" name="username" placeholder="nickname" required/>
          </div>

          <div className={login_styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" name="password" required/>
          </div>

          <div className={`${login_styles.formGroup} ${styles.gap}`}>
            <label htmlFor="password_confirm">Потверждение пароля</label>
            <input type="password" id="password_confirm" name="password_confirm" required/>
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
