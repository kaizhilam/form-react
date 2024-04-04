import React from "react";
import { queryAllByTestId, render, screen } from "@testing-library/react";
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
  describe("onChange", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });
    const onChange = jest.fn();
    const renderComponent = (initialData?: IFormData) => {
      return render(
        <Form data={initialData} onChange={onChange}>
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
        </Form>
      );
    };
    it("SHOULD run onChange on change of form", () => {
      renderComponent();
      const input = screen.getByTestId("test");
      simulateUserChange(input, { target: { value: "testValue" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: { test: "testValue" },
          modifiedFormData: { test: "testValue" },
        })
      );
      expect(onChange).toHaveBeenCalledTimes(1);
      simulateUserChange(input, { target: { value: "testValue2" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: { test: "testValue2" },
          modifiedFormData: { test: "testValue2" },
        })
      );
      expect(onChange).toHaveBeenCalledTimes(2);
    });
    it("SHOULD NOT call onChange on prepop", () => {
      renderComponent({ test: "testValue" });
      expect(onChange).toHaveBeenCalledTimes(0);
      const input = screen.getByTestId("test");
      simulateUserChange(input, { target: { value: "testValue" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          formData: { test: "testValue" },
          modifiedFormData: { test: "testValue" },
        })
      );
      expect(onChange).toHaveBeenCalledTimes(1);
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
    it("SHOULD run validation for all fields onSubmit click", () => {
      render(
        <Form onSubmit={submit} data={{ test: 2, test2: 2 }}>
          <FormItem
            id="test"
            name="test"
            validations={[
              {
                expression: (data) => {
                  return parseInt("" + data) % 2 === 0;
                },
                message: "Cannot be even",
              },
            ]}
          >
            {({ name, onChange, onBlur, helperText }) => {
              return (
                <>
                  <input
                    name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    data-testid={name}
                  />
                  <span data-testid="helperText">{helperText}</span>
                </>
              );
            }}
          </FormItem>
          <FormItem
            id="test2"
            name="test2"
            validations={[
              {
                expression: (data) => {
                  return parseInt("" + data) % 2 === 0;
                },
                message: "Cannot be even",
              },
            ]}
          >
            {({ name, onChange, onBlur, helperText }) => {
              return (
                <>
                  <input
                    name={name}
                    onChange={onChange}
                    onBlur={onBlur}
                    data-testid={name}
                  />
                  <span data-testid="helperText">{helperText}</span>
                </>
              );
            }}
          </FormItem>
          <button type="submit" data-testid="submit">
            Submit
          </button>
        </Form>
      );
      const helperTexts = screen.queryAllByTestId("helperText");
      expect(helperTexts[0].textContent).toEqual("");
      expect(helperTexts[1].textContent).toEqual("");
      const submitButton = screen.getByTestId("submit");
      act(() => submitButton.click());
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: false,
          formData: { test: 2, test2: 2 },
          modifiedFormData: {},
        })
      );
      expect(helperTexts[0].textContent).toEqual("Cannot be even");
      expect(helperTexts[1].textContent).toEqual("Cannot be even");
    });
  });
});
