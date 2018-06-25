/**
 * Copyright 2013 Jonathan Miles

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 *
 * ADAPTED 2018:
 *
 * Jan-Jaap Korpershoek
 */
import React from 'react';
import PropTypes from 'prop-types';

export class TreeView extends React.Component {

    constructor(props) {
        super(props);
    }

  setNodeId(node) {

    if (!node.nodes) return;

    var _this = this;
    node.nodes.forEach(function checkStates(node) {
      node.nodeId = _this.props.nodes.length;
      _this.props.nodes.push(node);
      _this.setNodeId(node);
    });
  }

  render() {
    let {data} = this.props;
    this.setNodeId({ nodes: data });

    var children = [];
    if (data) {
      var _this = this;
      let key = 0;
      data.forEach(function (node) {
        children.push(<TreeNode key={key}
                                node={node}
                                level={1}
                                visible={true}
                                options={_this.props.options} />);
        key++;
      });
    }

    return (
      <div id='treeview' className='treeview'>
        <ul className='list-group'>
          {children}
        </ul>
      </div>
    );
  }
}

TreeView.propTypes = {
    levels: PropTypes.number,

    expandIcon: PropTypes.string,
    collapseIcon: PropTypes.string,
    emptyIcon: PropTypes.string,
    nodeIcon: PropTypes.string,

    color: PropTypes.string,
    backColor: PropTypes.string,
    borderColor: PropTypes.string,
    onhoverColor: PropTypes.string,
    selectedColor: PropTypes.string,
    selectedBackColor: PropTypes.string,

    enableLinks: PropTypes.bool,
    highlightSelected: PropTypes.bool,
    showBorder: PropTypes.bool,
    showTags: PropTypes.bool,

    nodes: PropTypes.arrayOf(PropTypes.number)
  };

TreeView.defaultProps = {
        levels: 2,

        expandIcon: 'glyphicon glyphicon-plus',
        collapseIcon: 'glyphicon glyphicon-minus',
        emptyIcon: 'glyphicon',
        nodeIcon: 'glyphicon glyphicon-stop',

        color: undefined,
        backColor: undefined,
        borderColor: undefined,
        onhoverColor: '#F5F5F5', // TODO Not implemented yet, investigate radium.js 'A toolchain for React component styling'
        selectedColor: '#FFFFFF',
        selectedBackColor: '#428bca',

        enableLinks: false,
        highlightSelected: true,
        showBorder: true,
        showTags: false,

        nodes: []
    };

export class TreeNode extends React.Component {

    constructor(props) {
        super(props);

        let node = this.props.node;
        this.state = {
            expanded: (node.state && node.state.hasOwnProperty('expanded')) ?
                node.state.expanded :
                (this.props.level < this.props.options.levels),
            selected: (node.state && node.state.hasOwnProperty('selected')) ?
                node.state.selected :
                false
        };
    }

  toggleExpanded(id, event) {
    this.setState({ expanded: !this.state.expanded });
    event.stopPropagation();
  }

  toggleSelected(id, event) {
    this.setState({ selected: !this.state.selected });
    event.stopPropagation();
  }

  render() {

    var node = this.props.node;
    var options = this.props.options;

    var style;
    if (!this.props.visible) {

      style = { 
        display: 'none' 
      };
    }
    else {

      if (options.highlightSelected && this.state.selected) {
        style = {
          color: options.selectedColor,
          backgroundColor: options.selectedBackColor
        };
      }
      else {
        style = {
          color: node.color || options.color,
          backgroundColor: node.backColor || options.backColor
        };
      }

      if (!options.showBorder) {
        style.border = 'none';
      }
      else if (options.borderColor) {
        style.border = '1px solid ' + options.borderColor;
      }
    } 

    var indents = [];
    for (var i = 0; i < this.props.level-1; i++) {
      indents.push(<span key={i} className='indent'></span>);
    }

    var expandCollapseIcon;
    if (node.nodes) {
      if (!this.state.expanded) {
        expandCollapseIcon = (
          <span className={options.expandIcon}
                onClick={this.toggleExpanded.bind(this, node.nodeId)}>
          </span>
        );
      }
      else {
        expandCollapseIcon = (
          <span className={options.collapseIcon}
                onClick={this.toggleExpanded.bind(this, node.nodeId)}>
          </span>
        );
      }
    }
    else {
      expandCollapseIcon = (
        <span className={options.emptyIcon}></span>
      );
    }

    var nodeIcon = (
      <span className='icon'>
        <i className={node.icon || options.nodeIcon}></i>
      </span>
    );

    var nodeText;
    if (options.enableLinks) {
      nodeText = (
        <a href={node.href} /*style="color:inherit;"*/>
          {node.text}
        </a>
      );
    }
    else {
      nodeText = (
        <span>{node.text}</span>
      );
    }

    var badges;
    if (options.showTags && node.tags) {
      badges = node.tags.map(function (tag) {
        return (
          <span className='badge'>{tag}</span>
        );
      });
    }

    var children = [];
    if (node.nodes) {
      var _this = this;
      let key=0;
      node.nodes.forEach(function (node) {
        children.push(<TreeNode key={key}
                                node={node}
                                level={_this.props.level+1}
                                visible={_this.state.expanded && _this.props.visible}
                                options={options} />);
        key++;
      });
    }

    return (
      <li className='list-group-item'
          style={style}
          onClick={this.toggleSelected.bind(this, node.nodeId)}
          key={node.nodeId}>
        {indents}
        {expandCollapseIcon}
        {nodeIcon}
        {nodeText}
        {badges}
        {children}
      </li>
    );
  }
}

