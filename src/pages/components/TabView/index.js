import React, { Component } from 'react';
import PropTypes from 'prop-types';

export class Tab extends Component {
  render() {
    return <div>{this.props.children}</div>
  }
}

export class TabView extends Component {
  constructor(props) {
    super(props)

    // initialize state
    this.state = { selectedIndex: props.all ? 0 : 1 }
  }

  componentWillMount () {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  componentWillUnmount () {
    if (this.props.onRef) {
      this.props.onRef(undefined);
    }
  }

  pSetSelected = (index) => {
    this.handleSelectTab(index);
  }

  handleSelectTab = (i) => {
    this.setState({
      selectedIndex: i
    })
    if(this.props.handleTabSelect) {
      this.props.handleTabSelect(i)
    }
  }

  render() {
    const {all, allTitle, title, passProps, headerClassName, bodyClassName, hasBackground } = this.props
    const {selectedIndex} = this.state;
    let headers = []
    let bodies = []

    if(all) {
      headers.push(
        <div key={0} className={'tab-title'+(selectedIndex===0 ? ' selected' : '')} onClick={this.handleSelectTab.bind(this, 0)}>
          {allTitle || 'All'}
        </div>
      )
    }
    for(let i=0; i<this.props.children.length; i++) {
      if(this.props.children[i]){
        headers.push(
          <div key={i+1} className={'tab-title'+(selectedIndex===i+1 ? ' selected' : '')} onClick={this.handleSelectTab.bind(this, i+1)}>
            {this.props.children[i].props.title}
            <i className={this.props.children[i].props.preIcon}></i>
          </div>
        )
        let childrenWithProps = null
        const isSelected = (selectedIndex===0 || selectedIndex===i+1)
        const isAllSelected = selectedIndex===0
        if(!!passProps) {
          childrenWithProps = React.cloneElement(this.props.children[i].props.children, { isSelected: isSelected, isAllSelected: isAllSelected })  
        } else {
          childrenWithProps = this.props.children[i].props.children
        }
        bodies.push(
          <div key={i+1} className={'tab'+(isSelected ? ' selected': '')}>
            {childrenWithProps}
          </div>
        )  
      }      
    }
    
    let contentHeader = headers;

    return (
      <div className="tab-view">
        {hasBackground && <div key="tab-background" className="tab-background"/>}
        <div className={`tab-header ${headerClassName}`}>
          {title && <div className="tab-view-title">{title}</div>}
          {contentHeader}
        </div>
        <div className={`tab-body ${bodyClassName}`}>
          {(all && selectedIndex === 0) ? bodies : bodies[selectedIndex - 1]}
        </div>
      </div>
    )
  }
}

TabView.propTypes = {
  all: PropTypes.bool,
  allTitle: PropTypes.string,
  title: PropTypes.string,
  passProps: PropTypes.object,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  hasBackground: PropTypes.bool,
  preIcon: PropTypes.string,
  handleTabSelect: PropTypes.func,
  onRef: PropTypes.func,
};

TabView.defaultProps = {
  all: false,
  allTitle: '전체',
  title: null,
  hasBackground: false,
  passProps: null,
  headerClassName: '',
  bodyClassName: '',
  preIcon: '',
  handleTabSelect: () => {},
}
