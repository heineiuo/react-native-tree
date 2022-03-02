import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TreePicker } from "./src";

export default function App() {
  const [selected, setSelected] = React.useState([]);
  const [data] = React.useState([
    {
      id: "a",
      label: "a",
      children: [
        {
          id: "a-a",
          label: "a-a",
        },
        {
          id: "a-b",
          label: "a-b",
          children: [
            {
              id: "a-b-a",
              label: "a-b-a",
            },
            {
              id: "a-b-b",
              label: "a-b-b",
              children: [
                {
                  id: "a-b-b-a",
                  label: "a-b-b-a",
                },
              ],
            },
          ],
        },
      ],
    },

    {
      id: "b",
      label: "b",
    },
  ]);
  return (
    <View style={styles.container}>
      <View style={{ height: 20 }} />

      <View>
        <Text>selected:{selected}</Text>
      </View>
      <View style={{ height: 20 }} />

      <View>
        <TreePicker
          data={data}
          onSelectedChange={setSelected}
          selected={selected}
        />
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
