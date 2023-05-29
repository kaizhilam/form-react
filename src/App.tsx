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
    homeTeamPlayerData: [
      {
        uid: "1",
        familyName: "Edwards",
        givenName: "Dylan",
        playerTradingOpinion: {
          jerseyNumber: 1,
        },
      },
      {
        uid: "2",
        familyName: "Smith",
        givenName: "Chris",
        playerTradingOpinion: {
          jerseyNumber: 2,
        },
      },
      {
        uid: "3",
        familyName: "Garner",
        givenName: "Luke",
        playerTradingOpinion: {
          jerseyNumber: 3,
        },
      },
    ],
    awayTeamPlayerData: [],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newArr = shuffle(data.homeTeamPlayerData);
      setData((prev) => ({ ...prev, homeTeamPlayerData: newArr }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const name = "homeTeamPlayerData";

  return (
    <div className="App">
      <Form
        data={data}
        onSubmit={({ isValid, formData, modifiedFormData }) => {
          console.log(modifiedFormData);
          console.log("isValid: ", isValid);
          const timer = () => {
            setTimeout(() => {
              const newArr = shuffle(data.homeTeamPlayerData);
              setData((prev) => ({ ...prev, homeTeamPlayerData: newArr }));
            }, 1000);
          };
          timer();
        }}
      >
        {({ submit }) => (
          <>
            {data.homeTeamPlayerData.map((player, index) => {
              return (
                <React.Fragment key={player.uid}>
                  <FormItem
                    id={`${name}.${index}.uid`}
                    name={`${name}.${index}.uid`}
                    groupId={player.uid}
                  >
                    {() => <></>}
                  </FormItem>
                  <FormItem
                    id={`${name}.${index}.familyName`}
                    name={`${name}.${index}.familyName`}
                    helperText="Enter family name"
                    label="Family name"
                    groupId={player.uid}
                    validations={[
                      {
                        message: "Error",
                        expression: (data) => data === "Edwards",
                      },
                    ]}
                  >
                    {(props, { setFormValue, setFieldValue }) => {
                      return (
                        <TextField
                          {...props}
                          onBlur={(e) => {
                            setFormValue(`${name}.${index}.test`, 99, player.uid);
                            setFieldValue(e.target.value)
                          }}
                        />
                      );
                    }}
                  </FormItem>
                  <FormItem
                    id={`${name}.${index}.givenName`}
                    name={`${name}.${index}.givenName`}
                    helperText="Enter given name"
                    groupId={player.uid}
                  >
                    {(props) => {
                      return <TextField {...props} />;
                    }}
                  </FormItem>
                  <FormItem
                    id={`${name}.${index}.playerTradingOpinion.jerseyNumber`}
                    name={`${name}.${index}.playerTradingOpinion.jerseyNumber`}
                    helperText="Enter jersey number"
                    groupId={player.uid}
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
            <FormItem id={`test`} name={`test`} helperText="test">
              {(props) => {
                return <TextField {...props} />;
              }}
            </FormItem>
            <br />
            <FormItem id={"submit"} name={"submit"}>
              {(props) => {
                return <Button type="submit">submit</Button>;
              }}
            </FormItem>
          </>
        )}
      </Form>
    </div>
  );
}

export default App;
