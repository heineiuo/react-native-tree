import { StyleProp, ViewStyle } from "react-native";

export type TreeItem = {
  /**
   * original item WITHOUT children
   */
  originalItem: any;
  id: string;
  label: string;
  isSelectedRecursive: boolean;
  isExpandedRecursive: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  isVisible: boolean;
  children?: null | TreeItem[];
  parent?: null | TreeItem;
  level: number;
  hasChildren: boolean;
};

export type TreeItemProps = {
  activeOpacity: number;
  style: StyleProp<ViewStyle>;
  item: TreeItem;
  onToggleSelectRecursive: () => void;
  onToggleSelect: () => void;
  onToggleExpandRecursive: () => void;
  onToggleExpand: () => void;
};
