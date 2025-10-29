import styles from './LoginScreen.module.scss';

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

          <button type="submit" className={styles.loginButton}>Войти</button>
        </form>
      </div>
    </div>
  );
}
