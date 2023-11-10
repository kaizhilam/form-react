import { convertObjectValueToString } from ".";

describe("utils", () => {
  describe("convertObjectValueToString", () => {
    it("SHOULD convert object value to string", () => {
      const obj = { aaa: 111, bbb: true };
      const expectedResult = { aaa: "111", bbb: "true" };
      const result = convertObjectValueToString(obj);
      expect(result).toEqual(expectedResult);
    });
    it("SHOULD convert object value to string in multiple layer", () => {
      const obj = { aaa: 111, bbb: { ccc: true } };
      const expectedResult = { aaa: "111", bbb: { ccc: "true" } };
      const result = convertObjectValueToString(obj);
      expect(result).toEqual(expectedResult);
    });
  });
});
