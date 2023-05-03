import React from "react";

interface IRadio {
  checked?: boolean;
  id: string;
  label: string;
  name?: string;
  value?: string;
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
}

export function Radio(props: IRadio) {
  const { checked, id, label, name, value, onChange } = props;

  return (
    <>
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        onChange={onChange}
        checked={checked}
      />
      <label htmlFor={id}>{label}</label>
    </>
  );
}
