import React, { useRef, useEffect } from 'react';
import style from './TextAreaAuto.module.scss'
import clsx from 'clsx';

interface TextAreaAutoProps {
  value: string;
  onChange: (val: string) => void;
  handler: () => void;
  className?: string;
  disabled: boolean;
  ai_filling: boolean;
  ai_fill: boolean;
  maxLength?: number;
}

export const TextAreaAuto: React.FC<TextAreaAutoProps> = ({
                                                            value,
                                                            onChange,
                                                            handler,
                                                            className,
                                                            disabled,
                                                            ai_filling,
                                                            ai_fill,
                                                            maxLength
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
    <div className={clsx(style.aiBlock, style.shimmerCard)}>
      <div className={clsx({
         [style.shimmer]: ai_filling
      })}></div>
      <textarea
        disabled={disabled || ai_filling}
        ref={ref}
        className={`${className} ${ai_filling ? style.aiFilling : ''}`}
        value={value}
        maxLength={maxLength}
        onChange={(e) => {
          onChange(typeof maxLength === 'number'
            ? e.target.value.slice(0, maxLength)
            : e.target.value
          );

          if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
          }
        }}
        style={{ resize: 'none', overflow: 'hidden' }}
      />
      {ai_fill && !disabled &&
        <img
          title="Заполнить с помощью ИИ"
          src="ai gen.svg"
          alt="example"
          className={style.magicIcon}
          onClick={() => {handler()}}
        />}
    </div>
  );
};
