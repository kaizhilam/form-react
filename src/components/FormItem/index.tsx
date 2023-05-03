import React, { useState, useContext, useEffect } from "react";
import { FormContext, IFormValidation } from "../Form";
import get from "lodash/get";

interface IRestProps {
  error?: string;
  id: string;
  label: string;
  name: string;
  required: boolean;
  type?: string | undefined;
  value: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

interface IFormItemAction {
  setFieldValue: (value: string) => void;
  setFormValue: (name: string, value: string) => void;
}

interface IFormItem {
  children: (
    formElementProps: IRestProps,
    formItemAction: IFormItemAction
  ) => JSX.Element;
  id: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  validations?: {
    message: string;
    expression?: (data: string) => boolean;
    type?: "required";
  }[];
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export function FormItem(props: IFormItem) {
  const {
    validations = [],
    children,
    name,
    required = false,
    onBlur,
    onChange,
    onFocus,
    ...restProps
  } = props;

  const {
    formData,
    setFormValue,
    setFieldRequiredValidation,
    setFieldValidations,
    triggerFieldValidation,
    getFieldError,
    setFormError,
  } = useContext(FormContext);

  const [value, setValue] = useState<string>(get(formData, name) || "");
  const [focused, setFocused] = React.useState<boolean>(false);

  useEffect(() => {
    let requiredValidationMessage = "This field is required.";
    const cleanValidation = [...validations].filter((validation) => {
      if (!!validation?.type) {
        if (validation.type === "required") {
          requiredValidationMessage = validation.message;
        }
        return false;
      }
      return true;
    }) as IFormValidation[];
    setFieldRequiredValidation(
      name,
      !!required ? requiredValidationMessage : ""
    );
    // setFormValue(name, value);
    setFieldValidations(name, cleanValidation);
  }, []);

  const useEffectDependency = formData[name];
  useEffect(() => {
    if (useEffectDependency !== value && !focused) {
      useEffectDependency && setValue(useEffectDependency);
    }
  }, [useEffectDependency]);

  const setFieldValue = (value: string) => {
    const validationMessage = triggerFieldValidation(name, value);
    setFormError(name, validationMessage);
    if (!validationMessage) {
      setFormValue(name, value);
    }
  };

  const formItemOnBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    const { value } = event.target;
    setFieldValue(value);
    onBlur?.(event);
  };

  const formItemOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    onChange?.(event);
  };

  const formItemOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const error = getFieldError(name);

  return children(
    {
      ...restProps,
      error,
      name,
      required,
      value,
      onBlur: formItemOnBlur,
      onChange: formItemOnChange,
      onFocus: formItemOnFocus,
    },
    {
      setFieldValue,
      setFormValue,
    }
  );
}
