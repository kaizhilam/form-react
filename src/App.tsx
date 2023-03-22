import React, { useState } from "react";
import { ControlGroup, Form, FormItem, Input, Radio, Test } from "./components";
import { Regex } from "./utils/regex";

function App() {
  const data = {
    lastName: 1,
    gender: "male",
    list: [1, 2, 3, 4],
    object: { aaa: 111 },
  };
  return (
    <div className="App">
      <Form
        data={data}
        onSubmit={({ isValid, formData }) => {
          console.log(formData);
          if (isValid) {
            console.log("valid");
          }
        }}
      >
        <FormItem
          id="fname"
          name="firstName"
          label="first name"
          required
          validations={[
            {
              message: 'Need your first name',
              type: 'required'
            },
            {
              message: "Value must not be first name",
              expression: (data) => {
                return data === "first name";
              },
            },
          ]}
        >
          {(props, { setFieldValue, setFormValue }) => {
            return <Input {...props} />;
          }}
        </FormItem>
        <br />
        <FormItem
          id="birthday"
          name="birthday"
          label="Birthday"
          required
          validations={[
            {
              message: "Value must be in the format of dd/mm/yyyy",
              expression: (data) => {
                return !Regex.ddmmyyyy.test(data);
              },
            },
          ]}
        >
          {(props, { setFieldValue }) => {
            return <Input {...props} />;
          }}
        </FormItem>
        <br />
        <input type="submit" value="Submit" />
      </Form>
    </div>
  );
}

export default App;
