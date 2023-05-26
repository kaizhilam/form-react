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
  const renderComponent = () =>
    render(
      <Form onSubmit={onSubmit}>
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
      </Form>
    );
  it("SHOULD render", () => {
    renderComponent();
    const element = screen.getByTestId("testId");
    expect(element).toBeTruthy();
  });
  describe("onSubmit", () => {
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
    it("SHOULD set modified data to empty when nothing has changed", () => {
      renderComponent();
      const submitButton = screen.getByTestId("submit");
      fireEvent.click(submitButton);
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ modifiedFormData: {} })
      );
    });
  });
});
