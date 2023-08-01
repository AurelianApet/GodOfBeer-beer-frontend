import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import SelEachItem from './selEachItem';

class SelectedItems extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sSelDatas : [],
    }
  }
  componentDidMount() {
    const { onRef } = this.props;
    onRef( this );
    this.setState({sSelDatas : this.props.itemDatas});
  }

  handleLoading = (chanedSelDatas) => {
    this.setState({sSelDatas : chanedSelDatas});
  }

  render() {
    const { sSelDatas } = this.state;
    return (
      <div className="selectedItems">
        {!!sSelDatas && sSelDatas.length > 0 && 
          _.map(sSelDatas, (eachItem, index) => {
            return(
              <SelEachItem 
                key = {`modal-eachItem-${eachItem.id}`}
                pText = {eachItem.text}
                pId = {eachItem.id}
                pHandleCloseItem = {this.props.pHandleCloseItem}
                pHandleClickItem = {this.props.pHandleClickItem}
              />
            )
          })
        }
      </div>
    )
  }
}

SelectedItems.propTypes = {
  itemDatas: PropTypes.array,
  pHandleCloseItem: PropTypes.func,
  pHandleClickItem: PropTypes.func
};

SelectedItems.defaultProps = {
  itemDatas: [],
  pHandleCloseItem: null,
  pHandleClickItem: null,
};

export default SelectedItems;