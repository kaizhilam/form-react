import mergeWith from "lodash/mergeWith";
import isArray from "lodash/isArray";
import get from "lodash/get";
import merge from "lodash/merge";
import set from "lodash/set";
import { Data, IReducerAction, ReducerAction } from ".";
import { useEffect, useRef } from "react";

export const mergeFunction = (arrayMergeKeys = ["uid"]) => {
  return (objValue: any, srcValue: any, key: string, obj: {}, src: {}) => {
    if (isArray(srcValue)) {
      if (objValue === undefined) return srcValue;
      const allArr = [...objValue];
      srcValue.forEach((n) => {
        if (n === undefined) return;
        const chosenKey = arrayMergeKeys.find((k) => k in n);
        if (chosenKey === undefined) {
          allArr.push(n);
          return;
        }
        const indexToReplace = allArr.findIndex(
          (a) => a[chosenKey] === n[chosenKey]
        );
        if (indexToReplace !== -1) {
          const objToReplace = mergeWith(
            {},
            allArr[indexToReplace],
            n,
            mergeFunction(arrayMergeKeys)
          );
          allArr[indexToReplace] = objToReplace;
        } else {
          allArr.push(n);
        }
      });
      return allArr;
    }
    return srcValue;
  };
};

export const reducerFunction = (
  data: Data = {},
  groupIds: Record<string, string>
) => {
  return (state: Data, action: IReducerAction) => {
    const { type, payload } = action;
    const { name, value, groupId } = payload;
    let toMerge = {};
    switch (type) {
      case ReducerAction.SET:
        set(toMerge, name, value);
        return merge({}, state, toMerge);
      case ReducerAction.SET_WITH_GROUP_ID:
        Object.keys(groupIds).forEach((key) => {
          if (groupIds[key] === groupId && key !== name) {
            set(toMerge, key, get(state, key) ?? get(data, key));
          }
        });
        set(toMerge, name, value);
        return merge({}, state, toMerge);
      case ReducerAction.CLEAR:
        return {};
      default:
        return state;
    }
  };
};
