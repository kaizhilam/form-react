import mergeWith from "lodash/mergeWith";
import { mergeFunction } from "./utils";

describe("utils", () => {
  describe("mergeFunction", () => {
    const defaultMergeFunction = mergeFunction();
    let result = {};
    beforeEach(() => {
      result = {};
    });
    describe("Object merging", () => {
      it("SHOULD merge simple object", () => {
        const data = { aaa: 111 };
        const modifiedData = { bbb: 222 };
        mergeWith(result, data, modifiedData, defaultMergeFunction);
        expect(result).toEqual({ aaa: 111, bbb: 222 });
      });
      it("SHOULD replace simple object", () => {
        const data = { aaa: 111, bbb: 222 };
        const modifiedData = { aaa: 222 };
        mergeWith(result, data, modifiedData, defaultMergeFunction);
        expect(result).toEqual({ aaa: 222, bbb: 222 });
      });
      it("SHOULD use original data if modified data is undefined", () => {
        const data = { aaa: 111 };
        const modifiedData = { aaa: undefined };
        mergeWith(result, data, modifiedData, defaultMergeFunction);
        expect(result).toEqual({ aaa: 111 });
      });
      it("SHOULD merge empty string with modified data as priority", () => {
        const data = { aaa: "aaa" };
        const modifiedData = { aaa: "" };
        mergeWith(result, data, modifiedData, defaultMergeFunction);
        expect(result).toEqual({ aaa: "" });
      });
    });
    describe("Array merging", () => {
      it("SHOULD merge object in array via uid", () => {
        const data = { arr: [{ uid: 1, aaa: 111 }] };
        const modifiedData = { arr: [{ uid: 1, bbb: 222 }] };
        mergeWith(result, data, modifiedData, defaultMergeFunction);
        expect(result).toEqual({ arr: [{ uid: 1, aaa: 111, bbb: 222 }] });
      });
      it("SHOULD replace object in array via uid", () => {
        const data = {
          arr: [
            { uid: 1, aaa: 111 },
            { uid: 2, bbb: 222 },
          ],
        };
        const modifiedData = { arr: [{ uid: 1, aaa: 222 }] };
        mergeWith(result, data, modifiedData, defaultMergeFunction);
        expect(result).toEqual({
          arr: [
            { uid: 1, aaa: 222 },
            { uid: 2, bbb: 222 },
          ],
        });
      });
      it("SHOULD merge and replace object in array via uid", () => {
        const data = {
          arr: [
            { uid: 1, aaa: 111 },
            { uid: 2, bbb: 222 },
          ],
        };
        const modifiedData = { arr: [{ uid: 1, bbb: 222 }] };
        mergeWith(result, data, modifiedData, defaultMergeFunction);
        expect(result).toEqual({
          arr: [
            { uid: 1, aaa: 111, bbb: 222 },
            { uid: 2, bbb: 222 },
          ],
        });
      });
      it("SHOULD add object at the end of the array if uid does not exist", () => {
        const data = { arr: [{ aaa: 111 }, { bbb: 222 }] };
        const modifiedData = { arr: [{ ccc: 333 }] };
        mergeWith(result, data, modifiedData, defaultMergeFunction);
        expect(result).toEqual({
          arr: [{ aaa: 111 }, { bbb: 222 }, { ccc: 333 }],
        });
      });
      it("SHOULD ignore undefined array", () => {
        const data = {
          arr: [
            { uid: 1, aaa: 111 },
            { uid: 2, bbb: 222 },
            { uid: 3, ccc: 333 },
            { uid: 4, ddd: 444 },
          ],
        };
        const modifiedData = {
          arr: [undefined, { uid: 2, aaa: 111 }, undefined, undefined],
        };
        mergeWith(result, data, modifiedData, defaultMergeFunction);
        expect(result).toEqual({
          arr: [
            { uid: 1, aaa: 111 },
            { uid: 2, aaa: 111, bbb: 222 },
            { uid: 3, ccc: 333 },
            { uid: 4, ddd: 444 },
          ],
        });
      });
      it("SHOULD use custom uid if provided", () => {
        const data = {
          arr: [
            { qwe: 1, aaa: 111 },
            { qwe: 2, bbb: 222 },
            { qwe: 3, ccc: 333 },
            { qwe: 4, ddd: 444 },
          ],
        };
        const modifiedData = {
          arr: [{ qwe: 2, aaa: 111 }],
        };
        const customMergeFunction = mergeFunction(["qwe"]);
        mergeWith(result, data, modifiedData, customMergeFunction);
        expect(result).toEqual({
          arr: [
            { qwe: 1, aaa: 111 },
            { qwe: 2, aaa: 111, bbb: 222 },
            { qwe: 3, ccc: 333 },
            { qwe: 4, ddd: 444 },
          ],
        });
      });
      it("SHOULD use other custom uid if more than 1 is provided", () => {
        const data = {
          arr: [
            { qwe: 1, aaa: 111 },
            { qwe: 2, bbb: 222 },
            { qwe: 3, rty: 3, ccc: 333 },
            { qwe: 4, ddd: 444 },
          ],
        };
        const modifiedData = {
          arr: [{ rty: 3, aaa: 111 }],
        };
        const customMergeFunction = mergeFunction(["qwe", "rty"]);
        mergeWith(result, data, modifiedData, customMergeFunction);
        expect(result).toEqual({
          arr: [
            { qwe: 1, aaa: 111 },
            { qwe: 2, bbb: 222 },
            { qwe: 3, rty: 3, aaa: 111, ccc: 333 },
            { qwe: 4, ddd: 444 },
          ],
        });
      });
    });
  });
});
