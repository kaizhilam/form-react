import React, { useState, useEffect } from "react";
import { ControlGroup, Form, FormItem, Input, Radio, Test } from "./components";
import { Regex } from "./utils/regex";

function App() {
  const [data, setData] = useState({
    character: {
      name: {
        last: "lastname",
        first: "firstname",
      },
    },
    randomNumber: 1,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        ...data,
        randomNumber: Math.floor(Math.random() * 100),
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
          name="character.name.first"
          label="first name"
          validations={[
            {
              message: "Need your first name",
              type: "required",
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
        <FormItem id="randomNumber" name="randomNumber" label="Random number">
          {(props, { setFieldValue, setFormValue }) => {
            return <Input {...props} />;
          }}
        </FormItem>
        <br />
        <FormItem
          id="birthday"
          name="birthday"
          label="Birthday"
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
