import React, { useState } from "react";
import { Form, FormItem } from "./components";
import { Regex } from "./utils/regex";
import { Button, TextField } from "@mui/material";
import { merge, set } from "lodash";

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
  const [shuffleTime, setShuffleTime] = useState<number>(0);
  const [populateTime, setPopulateTime] = useState<number>(1000);
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

  const name = "homeTeamPlayerData";

  return (
    <div className="App">
      <Form
        data={data}
        onSubmit={({
          isValid,
          formData,
          modifiedFormData,
          clearModifiedFormData,
        }) => {
          console.log(modifiedFormData);
          console.log(formData);
          console.log("isValid: ", isValid);
          if (isValid) {
            clearModifiedFormData();
          }
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
                        message: "Error Edwards",
                        expression: (data) => data === "Edwards",
                      },
                      {
                        message: "ErrorAAA",
                        expression: (data) => data === "aaa",
                      },
                    ]}
                  >
                    {(props, { setFormValue, setFieldValue }) => {
                      return (
                        <TextField
                          {...props}
                          onBlur={(e) => {
                            setFormValue(
                              `${name}.${index}.test`,
                              99,
                              player.uid
                            );
                            setFieldValue(e.target.value);
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
                    {(props, { setFormValue }) => {
                      return (
                        <TextField
                          {...props}
                          onBlur={(e) => {
                            props.onBlur(e);
                            setFormValue(
                              `${name}.${index}.familyName`,
                              "aaa",
                              player.uid
                            );
                          }}
                        />
                      );
                    }}
                  </FormItem>
                  <FormItem
                    id={`${name}.${index}.playerTradingOpinion.jerseyNumber`}
                    name={`${name}.${index}.playerTradingOpinion.jerseyNumber`}
                    helperText="Enter jersey number"
                    groupId={player.uid}
                  >
                    {(props, { setFormValue }) => {
                      return (
                        <TextField
                          {...props}
                          onBlur={(e) => {
                            props.onBlur(e);
                            setFormValue(
                              `${name}.${index}.familyName`,
                              "no error",
                              player.uid
                            );
                          }}
                        />
                      );
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
      <br />
      <TextField
        label="Shuffle time (ms)"
        onChange={(e) => {
          const number = parseInt(e.target.value);
          if (!Number.isNaN(number)) {
            setShuffleTime(number);
          }
        }}
        value={shuffleTime}
      />
      <Button
        onClick={(e) => {
          const timer = () => {
            setTimeout(() => {
              const newArr = shuffle(data.homeTeamPlayerData);
              setData((prev) => ({ ...prev, homeTeamPlayerData: newArr }));
              console.log("shuffled");
            }, shuffleTime);
          };
          timer();
        }}
      >
        Shuffle
      </Button>
      <br />
      <TextField
        label="Populate time (ms)"
        onChange={(e) => {
          const number = parseInt(e.target.value);
          if (!Number.isNaN(number)) {
            setPopulateTime(number);
          }
        }}
        value={populateTime}
      />
      <Button
        onClick={(e) => {
          const timer = () => {
            setTimeout(() => {
              const toMerge = {};
              set(toMerge, `${name}.${0}.familyName`, "test");
              const newData = merge({}, data, toMerge);
              setData(newData);
              console.log("populated");
            }, populateTime);
          };
          timer();
        }}
      >
        Populate
      </Button>
    </div>
  );
}

export default App;
