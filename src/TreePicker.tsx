import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleProp, ViewStyle, createElement } from "react-native";

import { TreePickerItem } from "./TreePickerItem";
import { TreeItem } from "./types";

export function TreePicker({
  onSelectedChange,
  style,
  renderItem = TreePickerItem,
  itemWrapperStyle,
  activeOpacity,
  data = [],
  keyExtractor,
  keyOfChildren = "children",
  keyOfLabel = "label",
  keyOfId = "id",
  selected = [],
  readOnly,
}: {
  keyExtractor?: (item: any, index: number) => string;
  style?: StyleProp<ViewStyle>;
  itemWrapperStyle?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  keyOfId?: string;
  keyOfChildren?: string;
  keyOfLabel?: string;
  /**
   * 是否支持多选，默认false
   */
  multiple?: boolean;
  /**
   * 是否只读，默认false
   */
  readOnly?: boolean;
  data: any[];
  selected?: string[];
  renderItem?: any;
  onSelectedChange?: any;
}) {
  const [internalSelected, setSelected] = useState(selected);
  const [internalExpanded, setExpanded] = useState([]);
  const [collapsed, setCollapsed] = useState([]);
  const [internalSelectedRecursive, setSelectedRecursive] = useState([]);
  const [internalExpandedRecursive, setExpandedRecursive] = useState([]);

  /**
   * get flat data from tree data
   */
  const internalData = useMemo<TreeItem[]>(() => {
    console.log({
      data,
      internalSelected,
      internalExpanded,
      internalSelectedRecursive,
      internalExpandedRecursive,
    });
    const makeParentBranchShowChildren = (parent: TreeItem | null) => {
      if (parent) {
        parent.isExpanded = true;
        makeParentBranchShowChildren(parent.parent);
      }
    };

    const hasAncestorExpandedRecursive = (
      parent: TreeItem | null,
      level = -1
    ) => {
      if (!parent) {
        return false;
      }

      if (parent.isExpandedRecursive) {
        return true;
      }
      if (!parent.isExpanded) {
        return false;
      }

      return hasAncestorExpandedRecursive(parent.parent, --level);
    };

    const result = [];

    const recur = (item: any, parent: null | TreeItem = null, level = 0) => {
      const id = item[keyOfId];
      const label = item[keyOfLabel];
      const children = item[keyOfChildren];

      const originalItem = { ...item };
      delete originalItem[keyOfChildren];

      const hasChildren = children && children.length > 0;
      const isInExpandedRecursiveBranch = hasAncestorExpandedRecursive(parent);
      const isSelected = internalSelected.includes(id);
      const isSelectedRecursive = internalSelectedRecursive.includes(id);
      const isExpanded =
        !collapsed.includes(id) &&
        (internalExpanded.includes(id) ||
          internalExpandedRecursive.includes(id) ||
          isInExpandedRecursiveBranch);
      const isExpandedRecursive = internalExpandedRecursive.includes(id);
      let isVisible =
        parent === null || (parent.isVisible && parent.isExpanded);

      const node: TreeItem = {
        id,
        label,
        parent,
        originalItem,
        level,
        hasChildren,
        isVisible,
        isSelected,
        isSelectedRecursive,
        isExpanded,
        isExpandedRecursive,
      };

      if (isSelected) {
        makeParentBranchShowChildren(node.parent);
      }

      result.push(node);

      if (hasChildren) {
        node.children = children.map((childItem: any) => {
          return recur(childItem, node, level + 1);
        });
      }
      return node;
    };

    data.forEach((item) => recur(item));

    return result;
  }, [
    data,
    collapsed,
    internalSelected,
    internalExpanded,
    internalSelectedRecursive,
    internalExpandedRecursive,
  ]);

  /**
   * internal render item
   * if item is not visible, return null
   */
  const internalRenderItem = useCallback(
    ({ item, index }: { item: TreeItem; index: number }) => {
      const onToggleSelect = () => {
        setSelected((prev) => {
          let prevSelected = false;
          return prev.filter((item1) => {
            let pass = item.id !== item1;
            if (!pass) {
              prevSelected = true;
            }
            return pass;
          });
        });
      };

      const onToggleSelectRecursive = () => {
        setSelected((prev) => {
          let prevSelected = false;
          return prev.filter((item1) => {
            let pass = item.id !== item1;
            if (!pass) {
              prevSelected = true;
            }
            return pass;
          });
        });
      };

      const onToggleExpand = () => {
        if (item.isExpanded) {
          if (internalExpandedRecursive.includes(item.id)) {
            setExpandedRecursive((prev) => {
              return prev.filter((id) => id !== item.id);
            });
          }
          if (internalExpanded.includes(item.id)) {
            setExpanded((prev) => {
              return prev.filter((id) => id !== item.id);
            });
          }
          setCollapsed((prev) => {
            return prev.concat(item.id);
          });
        } else {
          setCollapsed((prev) => {
            if (prev.includes(item.id)) {
              return prev.filter((id) => item.id !== id);
            }
            return prev;
          });
          setExpanded((prev) => {
            return prev.concat(item.id);
          });
        }
      };

      const onToggleExpandRecursive = () => {
        if (item.isExpanded) {
          if (!internalExpandedRecursive.includes(item.id)) {
            setExpandedRecursive((prev) => {
              return prev.concat(item.id);
            });
          } else {
            // collapse it
            setExpandedRecursive((prev) => {
              return prev.filter((id) => id !== item.id);
            });

            setCollapsed((prev) => {
              return prev.concat(item.id);
            });
          }
        } else {
          // expanded it
          setCollapsed((prev) => {
            if (prev.includes(item.id)) {
              return prev.filter((id) => id !== item.id);
            }
            return prev;
          });
          setExpandedRecursive((prev) => {
            if (prev.includes(item.id)) {
              return prev;
            }
            return prev.concat(item.id);
          });
        }
      };

      if (!item.isVisible) return null;

      return createElement(renderItem, {
        activeOpacity: activeOpacity,
        style: itemWrapperStyle,
        onToggleSelectRecursive,
        onToggleSelect,
        onToggleExpandRecursive,
        onToggleExpand,
        item,
        index,
      });
    },
    [
      renderItem,
      activeOpacity,
      collapsed,
      internalExpanded,
      internalExpandedRecursive,
      internalSelected,
      internalData,
    ]
  );

  /**
   * internal key extractor
   * return item.id if keyExtractor is not provided in props
   */
  const internalKeyExtractor = useCallback(
    (item, index) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      return item.id;
    },
    [keyExtractor]
  );

  return (
    <FlatList
      style={style}
      keyExtractor={internalKeyExtractor}
      data={internalData}
      renderItem={internalRenderItem}
    ></FlatList>
  );
}
