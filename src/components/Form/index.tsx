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
import isArray from "lodash/isArray";
import values from "lodash/values";
import keyBy from "lodash/keyBy";

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
  setFormGroupId: (name: string, groupId: string | undefined) => void;
  setFormValue: (name: string, value: string) => void;
  setFormValidation: (
    name: string,
    validations: IFormValidation[],
    required: boolean
  ) => void;
  triggerFieldValidation: (name: string, value: string) => boolean;
}

export const FormContext = createContext<IFormContext>({} as IFormContext);

export function Form(props: IForm) {
  const { children, data = {}, onSubmit } = props;

  const [modifiedFormData, setModifiedFormData] = useState<IKeyValuePair>({});
  const formData = useMemo(
    () =>
      mergeWith({}, data, modifiedFormData, (objValue, srcValue) => {
        if (isArray(objValue)) {
          const mergedArr = values(
            merge({}, keyBy(objValue, "uid"), keyBy(srcValue, "uid"))
          );
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

  useEffect(() => {
    console.log("formData", formData);
  }, [formData]);

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

  const [groupIds, setGroupIds] = useState<IKeyValuePair>({});
  // useEffect(() => {
  //   console.log("groupIds", groupIds);
  // }, [groupIds]);

  useEffect(() => {
    Object.keys(formValidations).forEach((name) => {
      triggerFieldValidation(name, get(formData, name));
    });
  }, [data]);

  const formRef = useRef(null);

  const getFieldError = (name: string): string => {
    return errors[name];
  };

  const setFormGroupId = (name: string, groupId: string | undefined) => {
    groupId && setGroupIds((prev) => ({ ...prev, [name]: groupId }));
  };

  const getFieldValue = (name: string): string => {
    return get(formData, name);
  };

  const setFormError = (name: string, value: string) => {
    setErrors((prev) => ({ ...prev, [name]: value }));
  };

  const setFormValue = (name: string, value: string) => {
    const groupId = groupIds[name];
    if (groupId !== undefined) {
      const fieldWithSameGroupIdList = Object.keys(groupIds).filter(
        (key) => groupIds[key] === groupId
      );
      let toMerge = {};
      fieldWithSameGroupIdList.forEach((val) => {
        if (name === val) {
          toMerge = set({ ...toMerge }, name, value);
        } else {
          toMerge = set({ ...toMerge }, val, getFieldValue(val));
        }
      });
      setModifiedFormData((prev) => ({
        ...prev,
        ...merge({}, prev, toMerge),
      }));
    } else {
      const toMerge = set({}, name, value);
      setModifiedFormData((prev) => ({
        ...prev,
        ...merge({}, prev, toMerge),
      }));
    }
  };

  const setFormValidation = (
    name: string,
    validations: IFormValidation[],
    required: boolean
  ) => {
    let validationToUse = [...validations];
    if (required) {
      validationToUse = [
        {
          message: "This field is required",
          type: "required",
        },
        ...validationToUse,
      ];
    }
    const sortedValidations = validationToUse.sort((validation) =>
      validation.type === "required" ? -1 : 1
    );
    setFormValidations((prev) => ({ ...prev, [name]: sortedValidations }));
  };

  const triggerFieldValidation = (name: string, value: string): boolean => {
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
    return !!validationObject?.message;
  };

  const handleSubmit = (event: React.SyntheticEvent<HTMLElement>) => {
    let isValid = true;
    event.preventDefault();
    Object.keys(formValidations).forEach((key) => {
      const validationMessage = triggerFieldValidation(key, getFieldValue(key));
      if (validationMessage) {
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
        setFormGroupId,
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
