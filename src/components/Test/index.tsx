import React, { useState } from "react";
import { ControlGroup } from "../ControlGroup";
import { Radio } from "../Radio";

export function Test() {
  const [value, setValue] = useState("2");
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setValue(event.target.value);
  };

  return (
    <ControlGroup id="option" name="radio" label="Choose one option" value="1">
      <Radio id="option1" label="Option 1" name="radio" value="1" />
      <Radio id="option2" label="Option 2" name="radio" value="2" />
    </ControlGroup>
  );
}
