import { fireEvent, render, screen } from "@testing-library/react";
import { Form } from ".";
import { FormItem } from "..";
import { simulateUserChange } from "../../utils/testUtils";
import React from "react";

describe("Form", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  const onSubmit = jest.fn();
  const renderComponent = (props?: any) => {
    const { data = undefined } = props || {};
    return render(
      <Form onSubmit={onSubmit} data={data}>
        {() => (
          <>
            <FormItem
              id="testId"
              name="testName"
              label="testLabel"
              required
              validations={[
                {
                  message: "test message",
                  expression: (data) => data === "trigger validation",
                },
                {
                  message: "required message",
                  type: "required",
                },
              ]}
            >
              {({
                error,
                errorMessage,
                id,
                label,
                name,
                required,
                type,
                value,
                onBlur,
                onChange,
                onFocus,
              }) => {
                return (
                  <>
                    {required && <div>Required</div>}
                    <label htmlFor={id}>{label}</label>
                    <input
                      data-testid="testId"
                      id={id}
                      name={name}
                      onBlur={onBlur}
                      onChange={onChange}
                      onFocus={onFocus}
                      value={value}
                      type={type}
                    />
                    {error && <div>{errorMessage}</div>}
                  </>
                );
              }}
            </FormItem>
            <input type="submit" value="Submit" data-testid="submit" />
          </>
        )}
      </Form>
    );
  };
  it("SHOULD render", () => {
    renderComponent();
    const element = screen.getByTestId("testId");
    expect(element).toBeTruthy();
  });
  describe("onSubmit", () => {
    describe("isValid", () => {
      it("SHOULD set isValid to true when no validation error occurs", () => {
        renderComponent();
        const input = screen.getByTestId("testId");
        const submitButton = screen.getByTestId("submit");
        simulateUserChange(input, { target: { value: "test" } });
        fireEvent.click(submitButton);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ isValid: true })
        );
      });
      it("SHOULD set isValid to false when validation error occurs", () => {
        renderComponent();
        const input = screen.getByTestId("testId");
        const submitButton = screen.getByTestId("submit");
        simulateUserChange(input, { target: { value: "trigger validation" } });
        fireEvent.click(submitButton);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ isValid: false })
        );
      });
    });
    describe("modifiedFormData", () => {
      it("SHOULD set modified form data onChange", () => {
        renderComponent();
        const input = screen.getByTestId("testId");
        simulateUserChange(input, { target: { value: "test" } });
        const submitButton = screen.getByTestId("submit");
        fireEvent.click(submitButton);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ modifiedFormData: { testName: "test" } })
        );
      });
      it("SHOULD set modified form data to empty when nothing has changed", () => {
        renderComponent();
        const submitButton = screen.getByTestId("submit");
        fireEvent.click(submitButton);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ modifiedFormData: {} })
        );
      });
    });
    describe("formData", () => {
      it("SHOULD combine default data and modified data in form data", () => {
        const defaultData = {
          aaa: 111,
        };
        renderComponent({ data: defaultData });
        const input = screen.getByTestId("testId");
        const submitButton = screen.getByTestId("submit");
        simulateUserChange(input, { target: { value: "test" } });
        fireEvent.click(submitButton);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ formData: { aaa: 111, testName: "test" } })
        );
      });
    });
    describe("clearModifiedFormData", () => {
      it("SHOULD clear modified data when calling clearModifiedFormData", async () => {
        render(
          <Form
            onSubmit={async ({ clearModifiedFormData, modifiedFormData }) => {
              expect(modifiedFormData).toEqual({ testName: "test" });
              clearModifiedFormData();
              await new Promise((resolve) => setTimeout(resolve, 0));
              expect(modifiedFormData).toEqual({});
            }}
          >
            {() => (
              <>
                <FormItem id="testId" name="testName" label="testLabel">
                  {(props) => {
                    return (
                      <input
                        data-testid="testId"
                        id={props.id}
                        name={props.name}
                        onChange={props.onChange}
                        onBlur={props.onBlur}
                      />
                    );
                  }}
                </FormItem>
                <input type="submit" value="Submit" data-testid="submit" />
              </>
            )}
          </Form>
        );
        const input = screen.getByTestId("testId");
        const submitButton = screen.getByTestId("submit");
        simulateUserChange(input, { target: { value: "test" } });
        fireEvent.click(submitButton);
      });
    });
  });
  describe("children", () => {
    describe("submit", () => {
      it("SHOULD clear modified data when calling clearModifiedFormData", async () => {
        render(
          <Form onSubmit={onSubmit}>
            {({ submit }) => (
              <>
                <FormItem id="testId" name="testName" label="testLabel">
                  {(props) => {
                    return (
                      <input
                        data-testid="testId"
                        id={props.id}
                        name={props.name}
                        onChange={props.onChange}
                        onBlur={props.onBlur}
                      />
                    );
                  }}
                </FormItem>
                <button
                  data-testid="submit"
                  onClick={() => {
                    submit();
                  }}
                >
                  Click me
                </button>
              </>
            )}
          </Form>
        );
        const input = screen.getByTestId("testId");
        const submitButton = screen.getByTestId("submit");
        simulateUserChange(input, { target: { value: "test" } });
        fireEvent.click(submitButton);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            formData: { testName: "test" },
            isValid: true,
          })
        );
      });
      it("SHOULD show most up to date data if user does not blur", () => {
        renderComponent();
        const input = screen.getByTestId("testId");
        const submitButton = screen.getByTestId("submit");
        fireEvent.focus(input);
        fireEvent.change(input, {
          target: { value: "do not trigger validation" },
        });
        fireEvent.click(submitButton);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ isValid: true })
        );
      });
      it("SHOULD show most up to date data and trigger validation if user does not blur", () => {
        renderComponent();
        const input = screen.getByTestId("testId");
        const submitButton = screen.getByTestId("submit");
        fireEvent.focus(input);
        fireEvent.change(input, {
          target: { value: "trigger validation" },
        });
        fireEvent.click(submitButton);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ isValid: false })
        );
      });
    });
  });
});
