import { useState } from 'react';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet.tsx';

export default function Test() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Открыть меню</button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        buttons={[
          { text: "Редактировать", onclick: () => alert("edit"), color: "red" },
          { text: "Поделиться", onclick: () => alert("share"), color: "red" },
          { text: "Удалить", onclick: () => alert("delete"), color: "red" }
        ]}
      />
    </>
  );
}
