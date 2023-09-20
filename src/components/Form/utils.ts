import mergeWith from "lodash/mergeWith";
import isArray from "lodash/isArray";

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
