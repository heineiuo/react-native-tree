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
