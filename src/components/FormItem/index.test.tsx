import { Form } from "..";
import { FormItem } from ".";
import { fireEvent, render, screen } from "@testing-library/react";
import { cleanInputProps, simulateUserChange } from "../../utils/testUtils";
import React from "react";

describe("FormItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  const onSubmit = jest.fn();
  const renderComponent = (props?: any) =>
    render(
      <Form onSubmit={onSubmit}>
        {() => (
          <>
            <FormItem id="input" name="testName" label="testLabel" {...props}>
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
                      data-testid="input"
                      id={id}
                      name={name}
                      onBlur={onBlur}
                      onChange={onChange}
                      onFocus={onFocus}
                      value={value}
                      type={type}
                    />
                    {error && <div data-testid="error">{errorMessage}</div>}
                  </>
                );
              }}
            </FormItem>
            <input type="submit" value="Submit" data-testid="submit" />
          </>
        )}
      </Form>
    );
  it("SHOULD render", () => {
    renderComponent();
    const element = screen.getByTestId("input");
    expect(element).toBeTruthy();
  });
  describe("validations", () => {
    it("SHOULD setup required validation with required props", () => {
      render(
        <Form onSubmit={onSubmit}>
          {() => (
            <FormItem id="testId" name="testName" required>
              {(props, { setFieldValue, setFormValue }) => {
                const inputProps = cleanInputProps(props);
                return (
                  <>
                    <input {...inputProps} data-testid="input" />
                    {props.error && (
                      <div data-testid="error">{props.errorMessage}</div>
                    )}
                  </>
                );
              }}
            </FormItem>
          )}
        </Form>
      );
      const inputElement = screen.getByTestId("input");
      fireEvent.blur(inputElement);
      const errorElement = screen.queryByTestId("error");
      expect(errorElement).toBeTruthy();
    });
    it("SHOULD setup validation with expression", () => {
      render(
        <Form onSubmit={onSubmit}>
          {() => (
            <FormItem
              id="testId"
              name="testName"
              validations={[
                {
                  message: "validation triggered",
                  expression: (data) => data === "trigger validation",
                },
              ]}
            >
              {(props, { setFieldValue, setFormValue }) => {
                const inputProps = cleanInputProps(props);
                return (
                  <>
                    <input {...inputProps} data-testid="input" />
                    {props.error && (
                      <div data-testid="error">{props.errorMessage}</div>
                    )}
                  </>
                );
              }}
            </FormItem>
          )}
        </Form>
      );
      const inputElement = screen.getByTestId("input");
      simulateUserChange(inputElement, {
        target: { value: "trigger validation" },
      });
      const errorElement = screen.queryByTestId("error");
      expect(errorElement).toBeTruthy();
    });
  });
  describe("events", () => {
    it("SHOULD trigger onChange event", () => {
      const onChange = jest.fn();
      renderComponent({ onChange });
      const element = screen.getByTestId("input");
      fireEvent.change(element, { target: { value: "aaa111" } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
    it("SHOULD trigger onFocus event", () => {
      const onFocus = jest.fn();
      renderComponent({ onFocus });
      const element = screen.getByTestId("input");
      fireEvent.focus(element);
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
    it("SHOULD trigger onBlur event", () => {
      const onBlur = jest.fn();
      renderComponent({ onBlur });
      const element = screen.getByTestId("input");
      fireEvent.blur(element);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });
  describe("FormItemAction", () => {
    describe("getFieldValue", () => {
      it("SHOULD get field value", () => {
        render(
          <Form data={{ data: "display" }}>
            {() => (
              <FormItem id="display" name="display">
                {(props, { getFieldValue }) => {
                  return getFieldValue("data") === "display" ? (
                    <div data-testid="display">should display</div>
                  ) : (
                    <div data-testid="display">should not display</div>
                  );
                }}
              </FormItem>
            )}
          </Form>
        );
        const element = screen.getByTestId("display");
        expect(element.textContent).toEqual("should display");
      });
    });
    describe("setFieldValue", () => {
      it("SHOULD set field value", () => {
        render(
          <Form data={{ test: "should not display" }}>
            {() => (
              <FormItem id="test" name="test">
                {(props, { setFieldValue }) => (
                  <>
                    <button
                      data-testid="button"
                      onClick={() => setFieldValue("should display")}
                    >
                      Click here
                    </button>
                    <div data-testid="display">{props.value}</div>
                  </>
                )}
              </FormItem>
            )}
          </Form>
        );
        const button = screen.getByTestId("button");
        fireEvent.click(button);
        const element = screen.getByTestId("display");
        expect(element.textContent).toEqual("should display");
      });
      it("SHOULD set field value with groupId", () => {
        const onSubmit = jest.fn();
        render(
          <Form
            data={{
              test: "should change",
              test2: "should be in modified data",
              test3: "should not be in modified data",
            }}
            onSubmit={onSubmit}
          >
            {() => (
              <>
                <FormItem id="test" name="test" groupId="same">
                  {(props, { setFieldValue }) => (
                    <>
                      <button
                        data-testid="button"
                        onClick={() =>
                          setFieldValue("should be in modified data")
                        }
                      >
                        Click here
                      </button>
                      <div data-testid="display">{props.value}</div>
                    </>
                  )}
                </FormItem>
                <FormItem id="test2" name="test2" groupId="same">
                  {() => <div>test2</div>}
                </FormItem>
                <FormItem id="test3" name="test3" groupId="different">
                  {() => <div>test3</div>}
                </FormItem>
                <button type="submit" data-testid="submit">
                  submit
                </button>
              </>
            )}
          </Form>
        );
        const button = screen.getByTestId("button");
        fireEvent.click(button);
        const submit = screen.getByTestId("submit");
        fireEvent.click(submit);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            modifiedFormData: {
              test: "should be in modified data",
              test2: "should be in modified data",
            },
          })
        );
      });
    });
    describe("setFormValue", () => {
      it("SHOULD set form value", () => {
        render(
          <Form data={{ test: "should not display" }}>
            {() => (
              <>
                <FormItem id="button" name="button">
                  {(props, { setFormValue }) => (
                    <button
                      data-testid="button"
                      onClick={() => setFormValue("test", "should display")}
                    >
                      Click here
                    </button>
                  )}
                </FormItem>
                <FormItem id="test" name="test">
                  {(props) => <div data-testid="display">{props.value}</div>}
                </FormItem>
              </>
            )}
          </Form>
        );
        const button = screen.getByTestId("button");
        fireEvent.click(button);
        const element = screen.getByTestId("display");
        expect(element.textContent).toEqual("should display");
      });
      it("SHOULD set form value with groupId", () => {
        const onSubmit = jest.fn();
        render(
          <Form
            data={{
              test: "should change",
              test2: "should be in modified data",
              test3: "should not be in modified data",
            }}
            onSubmit={onSubmit}
          >
            {() => (
              <>
                <FormItem id="button" name="button">
                  {(props, { setFormValue }) => (
                    <button
                      data-testid="button"
                      onClick={() =>
                        setFormValue(
                          "test",
                          "should be in modified data",
                          "same"
                        )
                      }
                    >
                      Click here
                    </button>
                  )}
                </FormItem>
                <FormItem id="test" name="test" groupId="same">
                  {() => <div>test</div>}
                </FormItem>
                <FormItem id="test2" name="test2" groupId="same">
                  {() => <div>test2</div>}
                </FormItem>
                <FormItem id="test3" name="test3" groupId="different">
                  {() => <div>test3</div>}
                </FormItem>
                <button type="submit" data-testid="submit">
                  submit
                </button>
              </>
            )}
          </Form>
        );
        const button = screen.getByTestId("button");
        fireEvent.click(button);
        const submit = screen.getByTestId("submit");
        fireEvent.click(submit);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            modifiedFormData: {
              test: "should be in modified data",
              test2: "should be in modified data",
            },
          })
        );
      });
      it("SHOULD set form value without race condition", () => {
        const onSubmit = jest.fn();
        render(
          <Form
            data={{
              test: "should not be this value",
              test2: "should not be this value",
            }}
            onSubmit={onSubmit}
          >
            {() => (
              <>
                <FormItem id="test" name="test" groupId="same">
                  {(props, { setFieldValue, setFormValue }) => {
                    const inputProps = cleanInputProps(props);
                    return (
                      <input
                        {...inputProps}
                        data-testid="test"
                        onBlur={(e) => {
                          setFormValue("test2", "should be this value", "same");
                          setFieldValue("should be this value");
                        }}
                      />
                    );
                  }}
                </FormItem>
                <button type="submit" data-testid="submit">
                  submit
                </button>
              </>
            )}
          </Form>
        );
        const input = screen.getByTestId("test");
        fireEvent.blur(input);
        const button = screen.getByTestId("submit");
        fireEvent.click(button);
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            modifiedFormData: {
              test: "should be this value",
              test2: "should be this value",
            },
          })
        );
      });
    });
  });
});
