import React, { Component } from 'react';
import cn from 'classnames';
import _ from 'lodash';
import DataTable from '../../../components/Table';
import { MODE_READ } from '../../APIForm';

export class APIFormDataTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  componentDidMount = () => {
    const { onRef, defaultData } = this.props;
    onRef( this );
    this.value = defaultData || [];
    this.setState({
      tableData: this.value,
    })
    this.setData( this.props );
  }

  componentWillReceiveProps = ( newProps ) => {
    if ( !_.isEqual( newProps.defaultData, this.props.defaultData ) ) {
      this.value = newProps.defaultData || [];
      this.setState({
        tableData: this.value,
      })
    }
    this.setData( newProps );
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
  }

  setData = ( aProps ) => {
    const { item } = aProps;
    if ( item.value ) {
      this.value = item.value;
    }
    this.checkValidation();
  }

  checkValidation = () => {
    const { item, parent } = this.props;
    const validationResult = parent.checkItemValidate( this.value, item );
    this.setState({
      error: validationResult.error,
    });
  }

  getFocus = () => {
    
  }

  handleInputTable = ( rows, added, changed, deleted ) => {
    let tmpData = [];
    _.map( rows, ( item, index ) => {
      tmpData.push( item );
    });
    if ( added ) tmpData.push( added[0] );
    if ( changed ) {
      let index = _.keys( changed )[0];
      const { tableData } = this.state;
      tmpData = tableData;
      tmpData[index] = changed[index];
    }
    if (deleted){
      let tmp = [];
      _.map( rows, ( item, index ) => {
        if ( item.title !== rows[deleted].title ) {
          tmp.push( item );
        }
      });
      tmpData = tmp;
    }
    this.setState({
      tableData: tmpData,
    });
    this.value = tmpData;
    this.checkValidation();
  }
  
  render() {
    const { mode, item, index, isErrBorder } = this.props;
    const { error, tableData } = this.state;
    return (
      <DataTable
        key={index}
        className={cn('apiForm-datatable', isErrBorder && !!error? 'apiform-error' : '')}
        pData={tableData}
        pColumns={_.get(item, 'tableSetting.columns')}
        pHasPagination={_.get(item, 'tableSetting.pHasPagination')}

        pIsEditable={mode.mode !== MODE_READ && _.get(item, 'tableSetting.pIsEditable')}
        pHasDeleting={mode.mode !== MODE_READ && _.get(item, 'tableSetting.pHasDeleting')}
        pHasAdding={mode.mode !== MODE_READ && _.get(item, 'tableSetting.pHasAdding')}

        pHasMultiCheckbox={_.get(item, 'tableSetting.pHasMultiCheckbox')}
        pHandleEditComplete={this.handleInputTable.bind()}
      />
    );
  }
}

APIFormDataTable.propTypes = {
  
};

APIFormDataTable.defaultProps = {
  
};

export default APIFormDataTable;