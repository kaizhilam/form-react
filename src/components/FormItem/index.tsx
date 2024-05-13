import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { FormContext, IFieldValidation, PrimitiveValue } from "../Form";

interface IChildProps {
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  onBlur: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  name: string;
  required: boolean;
  value: PrimitiveValue;
  [key: string]: any;
}

interface IChildActions {
  getFieldValue: (fieldName: string) => PrimitiveValue;
  setFieldValue: (fieldValue: PrimitiveValue) => void;
  setFormValue: (fieldName: string, fieldValue: PrimitiveValue) => void;
}

interface IFormItem {
  children: (
    childProps: IChildProps,
    childActions: IChildActions
  ) => JSX.Element | undefined;
  disabled?: boolean;
  helperText?: string;
  label?: string;
  name: string;
  required?: boolean;
  validations?: IFieldValidation[];
  [key: string]: any;
}

export function FormItem(props: IFormItem) {
  const {
    children,
    disabled,
    helperText,
    label,
    name,
    required,
    validations,
    ...restProps
  } = props;

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [data, setData] = useState<PrimitiveValue>("");
  const [error, setError] = useState<string>("");

  const focused = useRef<boolean>(false);

  const {
    deregisterAlwaysUpdate,
    deregisterNameDependencies,
    deregisterValidations,
    getFormData,
    registerAlwaysUpdate,
    registerDependencies,
    registerFocusedKeyValuePair,
    registerNameDependencies,
    registerValidations,
    setFormData,
    setFormDataWithRerender,
    triggerFieldValidation,
  } = useContext(FormContext);

  useEffect(() => {
    registerNameDependencies({
      fieldName: name,
      setData,
      setError,
      forceUpdate,
    });
    return () => {
      deregisterNameDependencies(name);
    };
  }, [name]);

  useEffect(() => {
    // console.log(`register validation for field ${name}`);
    const requiredValidation = validations?.find((v) => v.type === "required");
    if (!!required && !requiredValidation) {
      registerValidations(name, [
        {
          type: "required",
          message: "This field is required.",
          expression: (validationData) =>
            validationData === "" ||
            validationData === undefined ||
            validationData === null,
        },
        ...(validations ?? []),
      ]);
    } else if (!required && !!requiredValidation) {
      const cleanValidation =
        validations?.filter((v) => v.type !== "required") ?? [];
      registerValidations(name, [
        {
          type: "required",
          message: requiredValidation.message,
          expression: (validationData) =>
            validationData === "" ||
            validationData === undefined ||
            validationData === null,
        },
        ...cleanValidation,
      ]);
    } else if (!!required && !!requiredValidation) {
      const cleanValidation =
        validations?.filter((v) => v.type !== "required") ?? [];
      registerValidations(name, [
        {
          type: "required",
          message: requiredValidation.message,
          expression: (validationData) =>
            validationData === "" ||
            validationData === undefined ||
            validationData === null,
        },
        ...cleanValidation,
      ]);
    } else {
      registerValidations(name, validations ?? []);
    }
    if (validations?.some((v) => v.expression && v.expression.length > 1)) {
      registerAlwaysUpdate(name);
    }
    return () => {
      deregisterValidations(name);
      deregisterAlwaysUpdate(name);
    };
  }, [validations]);

  const handleBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    focused.current = false;
    setFieldValue(event.target.value);
    registerFocusedKeyValuePair(undefined);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    focused.current = true;
    setData(event.target.value);
    registerFocusedKeyValuePair(name, event.target.value);
  };

  const getFieldValue = (fieldName: string): PrimitiveValue => {
    return getFormData(fieldName) as PrimitiveValue;
  };

  const setFieldValue = (fieldValue: PrimitiveValue) => {
    setData(fieldValue);
    setFormData(name, fieldValue);
    triggerFieldValidation({
      fieldName: name,
      fieldValue,
      setFieldError: setError,
    });
  };

  const setFormValue = (fieldName: string, fieldValue: PrimitiveValue) => {
    setFormDataWithRerender(fieldName, fieldValue);
  };

  const childProps: IChildProps = {
    disabled,
    error: !!error,
    helperText: error || helperText,
    label,
    onBlur: handleBlur,
    onChange: handleChange,
    name,
    required: !!required || !!validations?.find((v) => v.type === "required"),
    value: data,
    ...restProps,
  };

  const childActions: IChildActions = {
    getFieldValue: (fieldName) => {
      registerDependencies(name, fieldName);
      return getFieldValue(fieldName);
    },
    setFieldValue,
    setFormValue,
  };
  // console.log("rerender ", name, data);
  return <>{children(childProps, childActions)}</>;
}
