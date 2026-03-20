import React, { useRef, useEffect } from 'react';
import style from './TextAreaAuto.module.scss'

interface TextAreaAutoProps {
  value: string;
  onChange: (val: string) => void;
  handler: () => void;
  className?: string;
  disabled: boolean
  ai_fill: boolean
}

export const TextAreaAuto: React.FC<TextAreaAutoProps> = ({
                                                            value,
                                                            onChange,
                                                            handler,
                                                            className,
                                                            disabled,
                                                            ai_fill
                                                          }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.style.height = 'auto';
    let currentHeight = ref.current.scrollHeight;
    if (ref.current.scrollHeight < 69) {
      currentHeight = 40
    }
    ref.current.style.height = `${currentHeight}px`;
  }, [value]);

  return (
    <div className={style.aiBlock}>
      <textarea
        disabled={disabled}
        ref={ref}
        className={className}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);

          if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
          }
        }}
        style={{ resize: 'none', overflow: 'hidden' }}
      />
      {ai_fill &&
        <img
          src="ai gen.svg"
          alt="example"
          className={style.magicIcon}
          onClick={() => {handler()}}
        />}
    </div>
  );
};
