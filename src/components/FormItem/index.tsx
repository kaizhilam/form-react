import React, { useState, useContext, useEffect, SyntheticEvent } from "react";
import { FormContext, IFormValidation } from "../Form";
import get from "lodash/get";

interface IRestProps {
  disabled: boolean;
  error: boolean;
  errorMessage?: string;
  id: string;
  label?: React.ReactNode;
  name: string;
  required: boolean;
  type?: string;
  value: string;
  onBlur: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => void;
  [key: string]: any;
}

interface IFormItemAction {
  getFieldValue: (name: string) => string;
  setFieldValue: (value: string) => void;
  setFormValue: (name: string, value: string) => void;
}

interface IFormItem {
  children: (
    formElementProps: IRestProps,
    formItemAction: IFormItemAction
  ) => JSX.Element;
  disabled?: boolean;
  helperText?: React.ReactNode;
  id: string;
  label?: React.ReactNode;
  name: string;
  required?: boolean;
  validations?: IFormValidation[];
  onBlur?: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => void;
  [key: string]: any;
}

export function FormItem(props: IFormItem) {
  const {
    children,
    disabled,
    helperText,
    name,
    required = false,
    validations = [],
    onBlur,
    onChange,
    onFocus,
    ...restProps
  } = props;

  const {
    formData,
    setFormValue,
    setFormValidation,
    triggerFieldValidation,
    getFieldError,
    getFieldValue,
    setFormError,
  } = useContext(FormContext);

  const [value, setValue] = useState<string>(get(formData, name) || "");
  const [focused, setFocused] = React.useState<boolean>(false);

  useEffect(() => {
    let validationToUse = [...validations];
    if (required) {
      validationToUse = [
        {
          message: "This field is required",
          type: "required",
        },
        ...validationToUse,
      ];
    }
    setFormValidation(name, validationToUse);
  }, []);

  const useEffectDependency = formData[name];
  useEffect(() => {
    if (useEffectDependency !== value && !focused) {
      useEffectDependency && setValue(useEffectDependency);
    }
  }, [useEffectDependency]);

  const setFieldValue = (value: string) => {
    const validationMessage = triggerFieldValidation(name, value);
    if (!!validationMessage) {
      setFormError(name, validationMessage);
    } else {
      setFormError(name, "");
      setFormValue(name, value);
    }
  };

  const formItemOnBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    setFocused(false);
    const { target } = event;
    if (target) setFieldValue((target as HTMLInputElement).value);
    onBlur?.(event);
  };

  const formItemOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    onChange?.(event);
  };

  const formItemOnFocus = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    setFocused(true);
    onFocus?.(event);
  };

  const errorMessage = getFieldError(name) ?? undefined;
  const error = !!errorMessage;
  const formItemHelperText = error ? errorMessage : helperText;

  return children(
    {
      ...restProps,
      disabled: !!disabled,
      error,
      helperText: formItemHelperText,
      name,
      required,
      value,
      onBlur: formItemOnBlur,
      onChange: formItemOnChange,
      onFocus: formItemOnFocus,
    },
    {
      getFieldValue,
      setFieldValue,
      setFormValue,
    }
  );
}
