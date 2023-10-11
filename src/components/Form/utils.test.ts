import mergeWith from "lodash/mergeWith";
import { mergeFunction, reducerFunction } from "./utils";
import { ReducerAction } from ".";

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
  describe("reducerFunction", () => {
    const defaultReducer = reducerFunction({}, {});
    let result = {};
    beforeEach(() => {
      result = {};
    });
    describe("set", () => {
      it("SHOULD set data", () => {
        result = defaultReducer(
          {},
          {
            type: ReducerAction.SET,
            payload: { name: "testKey", value: "testValue" },
          }
        );
        expect(result).toEqual({ testKey: "testValue" });
      });
      it("SHOULD add data", () => {
        result = defaultReducer(
          { aaa: "111" },
          {
            type: ReducerAction.SET,
            payload: { name: "testKey", value: "testValue" },
          }
        );
        expect(result).toEqual({ testKey: "testValue", aaa: "111" });
      });
      it("SHOULD replace data", () => {
        result = defaultReducer(
          { testKey: "should be replaced" },
          {
            type: ReducerAction.SET,
            payload: { name: "testKey", value: "replaced value" },
          }
        );
        expect(result).toEqual({ testKey: "replaced value" });
      });
    });
    describe("set with group id", () => {
      it("SHOULD set data with group id", () => {
        const groupIdReducer = reducerFunction(
          {
            // @ts-ignore
            arr: [
              {
                uid: "1",
                familyName: "Edwards",
                givenName: "Dylan",
              },
              {
                uid: "2",
                familyName: "Smith",
                givenName: "Chris",
                playerTradingOpinion: {
                  jerseyNumber: 2,
                },
              },
            ],
          },
          {
            "arr.0.uid": "1",
            "arr.0.familyName": "1",
            "arr.0.givenName": "1",
            "arr.1.uid": "2",
            "arr.1.familyName": "2",
            "arr.1.givenName": "2",
          }
        );
        result = groupIdReducer(
          {},
          {
            type: ReducerAction.SET_WITH_GROUP_ID,
            payload: {
              name: "arr.0.familyName",
              value: "Test",
              groupId: "1",
            },
          }
        );
        expect(result).toEqual({
          arr: [
            {
              familyName: "Test",
              givenName: "Dylan",
              uid: "1",
            },
          ],
        });
      });
    });
    describe("clear", () => {
      it("SHOULD clear data", () => {
        result = defaultReducer(
          {},
          { type: ReducerAction.CLEAR, payload: { name: "", value: "" } }
        );
        expect(result).toEqual({});
      });
      it("SHOULD clear data even when data exist", () => {
        result = reducerFunction({ test: "test" }, {})(
          {},
          { type: ReducerAction.CLEAR, payload: { name: "", value: "" } }
        );
        expect(result).toEqual({});
      });
    });
  });
});
