import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';

import ComponentArray, { TYPE_INPUT, TYPE_SELECT, TYPE_RADIO } from '../ComponentArray';
import { Button } from '../Button';

class QueryPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
    document.addEventListener('keydown', this.handleKeyDown, false);
  }

  componentDidMount() {
    const { defaultQuery } = this.props;
    this.queryData = defaultQuery || [];
  }

  componentWillReceiveProps = ( newProps ) => {
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }

  handleKeyDown = (e) => {
    if ( e.key === 'Escape' ) {
      this.handleCloseBtn(e);
    }
  }

  handleCloseBtn = (e) => {
    if ( e ) {
      e.stopPropagation();
    }
    const { pHandleClickClose } = this.props;
    pHandleClickClose();
  }

  handleClickComponent = (e) => {
    e.stopPropagation();
  }

  handleQueryChange = ( aValues ) => {
    this.queryData = aValues;
  }

  handleClickClear = () => {
    const { pHandleClearFilter, pHandleClickClose } = this.props;
    pHandleClearFilter();
    pHandleClickClose();
  }

  handleClickConfirm = () => {
    const { totalData, pHandleClickClose, pHandleClickYes } = this.props;
    if ( this.queryData && this.queryData[0] && this.queryData[0].field && this.queryData[0].value ) {
      let originData = totalData;
      let filteredData = [];
      let condition = 'false';
      _.map( this.queryData, ( queryItem, queryIndex ) => {
        if ( queryItem.field && queryItem.value ) {
          let tmpFilteredData = [];
          _.map( originData, ( targetItem, targetIndex ) => {
            const targetValue = _.get( targetItem, queryItem.field );
            if ( targetValue && targetValue.toString().indexOf( queryItem.value.toString() ) !== -1 ) {
              tmpFilteredData.push(targetItem);
            }
          });
          if ( condition === 'false') {
            let tmp = [];
            _.map( filteredData, ( item, index ) => {
              tmp.push( item );
            });
            _.map( tmpFilteredData, ( item, index ) => {
              tmp.push( item );
            });
            filteredData = tmp;
          } else {
            filteredData = tmpFilteredData;
          }
          if ( queryItem.condition && queryItem.condition === 'true' ) {
            originData = filteredData;
          }
          condition = queryItem.condition || 'false';
        }
      });
      pHandleClickYes( filteredData, this.queryData );
      pHandleClickClose();
    }
  }

  render() {
    const { title, className, totalColumn, defaultQuery } = this.props;
    let columns = [{name: '', title: '',}];
    _.map( totalColumn, ( columnItem, columnIndex ) => {
      columns.push( columnItem );
    });
    return (
      <div className='component-query-panel-background' onClick={this.handleCloseBtn.bind( this )}>
        <div className={cn( 'component-query-panel', className )} onClick={this.handleClickComponent.bind( this )}>
          <div className='title-div'>{title}</div>
          <div className='query-container'>
            <ComponentArray
              arrayInfo={{
                types: [
                  {
                    name: 'field',
                    title: '마당',
                    type: TYPE_SELECT,
                    values: columns,
                  },
                  {
                    name: 'value',
                    title: '값',
                    type: TYPE_INPUT,
                  },
                  {
                    name: 'condition',
                    title: '조건',
                    type: TYPE_RADIO,
                    values: [
                      {value: 'true', title: 'AND'},
                      {value: 'false', title: 'OR'},
                    ],
                  }
                ]
              }}
              defaultData={defaultQuery || []}
              onChange={this.handleQueryChange.bind()}
            />
          </div>
          <Button
            className='confirm-query-button'
            onClick={this.handleClickConfirm.bind( null )}
          >
            확인
          </Button>
          <Button
            className='clear-query-button'
            onClick={this.handleClickClear.bind( null )}
          >
            검색취소
          </Button>
          <i className='fa fa-close cancel-query-button' onClick={this.handleCloseBtn.bind( null )} />
        </div>        
      </div>
    );
  }
}

QueryPanel.propTypes = {
  title: PropTypes.string,
  className: PropTypes.string,
  defaultQuery: PropTypes.array,
  totalData: PropTypes.array,
  totalColumn: PropTypes.array,
  pHandleClickClose: PropTypes.func,
  pHandleClickYes: PropTypes.func,
  pHandleClearFilter: PropTypes.func,
};

QueryPanel.defaultProps = {
  title: '고급검색',
  className: '',
  defaultQuery: [],
  totalData: [],
  totalColumn: [],
  pHandleClickClose: () => {},
  pHandleClickYes: () => {},
  pHandleClearFilter: () => {},
};

export default QueryPanel;
