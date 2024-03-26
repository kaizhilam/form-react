import React, { useState } from "react";
import { Form, FormItem } from "./components";
import { Button, Switch, TextField } from "@mui/material";

function App() {
  const [data, setData] = useState({
    players: Array.from(Array(100).keys()).map((e) => ({ uid: e })),
    test: 0,
  });
  return (
    <>
      <div className="App">
        <Form
          onChange={(e) => {
            console.log("onChange", e);
          }}
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
              {data.players.map((e, index) => {
                return (
                  <React.Fragment key={e.uid}>
                    <FormItem
                      id={`players.${index}.uid`}
                      name={`players.${index}.uid`}
                    >
                      {(props) => {
                        return <TextField {...props} />;
                      }}
                    </FormItem>
                    <br />
                  </React.Fragment>
                );
              })}
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
