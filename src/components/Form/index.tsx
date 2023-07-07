import React, {
  createContext,
  useState,
  useRef,
  useMemo,
  useEffect,
} from "react";
import set from "lodash/set";
import merge from "lodash/merge";
import mergeWith from "lodash/mergeWith";
import get from "lodash/get";
import isArray from "lodash/isArray";
import values from "lodash/values";
import keyBy from "lodash/keyBy";
import { isEmpty } from "lodash";

export type PrimitiveValue =
  | string
  | number
  | bigint
  | boolean
  | undefined
  | symbol
  | null;

interface IKeyValuePair {
  [name: string]: PrimitiveValue;
}

interface IKeyValuePairString {
  [key: string]: string;
}

interface IFormAction {
  submit: () => void;
  isValid: boolean;
  formData: IKeyValuePair;
}

interface IForm {
  children:
    | ((formAction: IFormAction) => JSX.Element)
    | ((formAction: IFormAction) => JSX.Element[]);
  data?: { [name: string]: any };
  onSubmit?: (props: {
    isValid?: boolean;
    formData: IKeyValuePair;
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

export const FormContext = createContext<IFormContext>({} as IFormContext);

export function Form(props: IForm) {
  const { children, data = undefined, onSubmit } = props;

  const [modifiedFormData, setModifiedFormData] = useState<IKeyValuePair>({});
  const formData = useMemo(
    () =>
      mergeWith({}, data, modifiedFormData, (objValue, srcValue) => {
        if (isArray(objValue)) {
          const combinedArr = objValue.concat(srcValue);
          const mergedArr: IKeyValuePair[] = [];
          combinedArr.forEach((el) => {
            if (!isEmpty(el)) {
              const indexToAdd = mergedArr.findIndex((o) => o.uid === el.uid);
              if (indexToAdd === -1) {
                mergedArr.push(el);
              } else {
                mergedArr[indexToAdd] = el;
              }
            }
          });
          return mergedArr;
        }
        if (srcValue === "") {
          return objValue;
        }
        return srcValue;
      }),
    [modifiedFormData, data]
  );
  // useEffect(() => {
  //   console.log("streamData", data);
  // }, [data]);

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

  const [errors, setErrors] = useState<IKeyValuePairString>({});
  // useEffect(() => {
  //   console.log("errors", errors);
  // }, [errors]);

  const [groupIds, setGroupIds] = useState<IKeyValuePairString>({});
  // useEffect(() => {
  //   console.log("groupIds", groupIds);
  // }, [groupIds]);

  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    let isFormValid = true;
    Object.keys(formValidations).forEach((name) => {
      const fieldData = get(formData, name);
      if (!isEmpty(fieldData)) {
        const validationMessage = triggerFieldValidation(name, fieldData);
        if (!!validationMessage) {
          isFormValid = false;
        }
      }
    });
    setIsValid(isFormValid);
  }, [formData, formValidations]);

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
    setModifiedFormData((prev) => {
      const internalGroupId = groupId ?? groupIds[name];
      if (internalGroupId !== undefined) {
        const fieldWithSameGroupIdList = Object.keys(groupIds).filter(
          (key) => groupIds[key] === internalGroupId
        );
        let toMerge = {};
        fieldWithSameGroupIdList.forEach((val) => {
          if (name === val) {
            toMerge = set(toMerge, name, value);
          } else {
            toMerge = set(toMerge, val, get(prev, val) ?? get(formData, val));
          }
        });
        if (groupId && name) {
          toMerge = set(toMerge, name, value);
        }
        return merge({}, prev, toMerge);
      } else {
        const toMerge = set({}, name, value);
        return merge({}, prev, toMerge);
      }
    });
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
    setModifiedFormData({});
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
        {children({ submit, formData, isValid })}
      </form>
    </FormContext.Provider>
  );
}
