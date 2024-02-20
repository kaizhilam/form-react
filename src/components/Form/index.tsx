import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import mergeWith from "lodash/mergeWith";
import get from "lodash/get";
import { mergeFunction, reducerFunction } from "./utils";
import { removeUndefinedFromObject } from "../../utils";

export type PrimitiveValue =
  | string
  | number
  | bigint
  | boolean
  | undefined
  | symbol
  | null;

export type FieldValue = PrimitiveValue | PrimitiveValue[];

export type Data = {
  [name: string]: FieldValue | Data | Data[];
};

interface IFormAction {
  modifiedFormData: Data;
  isValid: boolean;
  submit: () => void;
}

interface IForm {
  arrayMergeKeys?: string[];
  children:
    | ((formAction: IFormAction) => JSX.Element)
    | ((formAction: IFormAction) => JSX.Element[]);
  data?: Data;
  onSubmit?: (props: {
    formData: Data;
    isValid?: boolean;
    modifiedFormData: Data;
    clearModifiedFormData: () => void;
  }) => void;
}

export interface IFormValidation {
  name?: string;
  message: string;
  expression?: (data: PrimitiveValue, formData?: Data) => boolean;
  type?: "required";
}

interface IFormContext {
  errors: React.MutableRefObject<Record<string, string>>;
  formData: Data;
  groupIds: React.MutableRefObject<Record<string, string>>;
  setFormValue: (name: string, value: PrimitiveValue, groupId?: string) => void;
  triggerFieldValidation: (
    name: string,
    value: PrimitiveValue
  ) => string | undefined;
  validations: React.MutableRefObject<Record<string, IFormValidation[]>>;
}

interface IReducerPayload {
  groupId?: string;
  name: string;
  value: PrimitiveValue;
}

export enum ReducerAction {
  CLEAR = "CLEAR",
  SET = "SET",
  SET_WITH_GROUP_ID = "SET_WITH_GROUP_ID",
}
export interface IReducerAction {
  payload: IReducerPayload;
  type: ReducerAction;
}

export const FormContext = createContext<IFormContext>({} as IFormContext);

export function Form(props: IForm) {
  const {
    arrayMergeKeys = ["uid"],
    children,
    data = undefined,
    onSubmit,
  } = props;

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const groupIds = useRef<Record<string, string>>({});
  const validations = useRef<Record<string, IFormValidation[]>>({});
  const errors = useRef<Record<string, string>>({});

  const [modifiedFormData, dispatch] = useReducer(
    reducerFunction(data, groupIds.current),
    {}
  );

  const [formData, setFormData] = useState<Data>(data || {});
  useEffect(() => {
    setFormData(
      mergeWith({}, data, modifiedFormData, mergeFunction(arrayMergeKeys))
    );
  }, [modifiedFormData, data]);

  const clearModifiedFormData = useCallback(() => {
    dispatch({ type: ReducerAction.CLEAR, payload: { name: "", value: "" } });
  }, []);

  const isValid = Object.values(errors.current).filter((e) => !!e).length === 0;

  const submit = () => {
    Object.keys(validations.current).forEach((name) => {
      triggerFieldValidation(name, get(formData, name) as PrimitiveValue);
    });
    const formIsValid =
      Object.values(errors.current).filter((e) => !!e).length === 0;
    forceUpdate();
    onSubmit?.({
      isValid: formIsValid,
      formData,
      modifiedFormData,
      clearModifiedFormData,
    });
  };

  const triggerFieldValidation = (
    name: string,
    value: PrimitiveValue
  ): string | undefined => {
    const validationObject = validations.current?.[name]?.find((validation) => {
      if (validation.type === "required") {
        return !value;
      } else {
        return validation.expression?.(value, formData);
      }
    });
    if (validationObject?.message) {
      errors.current = {
        ...errors.current,
        [name]: validationObject.message,
      };
    } else {
      errors.current = removeUndefinedFromObject({
        ...errors.current,
        [name]: undefined,
      });
    }
    return validationObject?.message;
  };

  const handleSubmit = (event: React.SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    onSubmit?.({
      formData,
      isValid: true,
      modifiedFormData,
      clearModifiedFormData,
    });
  };

  const setFormValue = (
    name: string,
    value: PrimitiveValue,
    groupId?: string
  ) => {
    const internalGroupId = groupId ?? groupIds.current?.[name];
    if (internalGroupId) {
      dispatch({
        type: ReducerAction.SET_WITH_GROUP_ID,
        payload: { name, value },
      });
    } else {
      dispatch({ type: ReducerAction.SET, payload: { name, value } });
    }
  };

  const formRef = useRef(null);

  return (
    <FormContext.Provider
      value={{
        errors,
        formData,
        groupIds,
        setFormValue,
        triggerFieldValidation,
        validations,
      }}
    >
      <form ref={formRef} onSubmit={handleSubmit}>
        {children({ modifiedFormData, isValid, submit })}
      </form>
    </FormContext.Provider>
  );
}
