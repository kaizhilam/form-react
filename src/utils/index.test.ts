import {
  convertObjectValueToString,
  flattenObject,
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
  describe("flattenObject", () => {
    it("SHOULD flatten level 1 object", () => {
      const obj = { level1a: 111, level1b: true };
      const expectedResult = { level1a: 111, level1b: true };
      const result = flattenObject(obj);
      expect(result).toStrictEqual(expectedResult);
    });
    it("SHOULD flatten level 2 object", () => {
      const obj = { level1a: { level2a: 111, level2b: 222 }, level1b: true };
      const expectedResult = {
        "level1a.level2a": 111,
        "level1a.level2b": 222,
        level1b: true,
      };
      const result = flattenObject(obj);
      expect(result).toStrictEqual(expectedResult);
    });
    it("SHOULD flatten level 3 object", () => {
      const obj = {
        level1a: { level2a: 111, level2b: { level3a: 111, level3b: 222 } },
        level1b: true,
      };
      const expectedResult = {
        "level1a.level2a": 111,
        "level1a.level2b.level3a": 111,
        "level1a.level2b.level3b": 222,
        level1b: true,
      };
      const result = flattenObject(obj);
      expect(result).toStrictEqual(expectedResult);
    });
    it("SHOULD flatten array", () => {
      const obj = {
        level1a: {
          level2a: 111,
          level2b: { level3a: [111, 222, 333], level3b: 222 },
        },
        level1b: true,
      };
      const expectedResult = {
        "level1a.level2a": 111,
        "level1a.level2b.level3a.0": 111,
        "level1a.level2b.level3a.1": 222,
        "level1a.level2b.level3a.2": 333,
        "level1a.level2b.level3b": 222,
        level1b: true,
      };
      const result = flattenObject(obj);
      expect(result).toStrictEqual(expectedResult);
    });
    it("SHOULD flatten array object", () => {
      const obj = {
        level1a: {
          level2a: 111,
          level2b: {
            level3a: [{ array1a: 111, array1b: 222 }, 222, 333],
            level3b: 222,
          },
        },
        level1b: true,
      };
      const expectedResult = {
        "level1a.level2a": 111,
        "level1a.level2b.level3a.0.array1a": 111,
        "level1a.level2b.level3a.0.array1b": 222,
        "level1a.level2b.level3a.1": 222,
        "level1a.level2b.level3a.2": 333,
        "level1a.level2b.level3b": 222,
        level1b: true,
      };
      const result = flattenObject(obj);
      expect(result).toStrictEqual(expectedResult);
    });
    it("SHOULD flatten array undefined", () => {
      const obj = {
        level1a: {
          level2a: 111,
          level2b: {
            level3a: [undefined, 222, undefined],
            level3b: 222,
          },
        },
        level1b: true,
      };
      const expectedResult = {
        "level1a.level2a": 111,
        "level1a.level2b.level3a.0": undefined,
        "level1a.level2b.level3a.1": 222,
        "level1a.level2b.level3a.2": undefined,
        "level1a.level2b.level3b": 222,
        level1b: true,
      };
      const result = flattenObject(obj);
      expect(result).toStrictEqual(expectedResult);
    });
    it("SHOULD flatten object undefined", () => {
      const obj = {
        level1a: {
          level2a: 111,
          level2b: {
            level3a: undefined,
            level3b: 222,
          },
        },
        level1b: true,
      };
      const expectedResult = {
        "level1a.level2a": 111,
        "level1a.level2b.level3a": undefined,
        "level1a.level2b.level3b": 222,
        level1b: true,
      };
      const result = flattenObject(obj);
      expect(result).toStrictEqual(expectedResult);
    });
    it("SHOULD flatten object null", () => {
      const obj = {
        level1a: {
          level2a: 111,
          level2b: {
            level3a: null,
            level3b: 222,
          },
        },
        level1b: true,
      };
      const expectedResult = {
        "level1a.level2a": 111,
        "level1a.level2b.level3a": null,
        "level1a.level2b.level3b": 222,
        level1b: true,
      };
      const result = flattenObject(obj);
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
