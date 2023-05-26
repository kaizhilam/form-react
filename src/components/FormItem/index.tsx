import React, { useState, useContext, useEffect } from "react";
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
  groupId?: string;
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
    groupId,
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
    setFormError,
    setFormGroupId,
    setFormValue,
    setFormValidation,
    triggerFieldValidation,
    getFieldError,
    getFieldValue,
  } = useContext(FormContext);

  const [formItemValue, setFormItemValue] = useState<string>(
    get(formData, name) || ""
  );
  const [focused, setFocused] = React.useState<boolean>(false);

  useEffect(() => {
    setFormError(name, "");
    setFormGroupId(name, groupId);
    setFormValidation(name, validations, required);
  }, []);

  const useEffectDependency = get(formData, name);
  useEffect(() => {
    if (useEffectDependency !== formItemValue && !focused) {
      useEffectDependency && setFormItemValue(useEffectDependency);
    }
    triggerFieldValidation(name, formItemValue);
  }, [useEffectDependency]);

  const setFieldValue = (value: string) => {
    setFormItemValue(value);
    const validationMessage = triggerFieldValidation(name, value);
    if (!validationMessage) {
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
    setFormItemValue(event.target.value);
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
  const formItemRequired =
    required || !!validations.find((v) => v.type === "required");

  return children(
    {
      ...restProps,
      disabled: !!disabled,
      error,
      helperText: formItemHelperText,
      name,
      required: formItemRequired,
      value: formItemValue,
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
