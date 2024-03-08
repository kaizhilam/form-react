import React, { useState } from "react";
import { Form, FormItem } from "./components";
import { Button, Switch, TextField } from "@mui/material";

function App() {
  const [data, setData] = useState({
    players: [
      {
        name: "player 1",
      },
      {
        name: "player 2",
      },
      {
        name: "player 3",
      },
    ],
  });
  return (
    <>
      <div className="App">
        <Form
          onSubmit={({
            isValid,
            modifiedFormData,
            formData,
            clearModifiedFormData,
          }) => {
            console.log("isValid", isValid);
            console.log("modifiedFormData", modifiedFormData);
            console.log("formData", formData);
            if (isValid) {
              clearModifiedFormData();
            }
          }}
          data={data}
        >
          {({ submit }) => (
            <>
              <FormItem
                label="test"
                name="test"
                helperText="helperText"
                validations={[
                  {
                    name: "min",
                    expression: (data) => {
                      return data === "aa";
                    },
                    message: "min",
                  },
                  {
                    type: "required",
                    message: "hehehe",
                  },
                ]}
              >
                {(props, { setFieldValue }) => {
                  return <TextField {...props} />;
                }}
              </FormItem>
              <br />
              <FormItem label="showHide" name="showHide">
                {(props, { setFieldValue }) => {
                  return (
                    <Switch
                      checked={props.value === "show"}
                      onClick={() => {
                        if (props.value === "show") {
                          setFieldValue("hide");
                        } else {
                          setFieldValue("show");
                        }
                      }}
                    />
                  );
                }}
              </FormItem>
              <FormItem name="showHideSpan">
                {(props, { getFieldValue, setFormValue }) => {
                  const showHide = getFieldValue("showHide");
                  if (showHide === "show") {
                    return <span>Show</span>;
                  }
                }}
              </FormItem>
              <br />
              <Button
                onClick={() => {
                  // @ts-ignore
                  setData({ test: "aa" });
                }}
              >
                Shuffle
              </Button>
              <br />
              <Button type="submit">Form submit</Button>
              <Button onClick={submit}>Normal submit</Button>
            </>
          )}
        </Form>
      </div>
    </>
  );
}

export default App;
