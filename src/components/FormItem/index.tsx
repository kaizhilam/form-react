import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import {
  Data,
  FieldValue,
  FormContext,
  IFormValidation,
  PrimitiveValue,
} from "../Form";
import get from "lodash/get";
import { isEmpty } from "lodash";

interface IRestProps {
  disabled: boolean;
  error: boolean;
  errorMessage?: string;
  helperText?: React.ReactNode;
  id: string;
  label?: React.ReactNode;
  name: string;
  onBlur: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | Element>
  ) => void;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFocus: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | Element>
  ) => void;
  required: boolean;
  value: string;
  [key: string]: any;
}

interface IFieldAction {
  formData: Data;
  getFieldValue: (name: string) => FieldValue | Data | Data[];
  setFieldValue: (value: PrimitiveValue) => void;
  setFormValue: (name: string, value: PrimitiveValue, groupId?: string) => void;
}

interface IFormItem {
  disabled?:
    | boolean
    | (({
        formData,
        getFieldValue,
      }: {
        formData: Data;
        getFieldValue: (name: string) => FieldValue | Data | Data[];
      }) => boolean);
  children: (
    formElementProps: IRestProps,
    formItemAction: IFieldAction
  ) => JSX.Element;
  groupId?: string;
  helperText?: React.ReactNode;
  id: string;
  label?: React.ReactNode;
  name: string;
  noOptimise?: boolean;
  onBlur?: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | Element>
  ) => void;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFocus?: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | Element>
  ) => void;
  required?: boolean;
  validations?: IFormValidation[];
  [key: string]: any;
}

export function FormItem(props: IFormItem) {
  const {
    disabled,
    children,
    groupId,
    helperText,
    name,
    noOptimise = false,
    onBlur,
    onChange,
    onFocus,
    required = false,
    validations = [],
    ...restProps
  } = props;

  const {
    errors,
    formData,
    groupIds,
    setFormValue,
    triggerFieldValidation,
    validations: formValidations,
  } = useContext(FormContext);

  useEffect(() => {
    if (groupId) {
      groupIds.current = { ...groupIds.current, [name]: groupId };
    }

    const validationToAdd: IFormValidation[] = [...validations];
    if (required) {
      validationToAdd.unshift({
        message: "This field is required",
        type: "required",
      });
    }
    const sortedValidations = validationToAdd.sort((validation) =>
      validation.type === "required" ? -1 : 1
    );
    if (!isEmpty(sortedValidations)) {
      formValidations.current = {
        ...formValidations.current,
        [name]: sortedValidations,
      };
    }
  }, []);

  const [formItemValue, setFormItemValue] = useState<PrimitiveValue>(
    (get(formData, name) as PrimitiveValue) || ""
  );

  const useEffectDependency = get(formData, name) as PrimitiveValue;
  useEffect(() => {
    if (useEffectDependency !== formItemValue) {
      setFormItemValue(useEffectDependency || "");
      triggerFieldValidation(name, useEffectDependency);
    }
  }, [useEffectDependency]);

  const getFieldValue = (fieldName: string): FieldValue | Data | Data[] => {
    return get(formData, fieldName);
  };

  const setFieldValue = (value: PrimitiveValue) => {
    setFormItemValue(value);
    setFormValue(name, value);
    triggerFieldValidation(name, value);
  };

  const formItemOnBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | Element>
  ) => {
    const { target } = event;
    if (target) {
      setFieldValue((target as HTMLInputElement).value);
    }
    onBlur?.(event);
  };

  const formItemOnChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormItemValue(event.target.value);
    onChange?.(event);
  };

  const formItemOnFocus = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | Element>
  ) => {
    onFocus?.(event);
  };

  const errorMessage = get(errors.current, name);
  const formItemDisabled = ((): boolean => {
    if (typeof disabled === "boolean" || disabled === undefined) {
      return !!disabled;
    } else {
      return disabled({ formData, getFieldValue });
    }
  })();
  const formItemRequired =
    required || !!validations.find((v) => v.type === "required");

  const [formDataAccessed, setFormDataAccessed] = useState<boolean>(false);
  const fieldAction: IFieldAction = {
    get formData() {
      setFormDataAccessed(true);
      return formData;
    },
    getFieldValue: (fieldName: string): FieldValue | Data | Data[] => {
      setFormDataAccessed(true);
      return getFieldValue(fieldName);
    },
    setFieldValue,
    setFormValue,
  };

  const toRender = useMemo(() => {
    if (noOptimise) return <></>;
    return children(
      {
        ...restProps,
        disabled: !!disabled,
        error: !!errorMessage,
        helperText: errorMessage ?? helperText,
        name,
        required: formItemRequired,
        onBlur: formItemOnBlur,
        onChange: formItemOnChange,
        onFocus: formItemOnFocus,
        value: formItemValue as string,
      },
      fieldAction
    );
  }, [
    formItemValue,
    errorMessage,
    formItemDisabled,
    formDataAccessed ? formData : false,
  ]);

  return noOptimise
    ? children(
        {
          ...restProps,
          disabled: !!disabled,
          error: !!errorMessage,
          helperText: errorMessage ?? helperText,
          name,
          required: formItemRequired,
          onBlur: formItemOnBlur,
          onChange: formItemOnChange,
          onFocus: formItemOnFocus,
          value: formItemValue as string,
        },
        {
          formData,
          getFieldValue,
          setFieldValue,
          setFormValue,
        }
      )
    : toRender;
}
