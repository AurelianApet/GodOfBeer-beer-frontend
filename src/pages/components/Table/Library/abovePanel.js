import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import LANG from '../../../../language';
import ColumnEditor from '../../ColumnEditor';
import { exportWord, exportExcel } from '../../../../library/utils/export';


class AbovePanel extends Component {
  constructor(props) {
    super(props);

    const defaultVisible = _.get(props.pColumnEditor, 'defaultVisible') || [];

    this.state = {
      sIsColumnEditorOpen: false,
      sShowedColumns: defaultVisible,
    };
    
  }

  handleExportWord = () => {
    const { pExportInfo } = this.props;
    let exportData;
    if ( pExportInfo.columns && pExportInfo.data ) {
      exportData = {
        title: _.get(pExportInfo, 'exportInfo.title') || LANG('BASIC_REPORT'),
        table: {sColumns: pExportInfo.columns, table: pExportInfo.data},
      }
    }
    exportWord(exportData);
  }

  handleExportExcel = () => {
    const { pExportInfo } = this.props;
    let exportData;
    if ( pExportInfo.columns && pExportInfo.data ) {
      exportData = {
        title: _.get(pExportInfo, 'exportInfo.title') || LANG('BASIC_REPORT'),
        table: {sColumns: pExportInfo.columns, table: pExportInfo.data},
      }
    }
    exportExcel(exportData);
  }

  handleExportPDF = () => {
  }

  handleNewClick = (e) => {
    e.stopPropagation();
    if (this.props.pHandleNewButtonClick) {
      this.props.pHandleNewButtonClick();
    } else {
      this.props.history.push(this.props.pNewButtonRoute);
    }
  }

  handleOpenColumnEditor = () => {
    const { pIsEditMode } = this.props;
    if (pIsEditMode && pIsEditMode()) {
      return;
    }
    this.setState({
      sIsColumnEditorOpen: true,
    })
  }

  handleAcceptShowedColumns = (aData) => {
    this.setState({
      sShowedColumns: aData,
    });
    const pHandleChange = _.get(this.props.pColumnEditor, 'handleChange');
    if (pHandleChange) {
      pHandleChange(aData);
    }
  }

  handleClickColumnEditorClose = () => {
    this.setState({
      sIsColumnEditorOpen: false,
    })
  }

  render() {
    const { pHasExportButtons, pHasNewButton, pColumnEditor } = this.props;
    const { sIsColumnEditorOpen, sShowedColumns } = this.state;
    const hasColumnEditor = !!_.get(pColumnEditor, 'enabled');
    const totalColumns = _.get(pColumnEditor, 'totalColumns') || [];
    return (
      <div className="component-table-abovepanel-container">
        <div className="panel-left">&nbsp;</div>
        <div className="panel-middle">&nbsp;</div>
        <div className="panel-right">
          { pHasExportButtons &&
            <div className="export-buttons">
              <div className="export-pdf-btn" onClick={this.handleExportPDF} title={LANG('BASIC_PRINT_PDF')}/>
              <div className="export-excel-btn" onClick={this.handleExportExcel} title={LANG('BASIC_PRINT_EXCEL')}/>
              <div className="export-word-btn" onClick={this.handleExportWord} title={LANG('BASIC_PRINT_WORD')}/>
            </div>
          }
          { hasColumnEditor &&
            <div className="column-editor">
              <i className='fa fa-list-alt' onClick={this.handleOpenColumnEditor} title={LANG('BASIC_EDIT_COLUMNS')}/>
            </div>
          }
          { pHasNewButton &&
            <div
              id="table_add_button"
              className="create-btn"
              title={`${LANG('BASIC_NEW_ADD')} ( Ctrl + Alt + N )`}
              onClick={this.handleNewClick}
            />
          }
        </div>
        {sIsColumnEditorOpen &&
          <ColumnEditor
            title={LANG('BASIC_EDIT_COLUMNS')}
            className='staff-list-view-table-column-editor'
            defaultColumns={sShowedColumns}
            columns={totalColumns}
            pHandleClickClose={this.handleClickColumnEditorClose}
            pHandleClickYes={this.handleAcceptShowedColumns}
          />
        }
      </div>
    )
  }
}

AbovePanel.propTypes = {
  pHasExportButtons: PropTypes.bool,
  pHasNewButton: PropTypes.bool,
  pNewButtonRoute: PropTypes.string,
  pHandleNewButtonClick: PropTypes.func,
  pIsEditMode: PropTypes.func,
  pColumnEditor: PropTypes.object,
  pExportInfo: PropTypes.object,
}

AbovePanel.defaultProps = {
  pHasExportButtons: true,
  pHasNewButton: false,
  pNewButtonRoute: '',
  pHandleNewButtonClick: null,
  pColumnEditor: {
    enabled: false,
    defaultHidden: [],
    handleChange: null,
  },
  pExportInfo: {
    columns: [],
    data: [],
  }
};

export default withRouter(AbovePanel);