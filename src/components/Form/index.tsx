import { get, merge, set } from "lodash";
import React, { createContext, useRef } from "react";
import { removeDuplicates, removeUndefinedFromObject } from "../../utils";

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

interface IFocusKeyValue {
  fieldName: string | undefined;
  fieldValue: PrimitiveValue | undefined;
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
  wrapper?: React.ReactElement;
  onChange?: (onChangeProps: IOnChangeProps) => void;
  onSubmit?: (onSubmitProps: IOnChangeProps) => void;
}

interface IFormContext {
  calculateIsValid: () => boolean;
  deregisterError: (fieldName: string) => void;
  deregisterForceUpdate: (fieldName: string) => void;
  deregisterSetDatas: (fieldName: string) => void;
  deregisterValidations: (fieldName: string) => void;
  getFormData: (fieldName?: string) => IFormData | PrimitiveValue;
  registerAlwaysUpdate: (fieldName: string) => void;
  registerDependencies: (fieldName: string, dependency: string) => void;
  registerError: (
    fieldName: string,
    setError: (errorMessage: string) => void
  ) => void;
  registerFocusedKeyValuePair: (
    fieldName: string | undefined,
    value?: PrimitiveValue
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
  const { children, data = undefined, wrapper, onChange, onSubmit } = props;

  const modifiedFormData = useRef<IFormData>({});

  const alwaysUpdate = useRef<string[]>([]);
  const dependencies = useRef<IDependencies>({});
  const errors = useRef<IErrors>({});
  const focusedKeyValuePair = useRef<IFocusKeyValue>({
    fieldName: undefined,
    fieldValue: undefined,
  });
  const forceUpdates = useRef<IForceUpdates>({});
  const setDatas = useRef<ISetDatas>({});
  const validations = useRef<IValidations>({});

  const calculateIsValid = () => {
    const formData = getFormData() as IFormData;
    const allFields = Object.keys(forceUpdates.current);
    const containsError = allFields.some((f) => {
      const result = triggerFieldValidation({
        fieldName: f,
        fieldValue: get(formData, f) as PrimitiveValue,
      });
      return result;
    });
    return !containsError;
  };

  const clearModifiedFormData = () => {
    modifiedFormData.current = {};
    Object.keys(setDatas.current).forEach((fieldName) => {
      setDatas.current?.[fieldName](
        (get(data, fieldName) as PrimitiveValue) ?? ""
      );
    });
  };

  const deregisterError = (fieldName: string) => {
    errors.current = removeUndefinedFromObject({
      ...errors.current,
      [fieldName]: undefined,
    });
  };

  const deregisterForceUpdate = (fieldName: string) => {
    forceUpdates.current = removeUndefinedFromObject({
      ...forceUpdates.current,
      [fieldName]: undefined,
    });
  };

  const deregisterSetDatas = (fieldName: string) => {
    setDatas.current = removeUndefinedFromObject({
      ...setDatas.current,
      [fieldName]: undefined,
    });
  };

  const deregisterValidations = (fieldName: string) => {
    validations.current = removeUndefinedFromObject({
      ...validations.current,
      [fieldName]: undefined,
    });
  };

  const generateOnChangeProps = (): IOnChangeProps => {
    return {
      clearModifiedFormData,
      formData: getFormData() as IFormData,
      modifiedFormData: modifiedFormData.current,
      isValid: calculateIsValid(),
    };
  };

  const getFormData = (fieldName?: string): IFormData | PrimitiveValue => {
    const formData = {};
    merge(formData, data, modifiedFormData.current);
    if (fieldName) {
      return get(formData, fieldName);
    } else {
      return formData;
    }
  };

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (
      focusedKeyValuePair.current.fieldName !== undefined &&
      focusedKeyValuePair.current.fieldValue !== undefined
    ) {
      setFormData(
        focusedKeyValuePair.current.fieldName,
        focusedKeyValuePair.current.fieldValue
      );
    }
    triggerFormValidation();
    alwaysUpdate.current.forEach((key) => {
      forceUpdates.current[key]();
    });
    onSubmit?.(generateOnChangeProps());
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
    alwaysUpdate.current.forEach((name) => {
      forceUpdates.current[name]();
    });
    onChange?.(generateOnChangeProps());
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

  const registerAlwaysUpdate = (fieldName: string) => {
    if (!alwaysUpdate.current.find((n) => n === fieldName)) {
      alwaysUpdate.current = [...alwaysUpdate.current, fieldName];
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

  const registerFocusedKeyValuePair = (
    fieldName: string | undefined,
    value?: PrimitiveValue
  ) => {
    if (fieldName === undefined) {
      focusedKeyValuePair.current = {
        fieldName: undefined,
        fieldValue: undefined,
      };
    } else if (fieldName !== undefined && value !== undefined) {
      focusedKeyValuePair.current = { fieldName: fieldName, fieldValue: value };
    }
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

  const triggerFormValidation = () => {
    const allFields = Object.keys(forceUpdates.current);
    allFields.forEach((f) => {
      triggerFieldValidation({
        fieldName: f,
        setFieldError: errors.current[f],
      });
    });
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
          calculateIsValid,
          deregisterError,
          deregisterForceUpdate,
          deregisterSetDatas,
          deregisterValidations,
          getFormData,
          registerAlwaysUpdate,
          registerDependencies,
          registerError,
          registerFocusedKeyValuePair,
          registerForceUpdate,
          registerSetData,
          registerValidations,
          setFormData,
          setFormDataWithRerender,
          triggerFieldValidation,
        }}
      >
        {!!wrapper ? (
          React.cloneElement(wrapper, { children: childToRender })
        ) : (
          <form onSubmit={handleSubmit}>{childToRender}</form>
        )}
      </FormContext.Provider>
    </>
  );
}
