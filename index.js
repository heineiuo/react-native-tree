import React from 'react'
import { Text, View, TouchableOpacity, FlatList } from 'react-native'

class DefaultItemComponent extends React.Component {
  props: {
    item: any
  }
  render() {
    const { item } = this.props
    return (
      <View
        style={{
          paddingLeft: item.level * 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: item.selected ? '#ccc' : 'transparent',
          }}
        >
          <View style={{ width: 40 }}>
            {item.hasChildren && <Text>{item.showChildren ? 'x' : 'o'}</Text>}
          </View>
          <Text>{item.name}</Text>
          {true && (
            <>
              <Text
                style={{
                  paddingLeft: 20,
                  color: '#999',
                }}
              >
                (
              </Text>
              <Text
                style={{
                  color: '#999',
                }}
              >
                {item.selected ? 'selected' : 'unselected'}
                {` / `}
                {item.showChildren ? 'showing' : 'hiding'}
                {` / `}
                {item.hasChildren ? 'hasChild' : 'noChild'}
                {` / `}
                {item.hasChildren ? `${item.children.length}` : '0'}
              </Text>
              <Text
                style={{
                  color: '#999',
                }}
              >
                )
              </Text>
            </>
          )}
        </View>
      </View>
    )
  }
}

export class TreePicker extends React.Component {
  constructor(props) {
    super(props)

    const flattenData = this.flattenData(props)

    this.state = {
      value: props.value,
      flattenData,
    }
  }

  props: {
    /**
     * 是否支持多选，默认false
     */
    multiple: boolean
    /**
     * 是否只读，默认false
     */
    readOnly?: boolean
    data: any[]
    value?: string
    /**
     * value的分割符
     */
    seperator?: string
    ItemComponent?: any
  }

  componentDidMount() {
    this.updateNodeVisibility()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value })
    }
  }

  flattenData = (props) => {
    const {
      data = [],
      keyOfChildren = 'children',
      keyOfName = 'name',
      keyOfId = 'id',
      value = '',
    } = props
    const makeParentBranchShowChildren = (parent) => {
      if (parent) {
        parent.showChildren = true
        makeParentBranchShowChildren(parent.parent)
      }
    }

    const result = []

    const recur = (item, parent = null, level = 0) => {
      const id = item[keyOfId]
      const name = item[keyOfName]
      const children = item[keyOfChildren]

      const originalItem = { ...item }
      delete originalItem[keyOfChildren]

      const hasChildren = children && children.length > 0

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
      }

      if (node.selected) {
        makeParentBranchShowChildren(node.parent)
      }

      result.push(node)

      if (hasChildren) {
        node.children = children.map((childItem) => {
          return recur(childItem, node, level + 1)
        })
      }
      return node
    }

    data.forEach((item) => recur(item))

    return result
  }

  updateNodeVisibility = () => {
    const flattenData = [...(this.state.flattenData || [])]
    // console.log('flattenData', flattenData)
    for (const node of flattenData) {
      node.visible = !node.parent
    }

    for (const node of flattenData) {
      if (node.hasChildren && node.showChildren) {
        for (const child of node.children) {
          child.visible = true
        }
      }
    }

    this.setState({
      flattenData,
    })
  }

  onPressItem = (e, item) => {
    const { readOnly, seperator = ',' } = this.props
    // console.log('onPressItem', item)
    const { value = '' } = this.state
    const itemInData = this.state.flattenData.find(
      (dataItem) => item.id === dataItem.id
    )
    if (itemInData.hasChildren) {
      this.setState(
        {
          flattenData: this.state.flattenData.map((dataItem) => {
            if (dataItem.id === item.id) {
              dataItem.showChildren = !dataItem.showChildren
            }
            return dataItem
          }),
        },
        this.updateNodeVisibility
      )
    } else {
      if (readOnly) return
      const valueIds = value
        .split(seperator)
        .filter((valueItem) => valueItem !== '')
        .filter((id) => id !== item.id)
      if (value.indexOf(item.id) === -1) {
        valueIds.push(item.id)
      }
      const nextValue = valueIds.join(seperator)
      if (this.props.onValueChange) {
        this.props.onValueChange(nextValue)
      }
      this.setState(
        {
          value: nextValue,
          flattenData: this.state.flattenData.map((dataItem) => {
            if (dataItem.id === item.id) {
              dataItem.selected = !dataItem.selected
            }
            return dataItem
          }),
        },
        this.updateNodeVisibility
      )
    }
  }

  renderItem = ({ item, index }) => {
    // console.log('item', item.visible, item.name)
    const {
      ItemComponent = DefaultItemComponent,
      itemWrapperStyle,
      activeOpacity,
    } = this.props
    if (!item.visible) return null
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        style={itemWrapperStyle}
        onPress={(e) => this.onPressItem(e, item)}
      >
        <ItemComponent item={item} index={index}></ItemComponent>
      </TouchableOpacity>
    )
  }

  keyExtractor = (item, index) => {
    return item.id
  }

  render() {
    const { style } = this.props

    return (
      <FlatList
        style={style}
        keyExtractor={this.keyExtractor}
        data={this.state.flattenData}
        renderItem={this.renderItem}
      ></FlatList>
    )
  }
}
