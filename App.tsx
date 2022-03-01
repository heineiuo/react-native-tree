import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TreePicker } from "./src";

export default function App() {
  const [value, setValue] = React.useState("");
  const [data] = React.useState([
    {
      id: "a",
      name: "a",
      children: [
        {
          id: "a-a",
          name: "a-a",
        },
        {
          id: "a-b",
          name: "a-b",
          children: [
            {
              id: "a-b-a",
              name: "a-b-a",
            },
            {
              id: "a-b-b",
              name: "a-b-b",
            },
          ],
        },
      ],
    },

    {
      id: "b",
      name: "b",
    },
  ]);
  return (
    <View style={styles.container}>
      <View style={{ height: 20 }} />

      <View>
        <Text>value:{value}</Text>
      </View>
      <View style={{ height: 20 }} />

      <View>
        <TreePicker data={data} onValueChange={setValue} value={value} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
