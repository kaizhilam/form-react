import React from "react";

interface IInput {
  error?: string;
  id: string;
  label: string;
  name: string;
  required?: boolean;
  validations?: {
    message: string;
    expression: (data: string) => boolean;
  }[];
  value?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export function Input(props: IInput) {
  const {
    error = false,
    id,
    label,
    name,
    required = false,
    value,
    onBlur,
    onChange,
    onFocus,
    ...restProps
  } = props;
  return (
    <>
      <label htmlFor={id}>{`${label}${required ? " (required)" : ""}: `}</label>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        {...restProps}
      />
      {error ?? <p>{error}</p>}
    </>
  );
}
