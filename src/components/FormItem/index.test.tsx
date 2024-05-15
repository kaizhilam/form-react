import React from "react";
import { render, screen } from "@testing-library/react";
import { Form, IFormData } from "../Form";
import { FormItem } from ".";
import { simulateUserChange } from "../../utils/testUtils";
import { act } from "react-dom/test-utils";
import "@testing-library/jest-dom/extend-expect";

describe("FormItem", () => {
  it("SHOULD use onChange and onBlur to set modifiedFormData", () => {
    const submit = jest.fn();
    render(
      <Form onSubmit={submit}>
        <FormItem name="test1">
          {({ name, onChange, onBlur, value }) => (
            <input
              name={name}
              onChange={onChange}
              onBlur={onBlur}
              data-testid={name}
              value={value as string}
            />
          )}
        </FormItem>
        <FormItem name="test2">
          {({ name, onChange, onBlur, value }) => (
            <input
              name={name}
              onChange={onChange}
              onBlur={onBlur}
              data-testid={name}
              value={value as string}
            />
          )}
        </FormItem>
        <button type="submit" data-testid="submit">
          Submit
        </button>
      </Form>
    );
    const test1 = screen.getByTestId<HTMLInputElement>("test1");
    simulateUserChange(test1, { target: { value: "testValue" } });
    expect(test1.value).toEqual("testValue");
    const submitButton = screen.getByTestId("submit");
    act(() => submitButton.click());
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        formData: { test1: "testValue" },
        modifiedFormData: { test1: "testValue" },
      })
    );
  });
  describe("validation", () => {
    describe("required", () => {
      it("SHOULD validate required in FormItem", () => {
        const onSubmit = jest.fn();
        render(
          <Form onSubmit={onSubmit}>
            {({ submit }) => (
              <>
                <FormItem name="test" required>
                  {({
                    name,
                    onChange,
                    onBlur,
                    value,
                    required,
                    helperText,
                  }) => (
                    <>
                      <input
                        name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value as string}
                        required={required}
                      />
                      <span data-testid="helperText">{helperText}</span>
                    </>
                  )}
                </FormItem>
                <button data-testid="submit" onClick={submit}>
                  Submit
                </button>
              </>
            )}
          </Form>
        );
        const submitButton = screen.getByTestId("submit");
        act(() => submitButton.click());
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: false,
          })
        );
        const helperText = screen.getByTestId("helperText");
        expect(helperText.textContent).toEqual("This field is required.");
      });
      it("SHOULD validate required in FormItem validations prop", () => {
        const onSubmit = jest.fn();
        render(
          <Form onSubmit={onSubmit}>
            {({ submit }) => (
              <>
                <FormItem
                  name="test"
                  validations={[{ type: "required", message: "Test required" }]}
                >
                  {({
                    name,
                    onChange,
                    onBlur,
                    value,
                    required,
                    helperText,
                  }) => (
                    <>
                      <input
                        name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value as string}
                        required={required}
                      />
                      <span data-testid="helperText">{helperText}</span>
                    </>
                  )}
                </FormItem>
                <button data-testid="submit" onClick={submit}>
                  Submit
                </button>
              </>
            )}
          </Form>
        );
        const submitButton = screen.getByTestId("submit");
        act(() => submitButton.click());
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: false,
          })
        );
        const helperText = screen.getByTestId("helperText");
        expect(helperText.textContent).toEqual("Test required");
      });
      it("SHOULD validate required in FormItem required and FormItem validation prop", () => {
        const onSubmit = jest.fn();
        render(
          <Form onSubmit={onSubmit}>
            {({ submit }) => (
              <>
                <FormItem
                  name="test"
                  validations={[{ type: "required", message: "Test required" }]}
                  required
                >
                  {({
                    name,
                    onChange,
                    onBlur,
                    value,
                    required,
                    helperText,
                  }) => (
                    <>
                      <input
                        name={name}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value as string}
                        required={required}
                      />
                      <span data-testid="helperText">{helperText}</span>
                    </>
                  )}
                </FormItem>
                <button data-testid="submit" onClick={submit}>
                  Submit
                </button>
              </>
            )}
          </Form>
        );
        const submitButton = screen.getByTestId("submit");
        act(() => submitButton.click());
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: false,
          })
        );
        const helperText = screen.getByTestId("helperText");
        expect(helperText.textContent).toEqual("Test required");
      });
      describe("required types", () => {
        it("SHOULD validate required with value number 0", () => {
          const onSubmit = jest.fn();
          render(
            <Form onSubmit={onSubmit} data={{ test: 0 }}>
              {({ submit }) => (
                <>
                  <FormItem name="test" required>
                    {({
                      name,
                      onChange,
                      onBlur,
                      value,
                      required,
                      helperText,
                    }) => (
                      <>
                        <input
                          name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value as string}
                          required={required}
                        />
                        <span data-testid="helperText">{helperText}</span>
                      </>
                    )}
                  </FormItem>
                  <button data-testid="submit" onClick={submit}>
                    Submit
                  </button>
                </>
              )}
            </Form>
          );
          const submitButton = screen.getByTestId("submit");
          act(() => submitButton.click());
          expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              isValid: true,
            })
          );
          const helperText = screen.getByTestId("helperText");
          expect(helperText.textContent).toEqual("");
        });
        it("SHOULD validate required with value string 0", () => {
          const onSubmit = jest.fn();
          render(
            <Form onSubmit={onSubmit} data={{ test: "0" }}>
              {({ submit }) => (
                <>
                  <FormItem name="test" required>
                    {({
                      name,
                      onChange,
                      onBlur,
                      value,
                      required,
                      helperText,
                    }) => (
                      <>
                        <input
                          name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value as string}
                          required={required}
                        />
                        <span data-testid="helperText">{helperText}</span>
                      </>
                    )}
                  </FormItem>
                  <button data-testid="submit" onClick={submit}>
                    Submit
                  </button>
                </>
              )}
            </Form>
          );
          const submitButton = screen.getByTestId("submit");
          act(() => submitButton.click());
          expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              isValid: true,
            })
          );
          const helperText = screen.getByTestId("helperText");
          expect(helperText.textContent).toEqual("");
        });
        it("SHOULD NOT validate required with value empty string", () => {
          const onSubmit = jest.fn();
          render(
            <Form onSubmit={onSubmit} data={{ test: "" }}>
              {({ submit }) => (
                <>
                  <FormItem name="test" required>
                    {({
                      name,
                      onChange,
                      onBlur,
                      value,
                      required,
                      helperText,
                    }) => (
                      <>
                        <input
                          name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value as string}
                          required={required}
                        />
                        <span data-testid="helperText">{helperText}</span>
                      </>
                    )}
                  </FormItem>
                  <button data-testid="submit" onClick={submit}>
                    Submit
                  </button>
                </>
              )}
            </Form>
          );
          const submitButton = screen.getByTestId("submit");
          act(() => submitButton.click());
          expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              isValid: false,
            })
          );
          const helperText = screen.getByTestId("helperText");
          expect(helperText.textContent).toEqual("This field is required.");
        });
        it("SHOULD NOT validate required with value undefined", () => {
          const onSubmit = jest.fn();
          render(
            <Form
              onSubmit={onSubmit}
              data={{ test: undefined } as unknown as IFormData}
            >
              {({ submit }) => (
                <>
                  <FormItem name="test" required>
                    {({
                      name,
                      onChange,
                      onBlur,
                      value,
                      required,
                      helperText,
                    }) => (
                      <>
                        <input
                          name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value as string}
                          required={required}
                        />
                        <span data-testid="helperText">{helperText}</span>
                      </>
                    )}
                  </FormItem>
                  <button data-testid="submit" onClick={submit}>
                    Submit
                  </button>
                </>
              )}
            </Form>
          );
          const submitButton = screen.getByTestId("submit");
          act(() => submitButton.click());
          expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              isValid: false,
            })
          );
          const helperText = screen.getByTestId("helperText");
          expect(helperText.textContent).toEqual("This field is required.");
        });
        it("SHOULD NOT validate required with value null", () => {
          const onSubmit = jest.fn();
          render(
            <Form
              onSubmit={onSubmit}
              data={{ test: null } as unknown as IFormData}
            >
              {({ submit }) => (
                <>
                  <FormItem name="test" required>
                    {({
                      name,
                      onChange,
                      onBlur,
                      value,
                      required,
                      helperText,
                    }) => (
                      <>
                        <input
                          name={name}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value as string}
                          required={required}
                        />
                        <span data-testid="helperText">{helperText}</span>
                      </>
                    )}
                  </FormItem>
                  <button data-testid="submit" onClick={submit}>
                    Submit
                  </button>
                </>
              )}
            </Form>
          );
          const submitButton = screen.getByTestId("submit");
          act(() => submitButton.click());
          expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              isValid: false,
            })
          );
          const helperText = screen.getByTestId("helperText");
          expect(helperText.textContent).toEqual("This field is required.");
        });
      });
    });
    it("SHOULD validate against expression", () => {
      const onSubmit = jest.fn();
      render(
        <Form onSubmit={onSubmit}>
          {({ submit }) => (
            <>
              <FormItem
                name="test"
                validations={[
                  {
                    name: "test",
                    expression: (data) => data === "test",
                    message: "Cannot be test",
                  },
                ]}
              >
                {({ name, onChange, onBlur, value, required, helperText }) => (
                  <>
                    <input
                      name={name}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value as string}
                      required={required}
                      data-testid="input"
                    />
                    <span data-testid="helperText">{helperText}</span>
                  </>
                )}
              </FormItem>
              <button data-testid="submit" onClick={submit}>
                Submit
              </button>
            </>
          )}
        </Form>
      );
      const submitButton = screen.getByTestId("submit");
      act(() => submitButton.click());
      expect(onSubmit).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isValid: true,
          modifiedFormData: {},
          formData: {},
        })
      );
      const input = screen.getByTestId("input");
      simulateUserChange(input, { target: { value: "test" } });
      act(() => submitButton.click());
      expect(onSubmit).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          isValid: false,
          modifiedFormData: { test: "test" },
          formData: { test: "test" },
        })
      );
      const helperText = screen.getByTestId("helperText");
      expect(helperText.textContent).toEqual("Cannot be test");
    });
  });
  describe("childAction", () => {
    describe("formData", () => {
      it("SHOULD show hide base on formData", () => {
        render(
          <Form>
            <FormItem name="test1">
              {({ name, onChange, onBlur, value }, { setFormValue }) => (
                <input
                  name={name}
                  onChange={onChange}
                  onBlur={(e) => {
                    onBlur(e);
                    setFormValue("test2", e.target.value);
                  }}
                  data-testid={name}
                  value={value as string}
                />
              )}
            </FormItem>
            <FormItem name="span-show">
              {(_, { formData }) => {
                if (formData["test2"] === "show") {
                  return <span data-testid="span-show">show</span>;
                }
              }}
            </FormItem>
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </Form>
        );
        const test1 = screen.getByTestId("test1");
        simulateUserChange(test1, { target: { value: "show" } });
        const spanShow = screen.queryByTestId("span-show");
        expect(spanShow).toBeInTheDocument();
      });
    });
    describe("getFieldValue", () => {
      it("SHOULD show hide base on getFieldValue", () => {
        render(
          <Form>
            <FormItem name="test1">
              {({ name, onChange, onBlur, value }, { setFormValue }) => (
                <input
                  name={name}
                  onChange={onChange}
                  onBlur={(e) => {
                    onBlur(e);
                    setFormValue("test2", e.target.value);
                  }}
                  data-testid={name}
                  value={value as string}
                />
              )}
            </FormItem>
            <FormItem name="span-show">
              {(_, { getFieldValue }) => {
                if (getFieldValue("test2") === "show") {
                  return <span data-testid="span-show">show</span>;
                }
              }}
            </FormItem>
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </Form>
        );
        const test1 = screen.getByTestId("test1");
        simulateUserChange(test1, { target: { value: "show" } });
        const spanShow = screen.queryByTestId("span-show");
        expect(spanShow).toBeInTheDocument();
      });
    });
    describe("setFieldValue", () => {
      it("SHOULD setFieldValue", () => {
        const submit = jest.fn();
        render(
          <Form onSubmit={submit}>
            <FormItem name="test">
              {({ name }, { setFieldValue }) => {
                return (
                  <button
                    name={name}
                    onClick={() => {
                      setFieldValue("testValue");
                    }}
                    data-testid="set-value"
                  >
                    Set value
                  </button>
                );
              }}
            </FormItem>
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </Form>
        );
        const submitButton = screen.getByTestId("submit");
        act(() => submitButton.click());
        expect(submit).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: true,
            formData: {},
            modifiedFormData: {},
          })
        );
        const setValueButton = screen.getByTestId("set-value");
        act(() => setValueButton.click());
        act(() => submitButton.click());
        expect(submit).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: true,
            formData: {
              test: "testValue",
            },
            modifiedFormData: {
              test: "testValue",
            },
          })
        );
      });
    });
    describe("setFormValue", () => {
      it("SHOULD setFormValue", () => {
        const submit = jest.fn();
        render(
          <Form onSubmit={submit}>
            <FormItem name="test1">
              {({ name, onChange, onBlur, value }, { setFormValue }) => (
                <input
                  name={name}
                  onChange={onChange}
                  onBlur={(e) => {
                    onBlur(e);
                    setFormValue("test2", e.target.value);
                  }}
                  data-testid={name}
                  value={value as string}
                />
              )}
            </FormItem>
            <FormItem name="test2">
              {({ name, onChange, onBlur, value }) => (
                <input
                  name={name}
                  onChange={onChange}
                  onBlur={onBlur}
                  data-testid={name}
                  value={value as string}
                />
              )}
            </FormItem>
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </Form>
        );
        const test1 = screen.getByTestId("test1");
        simulateUserChange(test1, { target: { value: "testValue" } });
        const test2 = screen.getByTestId<HTMLInputElement>("test2");
        expect(test2.value).toEqual("testValue");
        const submitButton = screen.getByTestId("submit");
        act(() => submitButton.click());
        expect(submit).toHaveBeenCalledWith(
          expect.objectContaining({
            isValid: true,
            formData: {
              test1: "testValue",
              test2: "testValue",
            },
            modifiedFormData: {
              test1: "testValue",
              test2: "testValue",
            },
          })
        );
      });
    });
  });
});
