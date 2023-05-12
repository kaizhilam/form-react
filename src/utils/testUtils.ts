import { fireEvent } from "@testing-library/react";
import omitBy from "lodash/omitBy";
import isUndefined from "lodash/isUndefined";

export function simulateUserChange(
  element: Document | Node | Element | Window,
  options?: {} | undefined
) {
  fireEvent.focus(element);
  fireEvent.change(element, options);
  fireEvent.blur(element);
}

export function cleanInputProps(props: {}): {} {
  const inputProps = omitBy(
    {
      ...props,
      error: undefined,
      errorMessage: undefined,
      helperText: undefined,
    },
    isUndefined
  );
  return inputProps;
}
