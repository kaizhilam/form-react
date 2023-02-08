import React, { useState, ReactElement } from "react";

interface IControlGroup {
  children: ReactElement[];
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
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ControlGroup(props: IControlGroup) {
  const {
    error = false,
    id,
    label,
    required = false,
    value,
    onChange,
    children,
    name,
  } = props;

  const [fieldValue, setFieldValue] = useState(value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(event.target.value);
    onChange && onChange(event);
  };

  return (
    <div id={id} role="group">
      <legend>{`${label}${required ? " (required)" : ""}: `}</legend>
      {children.map((child, index) => {
        const childProps = {
          ...child.props,
          key: `${name}-${index}`,
          checked: fieldValue === child.props.value,
          onChange: handleChange,
          name,
        };
        return React.cloneElement(child, childProps);
      })}
      {error && <p>{error}</p>}
    </div>
  );
}
