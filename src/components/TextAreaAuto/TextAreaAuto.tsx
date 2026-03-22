import React, { useRef, useEffect } from 'react';

interface TextAreaAutoProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  disabled: boolean;
  maxLength?: number;
}

export const TextAreaAuto: React.FC<TextAreaAutoProps> = ({
                                                            value,
                                                            onChange,
                                                            className,
                                                            disabled,
                                                            maxLength
                                                          }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.style.height = 'auto';
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      disabled={disabled}
      ref={ref}
      className={className}
      value={value}
      maxLength={maxLength}
      onChange={(e) => {
        onChange(
          typeof maxLength === 'number'
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
  );
};
