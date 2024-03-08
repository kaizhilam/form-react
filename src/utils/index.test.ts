import {
  convertObjectValueToString,
  removeDuplicates,
  removeUndefinedFromObject,
} from ".";

describe("utils", () => {
  describe("convertObjectValueToString", () => {
    it("SHOULD convert object value to string", () => {
      const obj = { aaa: 111, bbb: true };
      const expectedResult = { aaa: "111", bbb: "true" };
      const result = convertObjectValueToString(obj);
      expect(result).toStrictEqual(expectedResult);
    });
    it("SHOULD convert object value to string in multiple layer", () => {
      const obj = { aaa: 111, bbb: { ccc: true } };
      const expectedResult = { aaa: "111", bbb: { ccc: "true" } };
      const result = convertObjectValueToString(obj);
      expect(result).toStrictEqual(expectedResult);
    });
  });
  describe("removeUndefinedFromObject", () => {
    it("SHOULD remove any undefined value in object", () => {
      const obj = { aaa: 111, bbb: 222, ccc: undefined };
      const expectedResult = { aaa: 111, bbb: 222 };
      const result = removeUndefinedFromObject(obj);
      expect(result).toStrictEqual(expectedResult);
    });
    it("SHOULD remove any undefined value in object in multiple layer", () => {
      const obj = {
        aaa: 111,
        bbb: { aaa: 111, bbb: { aaa: 111, bbb: undefined, ccc: 333 } },
      };
      const expectedResult = {
        aaa: 111,
        bbb: { aaa: 111, bbb: { aaa: 111, ccc: 333 } },
      };
      const result = removeUndefinedFromObject(obj);
      expect(result).toStrictEqual(expectedResult);
    });
  });
  describe("removeDuplicates", () => {
    it("SHOULD remove duplicates from array", () => {
      const arr = [1, 2, 3, 4, 5, 1, 1, 1];
      const expectedResult = [1, 2, 3, 4, 5];
      const result = removeDuplicates(arr);
      expect(result).toStrictEqual(expectedResult);
    });
  });
});
