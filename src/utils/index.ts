/**
 * A function that converts all object value to string. It does not mutate the input object.
 * @param obj Object to convert.
 * @returns Converted object.
 */
export const convertObjectValueToString = (obj: { [key: string]: any }) => {
  const mutableObject = Object.assign({}, obj);
  const mutateObject = (o: { [key: string]: any }) => {
    Object.keys(o).forEach((k) => {
      if (typeof o[k] === "object") {
        return mutateObject(o[k]);
      }
      o[k] = "" + o[k];
    });
    return o;
  };
  mutateObject(mutableObject);
  return mutableObject;
};

/**
 * A function that removes undefined value from object.
 * @param obj Object with undefined as value.
 * @returns Cleaned object without any undefined as value.
 */
export function removeUndefinedFromObject(
  obj: Record<string, any>
): Record<string, any> {
  const clonedObj = Object.assign({}, obj);
  const mutateObject = (o: { [key: string]: any }) => {
    Object.keys(o).forEach((key) => {
      if (typeof o[key] === "object") {
        return mutateObject(o[key]);
      }
      o[key as keyof typeof o] === undefined && delete o[key as keyof typeof o];
    });
    return o;
  };
  mutateObject(clonedObj);
  return clonedObj;
}

/**
 * A function that removes duplicates from array.
 * @param data array to remove duplicates from.
 * @returns Cleaned array without any duplicates.
 */
export function removeDuplicates<T>(data: T[]): T[] {
  return data.filter((value, index) => data.indexOf(value) === index);
}

/**
 * A function that flattens object to {key: value}
 * @param obj Object to flatten
 * @returns Flattened object
 */
export function flattenObject(obj: Record<string, any>) {
  let mutableObject: Record<string, any> = {};
  const mutateObject = (
    o: Record<string, any>,
    key: string
  ): Record<string, any> => {
    Object.keys(o).forEach((k) => {
      const valueToCompare = o[k];
      if (typeof valueToCompare === "object" && valueToCompare !== null) {
        mutableObject = mutateObject(valueToCompare, `${key}${k}.`);
      } else {
        mutableObject[`${key}${k}`] = valueToCompare;
      }
    });
    return mutableObject;
  };
  return mutateObject(obj, "");
}
