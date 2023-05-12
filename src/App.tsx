import React, { useState, useEffect } from "react";
import { Form, FormItem } from "./components";
import { Regex } from "./utils/regex";
import { Button, TextField } from "@mui/material";

function shuffle(array: any[]) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function App() {
  const [data, setData] = useState({
    players: [
      {
        uid: "1",
        familyName: "Edwards",
        givenName: "Dylan",
        jerseyNumber: 1,
      },
      {
        uid: "2",
        familyName: "Smith",
        givenName: "Chris",
        jerseyNumber: 2,
      },
      {
        uid: "3",
        familyName: "Garner",
        givenName: "Luke",
        jerseyNumber: 3,
      },
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // setData({
      //   ...data,
      //   randomNumber: Math.floor(Math.random() * 100),
      // });
      const newArr = shuffle(data.players);
      setData({ players: newArr });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Form
        data={data}
        onSubmit={({ isValid, formData, modifiedFormData }) => {
          console.log(modifiedFormData);
          console.log("isValid: ", isValid);
        }}
      >
        <>
          {data.players.map((player, index) => {
            return (
              <React.Fragment key={player.uid}>
                <FormItem
                  id={`players.${index}.familyName`}
                  name={`players.${index}.familyName`}
                  helperText="Enter family name"
                >
                  {(props, { setFormValue, getFieldValue }) => {
                    return (
                      <TextField
                        {...props}
                        onBlur={(e) => {
                          props.onBlur(e);
                          const givenName = getFieldValue(
                            `players.${index}.givenName`
                          );
                          setFormValue(`players.${index}.givenName`, givenName);
                          const jerseyNumber = getFieldValue(
                            `players.${index}.jerseyNumber`
                          );
                          setFormValue(`players.${index}.jerseyNumber`, jerseyNumber);
                        }}
                      />
                    );
                  }}
                </FormItem>
                <FormItem
                  id={`players.${index}.givenName`}
                  name={`players.${index}.givenName`}
                  helperText="Enter given name"
                >
                  {(props) => {
                    return <TextField {...props} />;
                  }}
                </FormItem>
                <FormItem
                  id={`players.${index}.jerseyNumber`}
                  name={`players.${index}.jerseyNumber`}
                  helperText="Enter jersey number"
                >
                  {(props) => {
                    return <TextField {...props} />;
                  }}
                </FormItem>
                <br />
              </React.Fragment>
            );
          })}
          <br />
          <FormItem id={"submit"} name={"submit"}>
            {(props) => {
              return <Button type="submit">submit</Button>;
            }}
          </FormItem>
        </>
      </Form>
    </div>
  );
}

export default App;
