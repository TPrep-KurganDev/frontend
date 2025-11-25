import styles from './BottomSheet.module.scss';

type BottomSheetButton = {
  text: string,
  onclick: () => void,
  color: string|null
}

type BottomSheetProps = {
  buttons: BottomSheetButton[];
  open: boolean;
  onClose: () => void;
};

export function BottomSheet({buttons, open, onClose}: BottomSheetProps) {
  return (
    <>
      {/* затемнение */}
      <div
        className={`${styles.backdrop} ${open ? styles.open : ""}`}
        onClick={onClose}
      />

      {/* само меню */}
      <div
        className={`${styles.container} ${open ? styles.open : ""}`}
      >
        <div className={`${styles.containerInner}`}>
          {buttons.map((btn, i) => (
            <button
              key={i}
              className={styles.button}
              onClick={btn.onclick}
              style={{ color: btn.color ?? "inherit" }}
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
