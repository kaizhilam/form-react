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
import mergeWith from "lodash/mergeWith";
import get from "lodash/get";

interface IKeyValuePair {
  [name: string]: string;
}

interface IForm {
  children: ReactElement[] | ReactElement;
  data?: { [name: string]: any };
  onSubmit?: (props: {
    isValid?: boolean;
    formData: IKeyValuePair;
    modifiedFormData: IKeyValuePair;
  }) => void;
}

export interface IFormValidation {
  message: string;
  expression?: (data: string) => boolean;
  type?: "required";
}

interface IFormContext {
  formData: IKeyValuePair;
  getFieldError: (name: string) => string | undefined;
  getFieldValue: (name: string) => string;
  setFormError: (name: string, value: string) => void;
  setFormValue: (name: string, value: string) => void;
  setFormValidation: (name: string, validations: IFormValidation[]) => void;
  triggerFieldValidation: (name: string, value: string) => string | undefined;
}

export const FormContext = createContext<IFormContext>({} as IFormContext);

export function Form(props: IForm) {
  const { children, data = {}, onSubmit } = props;

  const [modifiedFormData, setModifiedFormData] = useState<IKeyValuePair>({});
  const formData = useMemo(
    () =>
      mergeWith({}, data, modifiedFormData, (objValue, srcValue) => {
        if (srcValue === "") {
          return objValue;
        }
        return srcValue;
      }),
    [modifiedFormData, data]
  );
  // useEffect(() => {
  //   console.log("modifiedFormData", modifiedFormData);
  // }, [modifiedFormData]);

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

  const [formValidations, setFormValidations] = useState<{
    [key: string]: IFormValidation[];
  }>({});
  // useEffect(() => {
  //   console.log("formValidations", formValidations);
  // }, [formValidations]);

  const [errors, setErrors] = useState<IKeyValuePair>({});
  // useEffect(() => {
  //   console.log("errors", errors);
  // }, [errors]);

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
    setModifiedFormData((prev) => ({
      ...prev,
      ...merge({}, prev, toMerge),
    }));
  };

  const setFormValidation = (name: string, validations: IFormValidation[]) => {
    const sortedValidations = validations.sort((validation) =>
      validation.type === "required" ? -1 : 1
    );
    setFormValidations((prev) => ({ ...prev, [name]: sortedValidations }));
  };

  const triggerFieldValidation = (
    name: string,
    value: string
  ): string | undefined => {
    const validationObject = formValidations[name].find((validation) => {
      if (validation.type === "required") {
        return !value;
      } else {
        return validation.expression?.(value);
      }
    });
    return validationObject?.message;
  };

  const handleSubmit = (event: React.SyntheticEvent<HTMLElement>) => {
    let isValid = true;
    event.preventDefault();
    Object.keys(formValidations).forEach((key) => {
      const validationMessage = triggerFieldValidation(key, getFieldValue(key));
      if (!!validationMessage) {
        setFormError(key, validationMessage);
        isValid = false;
      }
    });
    onSubmit?.({ isValid, formData, modifiedFormData });
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        getFieldError,
        setFormError,
        setFormValue,
        setFormValidation,
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
