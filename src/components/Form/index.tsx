import React, {
  createContext,
  useState,
  useRef,
  useMemo,
  useEffect,
  useReducer,
} from "react";
import mergeWith from "lodash/mergeWith";
import get from "lodash/get";
import { mergeFunction, reducerFunction } from "./utils";

export type PrimitiveValue =
  | string
  | number
  | bigint
  | boolean
  | undefined
  | symbol
  | null;

export interface IKeyValuePair {
  [name: string]: PrimitiveValue;
}

export interface IKeyValuePairString {
  [key: string]: string;
}

interface IFormAction {
  formData: IKeyValuePair;
  isValid: boolean;
  modifiedFormData: IKeyValuePair;
  submit: () => void;
}

interface IForm {
  arrayMergeKeys?: string[];
  children:
    | ((formAction: IFormAction) => JSX.Element)
    | ((formAction: IFormAction) => JSX.Element[]);
  data?: { [name: string]: any };
  onSubmit?: (props: {
    formData: IKeyValuePair;
    isValid?: boolean;
    modifiedFormData: IKeyValuePair;
    clearModifiedFormData: () => void;
  }) => void;
}

export interface IFormValidation {
  message: string;
  expression?: (data: PrimitiveValue) => boolean;
  type?: "required";
}

interface IFormContext {
  formData: IKeyValuePair;
  getFieldError: (name: string) => string | undefined;
  getFieldValue: (name: string) => PrimitiveValue;
  setFormError: (name: string, value: string) => void;
  setFormGroupId: (name: string, groupId: string | undefined) => void;
  setFormValue: (name: string, value: PrimitiveValue, groupId?: string) => void;
  setFormValidation: (
    name: string,
    validations: IFormValidation[],
    required: boolean
  ) => void;
  triggerFieldValidation: (
    name: string,
    value: PrimitiveValue
  ) => string | undefined;
}

export enum ReducerAction {
  CLEAR = "CLEAR",
  SET = "SET",
  SET_WITH_GROUP_ID = "SET_WITH_GROUP_ID",
}

interface IReducerPayload {
  groupId?: string;
  name: string;
  value: PrimitiveValue;
}

export interface IReducerAction {
  payload: IReducerPayload;
  type: ReducerAction;
}

export const FormContext = createContext<IFormContext>({} as IFormContext);

export function Form(props: IForm) {
  const { arrayMergeKeys, children, data = undefined, onSubmit } = props;
  // useEffect(() => {
  //   console.log("streamData", data);
  // }, [data]);

  const [formValidations, setFormValidations] = useState<{
    [key: string]: IFormValidation[];
  }>({});
  // useEffect(() => {
  //   console.log("formValidations", formValidations);
  // }, [formValidations]);

  const [errors, setErrors] = useState<IKeyValuePairString>({});
  // useEffect(() => {
  //   console.log("errors", errors);
  // }, [errors]);

  const [groupIds, setGroupIds] = useState<IKeyValuePairString>({});
  // useEffect(() => {
  //   console.log("groupIds", groupIds);
  // }, [groupIds]);

  const [isValid, setIsValid] = useState<boolean>(false);

  const [modifiedFormData, dispatch] = useReducer(
    reducerFunction(data, groupIds),
    {}
  );

  const formData = useMemo(() => {
    return mergeWith({}, data, modifiedFormData, mergeFunction(arrayMergeKeys));
  }, [modifiedFormData, data]);

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

  useEffect(() => {
    let isFormValid = true;
    Object.keys(formValidations).forEach((name) => {
      const fieldData = get(formData, name);
      const validationMessage = triggerFieldValidation(name, fieldData);
      if (validationMessage) {
        isFormValid = false;
      }
    });
    setIsValid(isFormValid);
  }, [formData]);

  const formRef = useRef(null);

  const getFieldError = (name: string): string => {
    return errors[name];
  };

  const setFormGroupId = (name: string, groupId: string | undefined) => {
    groupId && setGroupIds((prev) => ({ ...prev, [name]: groupId }));
  };

  const getFieldValue = (name: string): PrimitiveValue => {
    return get(formData, name);
  };

  const setFormError = (name: string, value: string) => {
    setErrors((prev) => ({ ...prev, [name]: value }));
  };

  const setFormValue = (
    name: string,
    value: PrimitiveValue,
    groupId?: string
  ) => {
    const internalGroupId = groupId ?? groupIds[name];
    if (!!internalGroupId) {
      dispatch({
        type: ReducerAction.SET_WITH_GROUP_ID,
        payload: { groupId: internalGroupId, name, value },
      });
    } else {
      dispatch({ type: ReducerAction.SET, payload: { name, value } });
    }
  };

  const setFormValidation = (
    name: string,
    validations: IFormValidation[],
    required: boolean
  ) => {
    if (required) {
      validations.unshift({
        message: "This field is required",
        type: "required",
      });
    }
    const sortedValidations = validations.sort((validation) =>
      validation.type === "required" ? -1 : 1
    );
    setFormValidations((prev) => ({ ...prev, [name]: sortedValidations }));
  };

  const triggerFieldValidation = (
    name: string,
    value: PrimitiveValue
  ): string | undefined => {
    const validationObject = formValidations?.[name]?.find((validation) => {
      if (validation.type === "required") {
        return !value;
      } else {
        return validation.expression?.(value);
      }
    });
    if (validationObject?.message) {
      setFormError(name, validationObject.message);
    } else {
      setFormError(name, "");
    }
    return validationObject?.message;
  };

  const clearModifiedFormData = () => {
    dispatch({ type: ReducerAction.CLEAR, payload: { name: "", value: "" } });
  };

  const submit = () => {
    let isFormValid = true;
    Object.keys(formValidations).forEach((name) => {
      const validationMessage = triggerFieldValidation(
        name,
        get(formData, name)
      );
      if (!!validationMessage) {
        isFormValid = false;
      }
    });
    setIsValid(isFormValid);
    onSubmit?.({
      isValid: isFormValid,
      formData,
      modifiedFormData,
      clearModifiedFormData,
    });
  };

  const handleSubmit = (event: React.SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        getFieldError,
        setFormError,
        setFormGroupId,
        setFormValue,
        setFormValidation,
        triggerFieldValidation,
        getFieldValue,
      }}
    >
      <form ref={formRef} onSubmit={handleSubmit}>
        {children({ submit, formData, isValid, modifiedFormData })}
      </form>
    </FormContext.Provider>
  );
}
