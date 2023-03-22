import React, {
  createContext,
  useState,
  useRef,
  ReactElement,
  useMemo,
  useEffect,
} from "react";
import set from "lodash/set";
import merge from "lodash/merge";
import get from "lodash/get";
import { convertObjectValueToString } from "../../utils";

interface IKeyValuePair {
  [name: string]: string;
}

interface IForm {
  children: ReactElement[];
  data?: { [name: string]: any };
  onSubmit: (props: { isValid?: boolean; formData: IKeyValuePair }) => void;
}

export interface IFormValidation {
  message: string;
  expression: (data: string) => boolean;
}

interface IFormContext {
  formData: IKeyValuePair;
  getFieldError: (name: string) => string;
  getFieldValue: (name: string) => string;
  setFormError: (name: string, value: string) => void;
  setFormValue: (name: string, value: string) => void;
  setFieldRequiredValidation: (name: string, message: string) => void;
  setFieldValidations: (name: string, validations: IFormValidation[]) => void;
  triggerFieldValidation: (name: string, value: string) => string;
}

export const FormContext = createContext<IFormContext>({} as IFormContext);

export function Form(props: IForm) {
  const { children, data = {}, onSubmit } = props;

  const [modifiedData, setModifiedData] = useState<IKeyValuePair>({});
  const formData = useMemo(
    () => merge({}, modifiedData, data),
    [modifiedData, data]
  );
  useEffect(() => {
    console.log("modifiedData", modifiedData);
  }, [modifiedData]);

  useEffect(() => {
    console.log("formData", formData);
  }, [formData]);

  const [requiredValidation, setRequiredValidation] = useState<IKeyValuePair>(
    {}
  );
  const [validations, setValidations] = useState<{
    [key: string]: IFormValidation[];
  }>({});
  const [errors, setErrors] = useState<IKeyValuePair>({});

  const formRef = useRef(null);

  const getFieldError = (name: string): string => {
    return errors[name];
  };

  const getFieldValue = (name: string): string => {
    return get(formData, name);
  };

  const setFormError = (name: string, value: string) => {
    setErrors((prev) => ({ ...prev, [name]: value }));
  };

  const setFormValue = (name: string, value: string) => {
    const toMerge = set({}, name, value);
    setModifiedData((prev) => ({
      ...prev,
      ...merge({}, prev, toMerge),
    }));
  };

  const setFieldValidations = (
    name: string,
    validations: IFormValidation[]
  ) => {
    setValidations((prev) => ({ ...prev, [name]: validations }));
  };

  const setFieldRequiredValidation = (name: string, message: string) => {
    setRequiredValidation((prev) => ({ ...prev, [name]: message }));
  };

  const triggerFieldValidation = (name: string, value: string): string => {
    if (value === "" && !!requiredValidation[name]) {
      return requiredValidation[name];
    } else if (value === "" && !requiredValidation[name]) {
      return "";
    }
    let validationMessage = "";
    validations[name]?.some((validation) => {
      const validationResult = validation.expression(value);
      if (!!validationResult) {
        validationMessage = validation.message;
      }
      return !!validationResult;
    });
    return validationMessage;
  };

  const handleSubmit = (event: React.SyntheticEvent<HTMLElement>) => {
    let isValid = true;
    event.preventDefault();
    Object.keys(formData).forEach((key) => {
      const validation = triggerFieldValidation(key, formData[key]);
      if (!!validation) {
        isValid = false;
      }
      setErrors((prev) => ({ ...prev, [key]: validation }));
    });
    onSubmit({ isValid, formData });
  };

  // console.log(formData);

  return (
    <FormContext.Provider
      value={{
        formData,
        getFieldError,
        setFormError,
        setFormValue,
        setFieldRequiredValidation,
        setFieldValidations,
        triggerFieldValidation,
        getFieldValue,
      }}
    >
      <form ref={formRef} onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
}
