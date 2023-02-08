import React, { createContext, useState, useRef, ReactElement } from "react";

interface IKeyValuePair {
  [name: string]: string;
}

interface IForm {
  children: ReactElement[];
  initialData?: IKeyValuePair;
  onSubmit: (props: { isValid?: boolean; formData: IKeyValuePair }) => void;
}

interface IFormValidation {
  message: string;
  expression: (data: string) => boolean;
}

interface IFormContext {
  formData: IKeyValuePair;
  getFieldError: (name: string) => string;
  getFieldValue: (name: string) => string;
  setFormError: (name: string, value: string) => void;
  setFormValue: (name: string, value: string) => void;
  setFieldValidations: (name: string, validations: IFormValidation[]) => void;
  triggerFieldValidation: (name: string, value: string) => string;
}

export const FormContext = createContext<IFormContext>({} as IFormContext);

export function Form(props: IForm) {
  const { children, initialData = {}, onSubmit } = props;

  const [formData, setFormData] = useState<IKeyValuePair>(initialData);
  const [validations, setValidations] = useState<{
    [key: string]: IFormValidation[];
  }>({});
  const [errors, setErrors] = useState<IKeyValuePair>({});

  const formRef = useRef(null);

  const getFieldError = (name: string): string => {
    return errors[name];
  };

  const getFieldValue = (name: string): string => {
    return formData[name];
  };

  const setFormError = (name: string, value: string) => {
    setErrors((prev) => ({ ...prev, [name]: value }));
  };

  const setFormValue = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setFieldValidations = (
    name: string,
    validations: IFormValidation[]
  ) => {
    setValidations((prev) => ({ ...prev, [name]: validations }));
  };

  const triggerFieldValidation = (name: string, value: string): string => {
    let validationMessage = "";
    validations[name].some((validation) => {
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

  return (
    <FormContext.Provider
      value={{
        formData,
        getFieldError,
        setFormError,
        setFormValue,
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
