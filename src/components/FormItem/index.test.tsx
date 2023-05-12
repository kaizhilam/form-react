import { Form } from "..";
import { FormItem } from ".";
import { fireEvent, render, screen } from "@testing-library/react";
import isUndefined from "lodash/isUndefined";
import omitBy from "lodash/omitBy";
import { cleanInputProps, simulateUserChange } from "../../utils/testUtils";

describe("FormItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  const onSubmit = jest.fn();
  const renderComponent = () =>
    render(
      <Form onSubmit={onSubmit}>
        <FormItem id="testId" name="testName" label="testLabel">
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
  describe("validations", () => {
    it("SHOULD setup required validation with required props", () => {
      render(
        <Form onSubmit={onSubmit}>
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
});
