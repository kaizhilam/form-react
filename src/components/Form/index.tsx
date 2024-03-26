import { get, merge, set } from "lodash";
import React, { createContext, useRef } from "react";
import { removeDuplicates } from "../../utils";

export type PrimitiveValue = string | number | boolean;

export interface IFieldValidation {
  name?: string;
  expression?: (data: PrimitiveValue, formData: IFormData) => boolean;
  message: string;
  type?: "required";
}

interface IDependencies {
  [key: string]: string[];
}

interface IErrors {
  [key: string]: (errorMessage: string) => void;
}
interface IForceUpdates {
  [key: string]: () => void;
}

interface ISetDatas {
  [key: string]: (data: PrimitiveValue) => void;
}

interface IValidations {
  [key: string]: IFieldValidation[];
}

export interface IFormData {
  [name: string]: PrimitiveValue | IFormData | IFormData[];
}

interface IOnChangeProps {
  clearModifiedFormData: () => void;
  formData: IFormData;
  modifiedFormData: IFormData;
  isValid: boolean;
}

interface IForm {
  children:
    | React.ReactNode
    | ((formChildProps: { submit: () => void }) => React.ReactNode);
  data?: IFormData;
  div?: boolean;
  onChange?: (onChangeProps: IOnChangeProps) => void;
  onSubmit?: (onSubmitProps: IOnChangeProps) => void;
}

interface IFormContext {
  getFormData: (fieldName?: string) => IFormData | PrimitiveValue;
  registerDependencies: (fieldName: string, dependency: string) => void;
  registerError: (
    fieldName: string,
    setError: (errorMessage: string) => void
  ) => void;
  registerForceUpdate: (fieldName: string, forceUpdate: () => void) => void;
  registerSetData: (
    fieldName: string,
    setData: (data: PrimitiveValue) => void
  ) => void;
  registerValidations: (
    fieldName: string,
    fieldValidations: IFieldValidation[]
  ) => void;
  setFormData: (name: string, value: PrimitiveValue) => void;
  setFormDataWithRerender: (name: string, value: PrimitiveValue) => void;
  triggerFieldValidation: ({
    fieldName,
    fieldValue,
    setFieldError,
  }: {
    fieldName: string;
    fieldValue?: PrimitiveValue;
    setFieldError?: (errorMessage: string) => void;
  }) => IFieldValidation | undefined;
}

export const FormContext = createContext<IFormContext>({} as IFormContext);

export function Form(props: IForm) {
  const { children, data = undefined, div = false, onChange, onSubmit } = props;

  const modifiedFormData = useRef<IFormData>({});

  const dependencies = useRef<IDependencies>({});
  const errors = useRef<IErrors>({});
  const forceUpdates = useRef<IForceUpdates>({});
  const setDatas = useRef<ISetDatas>({});
  const validations = useRef<IValidations>({});

  const getFormData = (fieldName?: string): IFormData | PrimitiveValue => {
    const formData = {};
    merge(formData, data, modifiedFormData.current);
    if (fieldName) {
      return get(formData, fieldName);
    } else {
      return formData;
    }
  };

  const generateOnChangeProps = (setError: boolean): IOnChangeProps => {
    return {
      clearModifiedFormData,
      formData: getFormData() as IFormData,
      modifiedFormData: modifiedFormData.current,
      isValid: calculateIsValid(setError),
    };
  };

  const setFormData = (fieldName: string, value: PrimitiveValue) => {
    const dataToSet = {};
    set(dataToSet, fieldName, value);
    const dataToMerge = modifiedFormData.current;
    merge(dataToMerge, dataToSet);
    modifiedFormData.current = dataToMerge;
    dependencies.current?.[fieldName]?.forEach((d) => {
      forceUpdates.current[d]();
    });
    onChange?.(generateOnChangeProps(false));
  };

  const setFormDataWithRerender = (
    fieldName: string,
    value: PrimitiveValue
  ) => {
    if (getFormData(fieldName) !== value) {
      setFormData(fieldName, value);
      triggerFieldValidation({
        fieldName,
        fieldValue: value,
        setFieldError: errors.current[fieldName],
      });
      forceUpdates.current?.[fieldName]?.();
    }
  };

  const registerDependencies = (fieldName: string, dependency: string) => {
    if (!dependencies.current?.[dependency]) {
      dependencies.current = {
        ...dependencies.current,
        [dependency]: [fieldName],
      };
    } else {
      const dependenciesArray = [
        fieldName,
        ...dependencies.current[dependency],
      ];
      dependencies.current = {
        ...dependencies.current,
        [dependency]: removeDuplicates(dependenciesArray),
      };
    }
  };

  const registerError = (
    fieldName: string,
    setError: (errorMessage: string) => void
  ) => {
    errors.current = {
      ...errors.current,
      [fieldName]: setError,
    };
  };

  const registerForceUpdate = (fieldName: string, forceUpdate: () => void) => {
    forceUpdates.current = {
      ...forceUpdates.current,
      [fieldName]: forceUpdate,
    };
  };

  const registerSetData = (
    fieldName: string,
    setData: (data: PrimitiveValue) => void
  ) => {
    setDatas.current = {
      ...setDatas.current,
      [fieldName]: setData,
    };
  };

  const registerValidations = (
    fieldName: string,
    fieldValidations: IFieldValidation[]
  ) => {
    validations.current = {
      ...validations.current,
      [fieldName]: fieldValidations,
    };
  };

  const triggerFieldValidation = ({
    fieldName,
    fieldValue,
    setFieldError,
  }: {
    fieldName: string;
    fieldValue?: PrimitiveValue;
    setFieldError?: (errorMessage: string) => void;
  }) => {
    const validationTriggered = validations.current?.[fieldName]?.find((v) => {
      if (fieldValue) {
        return v.expression?.(fieldValue, getFormData() as IFormData);
      } else {
        const valueToUse = getFormData(fieldName) as PrimitiveValue;
        return v.expression?.(valueToUse, getFormData() as IFormData);
      }
    });
    if (validationTriggered) {
      setFieldError?.(validationTriggered.message);
    } else {
      setFieldError?.("");
    }
    return validationTriggered;
  };

  const clearModifiedFormData = () => {
    modifiedFormData.current = {};
    Object.keys(setDatas.current).forEach((fieldName) => {
      setDatas.current?.[fieldName](
        (get(data, fieldName) as PrimitiveValue) ?? ""
      );
    });
  };

  const calculateIsValid = (setError: boolean = false) => {
    const formData = getFormData() as IFormData;
    const allFields = Object.keys(forceUpdates.current);
    const containsError = allFields.some((f) => {
      const result = triggerFieldValidation({
        fieldName: f,
        fieldValue: get(formData, f) as PrimitiveValue,
        setFieldError: setError ? errors.current[f] : undefined,
      });
      return result;
    });
    return !containsError;
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    onSubmit?.(generateOnChangeProps(true));
  };

  const childToRender =
    typeof children === "function"
      ? children({
          submit: handleSubmit,
        })
      : children;

  return (
    <>
      <FormContext.Provider
        value={{
          getFormData,
          registerDependencies,
          registerError,
          registerForceUpdate,
          registerSetData,
          registerValidations,
          setFormData,
          setFormDataWithRerender,
          triggerFieldValidation,
        }}
      >
        {div ? (
          <div children={childToRender} />
        ) : (
          <form onSubmit={handleSubmit} children={childToRender} />
        )}
      </FormContext.Provider>
    </>
  );
}
