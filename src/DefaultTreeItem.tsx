import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { TreeItemProps } from "./types";

const colors = ["orange", "purple", "pink", "blue", "red", "yellow", "green"];

export function DefaultTreeItem({
  item,
  activeOpacity,
  style,
  onToggleSelectRecursive,
  onToggleSelect,
  onToggleExpandRecursive,
  onToggleExpand,
}: TreeItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      style={style}
      onPress={onToggleExpand}
    >
      <View style={{}}>
        <View
          style={{
            height: 40,
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: 12 + item.level * 12,

            // backgroundColor: item.selected ? "#ccc" : "transparent",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flex: 1,
              height: 40,
              flexDirection: "row",
              borderBottomWidth: 1,
              borderLeftWidth: 1,
              backgroundColor: colors[item.level] ?? "#ccc",
            }}
          >
            <View style={{ width: 40 }}>
              {item.hasChildren && <Text>{item.isExpanded ? "-" : "+"}</Text>}
            </View>
            <Text>{item.label}</Text>
          </View>
          <View
            style={{
              display: item.hasChildren ? "flex" : "none",
              position: "absolute",
              right: 0,
              top: 0,
              height: 40,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity onPress={onToggleExpandRecursive}>
              <Text>
                {item.isExpandedRecursive ? "Collapse All" : "Expand All"}
              </Text>
            </TouchableOpacity>
            <View style={{ width: 10 }}></View>
            <TouchableOpacity
              style={{ display: item.hasChildren ? "flex" : "none" }}
              onPress={onToggleSelect}
            >
              <Text>
                {item.isSelectedRecursive ? "Unselect All" : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
