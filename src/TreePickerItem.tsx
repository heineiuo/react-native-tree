import React from "react";
import { Text, View, TouchableOpacity, FlatList } from "react-native";

export class TreePickerItem extends React.Component {
  props: {
    item: any;
  };

  render() {
    const { item, helpers } = this.props;
    return (
      <View style={{}}>
        <View
          style={{
            height: 40,
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 12 + item.level * 12,
            backgroundColor: item.selected ? "#ccc" : "transparent",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: 40 }}>
              {item.hasChildren && <Text>{item.showChildren ? "x" : "o"}</Text>}
            </View>
            <Text>{item.name}</Text>
          </View>
          <View>
            <TouchableOpacity
              style={{ display: item.hasChildren ? "flex" : "none" }}
              onPress={helpers.toggleSelectAll}
            >
              <Text>{item.selectAll ? "取消全选" : "全选"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}
