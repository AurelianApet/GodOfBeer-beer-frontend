import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import onClickOutside from 'react-onclickoutside';

import { 
  CELL_TYPE_NO, 
  CELL_TYPE_STRING, 
  ALIGN_CENTER, 
  ALIGN_LEFT
} from '../../components/Table';
import APITable, { ROW_SELECTION_MULTI, ROW_SELECTION_SINGLE } from '../Table/APITable';

import LANG from '../../../language';
import { Button } from '../Button';

class Option extends Component {  
  componentWillMount() {
    document.addEventListener('keydown', this.handleKeyDown, false);
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }

  getResultRows = (rows) => {
    if (!rows || rows.length === 0) {
      return [];
    }
    return _.map(rows, (row, rowIndex) => {
      const newRow = {...row};
      newRow.team = newRow.item;
      if (!this.props.pKeepPrimaryKey) {
        delete newRow._id;
      }
      return newRow;
    });
  }

  handleKeyDown = (e) => {
    if ( e.key === 'Escape' ) {
      this.handleCloseButtonClick(e);
    }
  }
  handleClickOutside(e) {
    e.stopPropagation();
    e.preventDefault();
  }
  handleCloseButtonClick = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (this.props.pHandleCloseClick) {
      this.props.pHandleCloseClick();
    }
  }
  handleYesButtonClick = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (this.props.pHandleYes && this.apiTable) {
      const getSelectedRows = this.apiTable.pGetSelectedRows();
      this.props.pHandleYes(this.getResultRows(getSelectedRows));
    }
    this.handleCloseButtonClick(null);
  }
  handleEditComplete = (rows, added, changed, deleted) => {
    if (!!added) {
      let rowIndex = _.keys(added)[0];
      if (typeof(added[rowIndex]) === "undefined") 
        return;
      this.apiTable.pExecuteAPICreate([{
        kind: this.props.pKind,
        item: added[rowIndex].item,
      }]);
    }
    if (!!changed) {
      // get row index
      let rowIndex = _.keys(changed)[0];
      if (typeof(changed[rowIndex]) === "undefined") 
        return;
      // update table
      this.apiTable.pExecuteAPIUpdate(rows[rowIndex], [{
        item: changed[rowIndex].item
      }]);
    }
    if (!!deleted) {
      this.apiTable.pExecuteAPIDelete(rows[deleted[0]], null);
    }
  }

  render() {
    const { pTitle, pCanSelectMultiRow, pDefaultSelectedRows } = this.props;

    return (
      <div className="option-modal">
        <div className="option-modal-all">
          <div className="option-content">
            <div className="option-header">
              <div className="option-title">
                {pTitle}
              </div>
              <div className="option-close" onClick={this.handleCloseButtonClick.bind(this)}>
                <i className="fa fa-close"></i>
              </div>
            </div>
            <div className="option-body">
              <div className="option-table">
                <APITable
                  onRef={ref => (this.apiTable = ref)}
                  pID='table_option_component'
                  pColumns={[
                    {
                      name: 'no',
                      title: LANG('COMP_TABLE_COLUMN_NO'),
                      width: 50,
                      type: CELL_TYPE_NO,
                    },
                    {
                      name: 'item',
                      title: LANG('COMP_TABLE_COLUMN_ITEM'),
                      alignHeader: ALIGN_CENTER,
                      alignContent: ALIGN_LEFT,
                      type: CELL_TYPE_STRING,
                      isEditable: true,
                      checkValidation: (value, row) => {
                        if (value)
                          return null; // no error
                        return LANG('COMP_OPTION_ITEM_VALIDATION');
                      }
                    },
                  ]}
                  pAPIInfo={{
                    select: {
                      queries: [{
                        method: 'get',
                        url: '/options',
                        params: {
                          kind: this.props.pKind,
                        },
                      }],
                      callback: (res, funcSetTableRows) => {
                        funcSetTableRows(res[0].docs);
                      }
                    },
                    create: {
                      queries: [{
                        method: 'post',
                        url: '/options',
                      }],
                      callback: (res, funcAddTableRows) => {
                        funcAddTableRows([res[0].doc]);
                      }
                    },
                    update: {
                      queries: [{
                        method: 'put',
                        url: '/options/:id',
                      }],
                      callback: (res, row, funcUpdateTableRows) => {
                        funcUpdateTableRows([row]);
                      },
                    },
                    delete: {
                      queries: [{
                        method: 'delete',
                        url: '/options/:id',
                      }],
                      callback: (res, row, funcDeleteTableRows) => {
                        funcDeleteTableRows([row]);
                      },
                    },
                  }}
                  pThemeInfo={{
                    body: {
                      editable: {
                        enabled: true,
                        hasAdding: true,
                        hasDeleting: true,
                        handleEditComplete: this.handleEditComplete,
                      },
                      row: {
                        selection: {
                          type: pCanSelectMultiRow ? ROW_SELECTION_MULTI : ROW_SELECTION_SINGLE,
                          defaultSelected: pCanSelectMultiRow ? pDefaultSelectedRows : [],
                          selectedClassName: 'row-selected',
                        },
                        handleRowDoubleClick: !pCanSelectMultiRow ? this.handleYesButtonClick : null, // only used in SELECTION_SIN !GLE
                      }
                    },
                    pagination: {
                      enabled: false,
                    }
                  }}
                />
              </div>
              <div className="option-buttons">
                <Button className="option-button button-yes" onClick={this.handleYesButtonClick}>{LANG('BASIC_ALERTMSG_YES')}</Button>
                <Button className="option-button button-no" onClick={this.handleCloseButtonClick}>{LANG('BASIC_ALERTMSG_NO')}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Option.propTypes = {
  pKeepPrimaryKey: PropTypes.bool,
  pDefaultSelectedRows: PropTypes.array,
  pCanSelectMultiRow: PropTypes.bool.isRequired,
  pKind: PropTypes.string.isRequired,
  pTitle: PropTypes.string.isRequired,
  pHandleCloseClick: PropTypes.func.isRequired,
  pHandleYes: PropTypes.func.isRequired,
};

Option.defaultProps = {
  pKeepPrimaryKey: false,
  pDefaultSelectedRows: [],
  pCanSelectMultiRow: true,
  pKind: '',
  pTitle: '',
  pHandleCloseClick: () => {},
  pHandleYes: () => {},
};

export default onClickOutside(Option);
