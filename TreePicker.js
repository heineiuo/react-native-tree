//@flow

import React from 'react';
import { Text, View, TouchableOpacity, FlatList } from 'react-native';
import { TreePickerItem } from './TreePickerItem';

export class TreePicker extends React.Component {
  constructor(props) {
    super(props);

    const flattenData = this.flattenData(props);

    this.state = {
      value: props.value,
      flattenData,
    };
  }

  props: {
    /**
     * 是否支持多选，默认false
     */
    multiple: boolean,
    /**
     * 是否只读，默认false
     */
    readOnly?: boolean,
    data: any[],
    value?: string,
    /**
     * value的分割符
     */
    seperator?: string,
    ItemComponent?: any,
  };

  componentDidMount() {
    this.updateNodeVisibility();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.value !== this.props.value ||
      prevProps.data !== this.props.data
    ) {
      const nextState = {};
      if (prevProps.value !== this.props.value) {
        nextState.value = this.props.value;
      }
      if (prevProps.data !== this.props.data) {
        nextState.flattenData = this.flattenData(this.props);
      }
      this.setState(nextState, this.updateNodeVisibility);
    }
  }

  flattenData = (props) => {
    const {
      data = [],
      keyOfChildren = 'children',
      keyOfName = 'name',
      keyOfId = 'id',
      value = '',
    } = props;
    const makeParentBranchShowChildren = (parent) => {
      if (parent) {
        parent.showChildren = true;
        makeParentBranchShowChildren(parent.parent);
      }
    };

    const result = [];

    const recur = (item, parent = null, level = 0) => {
      const id = item[keyOfId];
      const name = item[keyOfName];
      const children = item[keyOfChildren];

      const originalItem = { ...item };
      delete originalItem[keyOfChildren];

      const hasChildren = children && children.length > 0;

      const node = {
        id,
        name,
        parent,
        originalItem,
        level,
        hasChildren,
        selected: value.indexOf(id) > -1,
        // 默认二级节点往下都不可见
        showChildren: false,
        visible: parent === null,
        selectAll: false,
      };

      if (node.selected) {
        makeParentBranchShowChildren(node.parent);
      }

      result.push(node);

      if (hasChildren) {
        node.children = children.map((childItem) => {
          return recur(childItem, node, level + 1);
        });
      }
      return node;
    };

    data.forEach((item) => recur(item));

    return result;
  };

  updateNodeVisibility = () => {
    const flattenData = [...(this.state.flattenData || [])];
    // console.log('flattenData', flattenData)
    for (const node of flattenData) {
      node.visible = !node.parent;
    }

    for (const node of flattenData) {
      if (node.hasChildren && node.showChildren) {
        for (const child of node.children) {
          child.visible = true;
        }
      }
    }

    this.setState({
      flattenData,
    });
  };

  onPressItem = (e, item) => {
    const { readOnly, seperator = ',' } = this.props;
    const { value = '' } = this.state;
    const itemInData = this.state.flattenData.find(
      (dataItem) => item.id === dataItem.id
    );
    if (itemInData.hasChildren) {
      this.setState(
        {
          flattenData: this.state.flattenData.map((dataItem) => {
            if (dataItem.id === item.id) {
              dataItem.showChildren = !dataItem.showChildren;
            }
            return dataItem;
          }),
        },
        this.updateNodeVisibility
      );
    } else {
      if (readOnly) return;
      const valueIds = new Set(
        value.split(seperator).filter((valueItem) => valueItem !== '')
      );
      if (valueIds.has(item.id)) {
        valueIds.delete(item.id);
      } else {
        valueIds.add(item.id);
      }
      const nextValue = Array.from(valueIds).join(seperator);
      this.setState(
        {
          value: nextValue,
          flattenData: this.state.flattenData.map((dataItem) => {
            if (dataItem.id === item.id) {
              dataItem.selected = !dataItem.selected;
            }
            return dataItem;
          }),
        },
        () => {
          this.emitChange();
          this.updateNodeVisibility();
        }
      );
    }
  };

  emitChange = () => {
    if (this.props.onValueChange) {
      this.props.onValueChange(this.state.value);
    }
  };

  selectAll = (target) => {
    const { seperator = ',' } = this.props;
    const selectedIds = new Set(
      this.state.value.split(seperator).filter((item) => !!item)
    );
    const recur = (item) => {
      if (item.hasChildren) {
        item.showChildren = true;
        item.selectAll = true;
        item.children.forEach(recur);
      } else {
        item.selected = true;
        selectedIds.add(item.id);
      }
    };
    target.selectAll = true;
    recur(target);
    const value = Array.from(selectedIds).join(seperator);
    this.setState({ value }, () => {
      this.updateNodeVisibility();
      this.emitChange();
    });
  };

  unSelectAll = (target) => {
    const flattenData = [...(this.state.flattenData || [])];
    const { seperator = ',' } = this.props;
    const selectedIds = new Set(
      this.state.value.split(seperator).filter((item) => !!item)
    );
    const recur = (item) => {
      if (item.hasChildren) {
        item.selectAll = false;
        item.children.forEach(recur);
      } else {
        item.selected = false;
        selectedIds.delete(item.id);
      }
    };
    target.selectAll = false;
    recur(target);
    const value = Array.from(selectedIds).join(seperator);
    this.setState({ flattenData, value }, () => {
      this.emitChange();
      this.updateNodeVisibility();
    });
  };

  renderItem = ({ item, index }) => {
    const {
      ItemComponent = TreePickerItem,
      itemWrapperStyle,
      activeOpacity,
    } = this.props;

    const toggleSelectAll = () => {
      if (item.selectAll) {
        this.unSelectAll(item);
      } else {
        this.selectAll(item);
      }
    };

    if (!item.visible) return null

    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        style={itemWrapperStyle}
        onPress={(e) => this.onPressItem(e, item)}>
        <ItemComponent
          helpers={{
            toggleSelectAll,
          }}
          item={item}
          index={index}></ItemComponent>
      </TouchableOpacity>
    );
  };

  keyExtractor = (item, index) => {
    return item.id;
  };

  render() {
    const { style } = this.props;

    return (
      <FlatList
        style={style}
        keyExtractor={this.keyExtractor}
        data={this.state.flattenData}
        renderItem={this.renderItem}></FlatList>
    );
  }
}
