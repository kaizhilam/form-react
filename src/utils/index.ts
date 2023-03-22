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
