import { get, set } from "lodash";
import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import {
  flattenObject,
  removeDuplicates,
  removeUndefinedFromObject,
} from "../../utils";

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

interface ISetErrors {
  [key: string]: (errorMessage: string) => void;
}

interface IFieldWithError {
  [key: string]: boolean;
}

interface IForceUpdates {
  [key: string]: () => void;
}

interface IFocusKeyValue {
  fieldName: string | undefined;
  fieldValue: PrimitiveValue | undefined;
}

interface IRegisterNameDependenciesParam {
  fieldName: string;
  setError: (error: string) => void;
  forceUpdate: () => void;
  setData: (data: PrimitiveValue) => void;
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

interface IModifiedFormData {
  [name: string]: PrimitiveValue;
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
    | ((formChildProps: {
        submit: () => void;
        isValid: boolean;
      }) => React.ReactNode);
  data?: IFormData;
  wrapper?: React.ReactElement;
  onChange?: (onChangeProps: IOnChangeProps) => void;
  onSubmit?: (onSubmitProps: IOnChangeProps) => void;
}

interface IFormContext {
  deregisterNameDependencies: (fieldName: string) => void;
  deregisterValidations: (fieldName: string) => void;
  getFormData: (fieldName?: string) => IFormData | PrimitiveValue;
  registerDependencies: (fieldName: string, dependency: string) => void;
  registerFocusedKeyValuePair: (
    fieldName: string | undefined,
    value?: PrimitiveValue
  ) => void;
  registerNameDependencies: (param: IRegisterNameDependenciesParam) => void;
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

  const [, forceFormUpdate] = useReducer((x) => x + 1, 0);

  const prepopData = useMemo(() => {
    // console.log("prepop update");
    if (data !== undefined) {
      return flattenObject(data);
    } else {
      return {};
    }
  }, [data]);
  const modifiedFormData = useRef<IModifiedFormData>({});

  const alwaysUpdate = useRef<string[]>([]);
  const dependencies = useRef<IDependencies>({});
  const fieldWithError = useRef<IFieldWithError>({});
  const focusedKeyValuePair = useRef<IFocusKeyValue>({
    fieldName: undefined,
    fieldValue: undefined,
  });
  const forceUpdates = useRef<IForceUpdates>({});
  const isValid = useRef<boolean>(true);
  const setDatas = useRef<ISetDatas>({});
  const setErrors = useRef<ISetErrors>({});
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
        (prepopData[fieldName] as PrimitiveValue) ?? ""
      );
    });
  };

  const deregisterNameDependencies = (fieldName: string) => {
    forceUpdates.current = removeUndefinedFromObject({
      ...forceUpdates.current,
      [fieldName]: undefined,
    });
    setDatas.current = removeUndefinedFromObject({
      ...setDatas.current,
      [fieldName]: undefined,
    });
    setErrors.current = removeUndefinedFromObject({
      ...setErrors.current,
      [fieldName]: undefined,
    });
    fieldWithError.current = removeUndefinedFromObject({
      ...fieldWithError.current,
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
    const modifiedFormDataToReturn = {};
    Object.keys(modifiedFormData.current).forEach((key) => {
      set(modifiedFormDataToReturn, key, modifiedFormData.current[key]);
    });
    return {
      clearModifiedFormData,
      formData: getFormData() as IFormData,
      modifiedFormData: modifiedFormDataToReturn,
      isValid: calculateIsValid(),
    };
  };

  const getFormData = (fieldName?: string): IFormData | PrimitiveValue => {
    const formData: IFormData = {};
    Object.keys(prepopData).forEach((k) => {
      set(formData, k, prepopData[k]);
    });
    Object.keys(modifiedFormData.current).forEach((k) => {
      set(formData, k, modifiedFormData.current[k]);
    });
    if (fieldName) {
      return get(formData, fieldName) as IFormData | PrimitiveValue;
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

  const registerNameDependencies = (param: IRegisterNameDependenciesParam) => {
    const { fieldName, forceUpdate, setData, setError } = param;
    forceUpdates.current = {
      ...forceUpdates.current,
      [fieldName]: forceUpdate,
    };
    setDatas.current = {
      ...setDatas.current,
      [fieldName]: setData,
    };
    setErrors.current = {
      ...setErrors.current,
      [fieldName]: setError,
    };
    fieldWithError.current = {
      ...fieldWithError.current,
      [fieldName]: false,
    };
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

  const registerValidations = (
    fieldName: string,
    fieldValidations: IFieldValidation[]
  ) => {
    validations.current = {
      ...validations.current,
      [fieldName]: fieldValidations,
    };
  };

  const setFormData = (fieldName: string, value: PrimitiveValue) => {
    modifiedFormData.current[fieldName] = value;
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
      setDatas.current?.[fieldName]?.(value);
      triggerFieldValidation({
        fieldName,
        fieldValue: value,
        setFieldError: setErrors.current[fieldName],
      });
      forceUpdates.current?.[fieldName]?.();
    }
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
        const valueToUse = (modifiedFormData.current?.[fieldName] ??
          prepopData?.[fieldName]) as PrimitiveValue;
        return v.expression?.(valueToUse, getFormData() as IFormData);
      }
    });
    if (validationTriggered) {
      setFieldError?.(validationTriggered.message);
      fieldWithError.current = {
        ...fieldWithError.current,
        [fieldName]: true,
      };
    } else {
      setFieldError?.("");
      fieldWithError.current = {
        ...fieldWithError.current,
        [fieldName]: false,
      };
    }
    const newIsValid = !Object.values(fieldWithError.current).some((v) => !!v);
    if (isValid.current !== newIsValid) {
      isValid.current = newIsValid;
      forceFormUpdate();
    }
    return validationTriggered;
  };

  const triggerFormValidation = () => {
    const allFields = Object.keys(forceUpdates.current);
    allFields.forEach((f) => {
      triggerFieldValidation({
        fieldName: f,
        setFieldError: setErrors.current[f],
      });
    });
  };

  useEffect(() => {
    Object.keys(prepopData).forEach((k) => {
      setDatas.current[k](prepopData[k]);
    });
    calculateIsValid();
  }, []);

  const childToRender =
    typeof children === "function"
      ? children({
          submit: handleSubmit,
          get isValid() {
            return isValid.current;
          },
        })
      : children;

  // console.log("render form");

  return (
    <>
      <FormContext.Provider
        value={{
          deregisterNameDependencies,
          deregisterValidations,
          getFormData,
          registerDependencies,
          registerFocusedKeyValuePair,
          registerNameDependencies,
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
