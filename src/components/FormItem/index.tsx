import React, { useState, useContext, useEffect } from "react";
import { FormContext } from "../Form";

interface IFormItem {
  children: (formElementProps: any, formItemAction: any) => JSX.Element;
  id: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  validations?: {
    message: string;
    expression: (data: any) => boolean;
  }[];
  onBlur?: (event: React.FormEvent<HTMLInputElement>) => void;
}

export function FormItem(props: IFormItem) {
  const {
    validations = [],
    children,
    name,
    required = false,
    ...restProps
  } = props;

  const {
    formData,
    setFormValue,
    setFieldValidations,
    triggerFieldValidation,
    getFieldError,
    setFormError,
  } = useContext(FormContext);

  const [value, setValue] = useState<string>(formData[name] || "");

  useEffect(() => {
    let cleanValidations = [...validations];
    if (!!required) {
      cleanValidations = [
        {
          message: "This field is required",
          expression: (data: string) => {
            return !data;
          },
        },
        ...validations,
      ];
      setFormValue(name, value);
    }
    setFieldValidations(name, cleanValidations);
  }, []);

  const setFieldValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const validationMessage = triggerFieldValidation(name, value);
    setFormError(name, validationMessage);
    if (!validationMessage) {
      setFormValue(name, value);
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const error = getFieldError(name);

  return children(
    { ...restProps, error, name, required, value, onChange },
    { setFieldValue }
  );
}
