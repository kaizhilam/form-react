import React from "react";
import { render, screen } from "@testing-library/react";
import { Form, IFormData } from ".";
import { FormItem } from "../FormItem";
import { act } from "react-dom/test-utils";
import { simulateUserChange } from "../../utils/testUtils";

describe("Form", () => {
  describe("render child", () => {
    it("SHOULD render as React.ReactNode", () => {
      const { baseElement } = render(
        <Form>
          <span>hello world</span>
        </Form>
      );
      expect(baseElement).toMatchInlineSnapshot(`
        <body>
          <div>
            <form>
              <span>
                hello world
              </span>
            </form>
          </div>
        </body>
      `);
    });
    it("SHOULD render as function", () => {
      const { baseElement } = render(
        <Form>{() => <span>hello world</span>}</Form>
      );
      expect(baseElement).toMatchInlineSnapshot(`
        <body>
          <div>
            <form>
              <span>
                hello world
              </span>
            </form>
          </div>
        </body>
      `);
    });
    it("SHOULD render as form", () => {
      const { baseElement } = render(
        <Form>{() => <span>hello world</span>}</Form>
      );
      expect(baseElement).toMatchInlineSnapshot(`
        <body>
          <div>
            <form>
              <span>
                hello world
              </span>
            </form>
          </div>
        </body>
      `);
    });
    it("SHOULD render as div", () => {
      const { baseElement } = render(
        <Form div>{() => <span>hello world</span>}</Form>
      );
      expect(baseElement).toMatchInlineSnapshot(`
        <body>
          <div>
            <div>
              <span>
                hello world
              </span>
            </div>
          </div>
        </body>
      `);
    });
  });
  describe("submit", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });
    const submit = jest.fn();
    const renderComponent = (initialData?: IFormData) => {
      return render(
        <Form onSubmit={submit} data={initialData}>
          <FormItem id="test" name="test">
            {({ name, onChange, onBlur }) => {
              return (
                <input
                  name={name}
                  onChange={onChange}
                  onBlur={onBlur}
                  data-testid={name}
                />
              );
            }}
          </FormItem>
          <button type="submit" data-testid="submit">
            Submit
          </button>
        </Form>
      );
    };
    it("SHOULD run submit on submit button click", () => {
      renderComponent();
      const submitButton = screen.getByTestId("submit");
      act(() => submitButton.click());
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: true,
          formData: {},
          modifiedFormData: {},
        })
      );
    });
    it("SHOULD show only formData on prepop scenario", () => {
      renderComponent({ test: "111" });
      const submitButton = screen.getByTestId("submit");
      act(() => submitButton.click());
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: { test: "111" },
          modifiedFormData: {},
        })
      );
    });
    it("SHOULD show modifiedData", async () => {
      renderComponent({ test: "111" });
      const input = screen.getByTestId("test");
      simulateUserChange(input, { target: { value: "testValue" } });
      const submitButton = screen.getByTestId("submit");
      act(() => submitButton.click());
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: { test: "testValue" },
          modifiedFormData: { test: "testValue" },
        })
      );
    });
    it("SHOULD clear modified form data on call of clearModifiedFormData", () => {
      submit
        .mockImplementationOnce(
          ({ clearModifiedFormData, modifiedFormData, formData }) => {
            expect(modifiedFormData).toEqual({ test: "testValue" });
            expect(formData).toEqual({ test: "testValue" });
            clearModifiedFormData();
          }
        )
        .mockImplementation(({ modifiedFormData, formData }) => {
          expect(modifiedFormData).toEqual({});
          expect(formData).toEqual({ test: "111" });
        });
      render(
        <Form onSubmit={submit} data={{ test: "111" }}>
          <FormItem id="test" name="test">
            {({ name, onChange, onBlur }) => {
              return (
                <input
                  name={name}
                  onChange={onChange}
                  onBlur={onBlur}
                  data-testid={name}
                />
              );
            }}
          </FormItem>
          <button type="submit" data-testid="submit">
            Submit
          </button>
        </Form>
      );
      const input = screen.getByTestId("test");
      simulateUserChange(input, { target: { value: "testValue" } });
      const submitButton = screen.getByTestId("submit");
      act(() => submitButton.click());
      act(() => submitButton.click());
      expect(true).toEqual(true);
    });
  });
});
