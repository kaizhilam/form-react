import React, { useState } from "react";
import { ControlGroup, Form, FormItem, Input, Radio, Test } from "./components";

function App() {
  return (
    <div className="App">
      <Form
        initialData={{
          // firstName: "first name",
          lastName: "last name",
          gender: "male",
        }}
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
              message: "Value must not be first name",
              expression: (data) => {
                return data === "first name";
              },
            },
          ]}
        >
          {(props: any, { setFieldValue }: any) => (
            <Input {...props} onBlur={setFieldValue} />
          )}
        </FormItem>
        <br />
        <FormItem
          id="lname"
          name="lastName"
          label="last name:"
          validations={[
            {
              message: "Value must not be last name",
              expression: (data) => {
                return data === "last name";
              },
            },
          ]}
        >
          {(props: any, { setFieldValue }: any) => (
            <Input {...props} onBlur={setFieldValue} />
          )}
        </FormItem>
        <br />
        <FormItem
          id="genderId"
          name="gender"
          label="Choose now"
          required
          validations={[
            {
              message: "Value must be female",
              expression: (data) => {
                return data !== "female";
              },
            },
          ]}
        >
          {(props: any, { setFieldValue }: any) => (
            <ControlGroup {...props} onChange={setFieldValue}>
              <Radio id="male" label="Male" value="male" />
              <Radio id="female" label="Female" value="female" />
            </ControlGroup>
          )}
        </FormItem>
        <br />
        <input type="submit" value="Submit" />
      </Form>
    </div>
  );
}

export default App;
