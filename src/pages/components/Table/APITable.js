import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import LANG from '../../../language';
import DataTable, { getCurrentRows } from './index';

import { SlideShow } from '../Slideshow';
import { executeQuery } from '../../../library/utils/fetch';
import { removeFromArray } from '../../../library/utils/array';
import { confirmAlertMsg } from '../../../library/utils/confirmAlert';
import { getPagePermission } from '../../../library/utils/permission';
import { processErrorResponse, pushNotification, NOTIFICATION_TYPE_WARNING } from '../../../library/utils/notification';

import UnreadNotification from './Library/unreadNotification';
import AbovePanel from './Library/abovePanel';

export const ROW_SELECTION_NONE = 0;
export const ROW_SELECTION_SINGLE = 1;
export const ROW_SELECTION_MULTI = 2;

const CONNECTION_STATUS_NONE = 0; 
const CONNECTION_STATUS_API_SELECT = 1; // doing select
const CONNECTION_STATUS_API_READ = 2; // doing read
const CONNECTION_STATUS_API_CREATE = 3; // doing create
const CONNECTION_STATUS_API_UPDATE = 4; // doing update
const CONNECTION_STATUS_API_DELETE = 5; // doing delete

class APITable extends Component {
  constructor(props) {
    super(props);   

    // store query results
    this.m_storeQuery = {
      currentIndex: 0,
      results: {},
      error: null,
    };

    // seleted row for setting read flag
    this.m_rowOperating = null;

    // selection info
    this.m_rowSelected = [];

    // visible columns
    const totalColumns = props.pColumns;
    const defaultHidden = _.get(props, 'pThemeInfo.above.columnEditor.defaultHidden') || [];
    let visibleColumns = [];
    _.map(totalColumns, (column) => {
      const found = defaultHidden.indexOf(column.name) >= 0;
      if(!found) {
        visibleColumns.push(column.name);
      }
    })

    // state variables
    this.state = {
      // Status
      sConnectionStatus: CONNECTION_STATUS_NONE,
      sIsEdittingStatus: false,

      // Rows, Columns Data
      sRows: [],
      sColumns: props.pColumns,
      sFilterCallback: props.pFilterCallback,

      // Notification
      sUnreadRows: [],

      // SlideShow
      sSlideShowVisible: false,
      sSlideShowCurrentIndex: 0,

      // ColumnEditor
      sVisibleColumns: visibleColumns,
    };
  }

  componentDidMount() {
    if (this.props.onRef) {
			this.props.onRef(this);
    }
    if (this.props.pDisableFirstFetch) {
      return;
    }
    this.executeAPIQueries(CONNECTION_STATUS_API_SELECT, null);
  }

  componentWillUnmount() {
    if (this.props.onRef) {
			this.props.onRef(undefined);
    }
  }

  componentWillReceiveProps(newProps) {
    // filter callback changed
    if (newProps.pFilterCallback !== this.props.pFilterCallback) {
      this.setState({
        sFilterCallback: newProps.pFilterCallback,        
      });
      this.m_rowSelected = [];
    }

    // columns changed
    if (newProps.pColumns !== this.props.pColumns) {
      this.setState({ sColumns: newProps.pColumns });
      this.m_rowSelected = [];
    }
  }

  // ----- export public functions -----  
  pCheckReadyForOperation = () => {
    const { sIsEditting, sConnectionStatus } = this.state;
    // check condition
    if ( sIsEditting ) {
      pushNotification(NOTIFICATION_TYPE_WARNING, 'Table is in edit mode.');
      return false;
    }
    if ( sConnectionStatus !== CONNECTION_STATUS_NONE ) {
      pushNotification(NOTIFICATION_TYPE_WARNING, 'Table has been doing an API operation already.');
      return false;
    }
    return true;
  }
  pExecuteCustomQuery = (query, callback) => {
    if (!this.pCheckReadyForOperation() || !query) {
      return;
    }
    executeQuery({
      method: query.method || 'get',
      url: query.url || '',
      params: query.params || {},
      data: query.data || {},
      success: (res) => {
        callback(res);
      },
      fail: (err) => {
        processErrorResponse(err, this.props.history);
      }
    });
  }
  pExecuteAPISelect = () => {
    this.executeAPIQueries(CONNECTION_STATUS_API_SELECT, null);
  }
  pExecuteAPIRead = (aSelectedRow) => {
    this.processReadRow(aSelectedRow);
  }
  pExecuteAPICreate = (aFormDataArray) => {
    this.executeAPIQueries(CONNECTION_STATUS_API_CREATE, aFormDataArray);
  }
  pExecuteAPIUpdate = (aSelectedRow, aFormDataArray) => {
    if ( !this.checkSelectedRow(aSelectedRow) ) {
      return;
    }
    this.m_storeQuery.updateData = aFormDataArray && aFormDataArray.length > 0 ? aFormDataArray[0] : {};
    this.executeAPIQueries(CONNECTION_STATUS_API_UPDATE, aFormDataArray);
  }
  pExecuteAPIDelete = (aSelectedRow, aFormDataArray) => {
    const { location: { pathname } } = this.props;
    let confirmParam = {
      className: 'news-del-confirm',
      title: LANG('BASIC_ALERTMSG_TITLE'),
      detail: LANG('BASIC_ALERTMSG_DELETE'),
      confirmTitle: LANG('BASIC_ALERTMSG_YES'),
      noTitle: LANG('BASIC_ALERTMSG_NO'),
      confirmFunc: this.processDeleteRow.bind(this, aSelectedRow, aFormDataArray)
    };    
    confirmAlertMsg(confirmParam, pathname);
  }

  pFilterTableRows = (callback) => { // callback: (currentRows) => {return rows}
    this.setState({
      sFilterCallback: callback
    });
  }  
  pSetTableRows = (data) => {
    this.setState({
      sRows: data,
      sConnectionStatus: CONNECTION_STATUS_NONE
    });
  }
  pAddTableRows = (arrayAddedRows) => {
    this.setState({
      sConnectionStatus: CONNECTION_STATUS_NONE
    });
    if (!arrayAddedRows || arrayAddedRows.length === 0) {
      return;
    }
    const { sRows } = this.state;
    let newRows = sRows;
    _.map(arrayAddedRows, (row) => {
      sRows.push(row);
    })    
    this.setState({
      sRows: newRows
    });
  }
  pUpdateTableRows = (arrayUpdatedRows) => {
    const { pKey } = this.props;
    this.setState({
      sConnectionStatus: CONNECTION_STATUS_NONE
    });
    if (!arrayUpdatedRows || arrayUpdatedRows.length === 0) {
      return;
    }
    const { sRows } = this.state;
    let newRows = sRows;
    _.map(arrayUpdatedRows, (row) => {
      const primaryKey = _.get(row, pKey);
      const index = _.findIndex(newRows, function(n) { 
        return _.get(n, pKey) === primaryKey; 
      });
      _.set(newRows, '[' + index + ']', row);
    })    
    this.setState({
      sRows: newRows
    });
  }
  pDeleteTableRows = (arrayDeletedRows) => {
    const { pKey } = this.props;
    this.setState({
      sConnectionStatus: CONNECTION_STATUS_NONE
    });
    if (!arrayDeletedRows || arrayDeletedRows.length === 0) {
      return;
    }
    const { sRows } = this.state;
    let newRows = sRows;
    _.map(arrayDeletedRows, (aRow) => {
      newRows = removeFromArray(newRows, pKey, _.get(aRow, pKey));
    });
    this.setState({
      sRows: newRows,
    });
  }
  pGetSelectedRows = () => {
    return this.m_rowSelected;
  }
  pGetTotalRows = () => {
    return this.state.sRows || [];
  }
  pSetColumnMoreOptions = (columnIndex, attribute) => {
    const { sColumns } = this.state;
    let newColumns = sColumns;
    newColumns[columnIndex].moreOptions = attribute;
    this.setState({
      sColumns: newColumns
    });
  }

  // ----- execute APIInfo queries -----
  executeAPIQueries = (aAPIType, aFormDataArray) => {
    const { pAPIInfo } = this.props;
    if (!this.pCheckReadyForOperation()) {
      return;
    }

    // get queries according to type given 
    let queries = [], callback = null;
    switch (aAPIType) {
      case CONNECTION_STATUS_API_SELECT:
        queries = _.get(pAPIInfo, 'select.queries') || [];
        callback = _.get(pAPIInfo, 'select.callback') || null;
        break;
      case CONNECTION_STATUS_API_READ:
        queries = _.get(pAPIInfo, 'read.queries') || [];
        callback = _.get(pAPIInfo, 'read.callback') || null;
        break;
      case CONNECTION_STATUS_API_CREATE:
        queries = _.get(pAPIInfo, 'create.queries') || [];
        callback = _.get(pAPIInfo, 'create.callback') || null;
        break;
      case CONNECTION_STATUS_API_UPDATE:
        queries = _.get(pAPIInfo, 'update.queries') || [];
        callback = _.get(pAPIInfo, 'update.callback') || null;
        break;
      case CONNECTION_STATUS_API_DELETE:
        queries = _.get(pAPIInfo, 'delete.queries') || [];
        callback = _.get(pAPIInfo, 'delete.callback') || null;
        break;
      default:
        queries = [];
        callback = null;
        break;
    }

    // check query count
    if ( queries.length === 0 ) {
      return;
    }

    // execute query
    this.m_storeQuery.results = {};
    this.m_storeQuery.currentIndex = 0;
    this.m_storeQuery.error = null;
    const totalQueryNum = queries.length;

    // set loading flag
    if (aAPIType !== CONNECTION_STATUS_API_READ) {
      this.setState({
        sConnectionStatus: aAPIType,
      });
    }
    // execute queries
    _.map(queries, (query, queryIndex) => {
      let url = query.url;
      if (aAPIType === CONNECTION_STATUS_API_READ || aAPIType === CONNECTION_STATUS_API_UPDATE || aAPIType === CONNECTION_STATUS_API_DELETE ) {
        url = url.replace(/:id/ig, _.get(this.m_rowOperating, this.props.pKey));
      }
      const formData = _.get(aFormDataArray, `[${queryIndex}]`) || null;
      executeQuery({
        method: query.method || 'get',
        url: url || '',
        params: query.params || {},
        data: query.data || formData || {},
        success: (res) => {
          this.processQueryResults(true, res, aAPIType, queryIndex, totalQueryNum, callback);
        },
        fail: (err) => {
          this.processQueryResults(false, err, aAPIType, queryIndex, totalQueryNum, callback);
        }
      });
    })
  }
  processQueryResults = (isSuccessed, result, apiType, queryIndex, totalQueryNum, callback) => {
    this.m_storeQuery.results[queryIndex] = isSuccessed ? result : null;
    this.m_storeQuery.currentIndex++;
    if ( !isSuccessed ) {
      this.m_storeQuery.error = result;
    }
    if ( this.m_storeQuery.currentIndex >= totalQueryNum ) { // all queries called
      if ( !this.m_storeQuery.error ) { // success
        switch (apiType) {
          case CONNECTION_STATUS_API_SELECT:
            if ( callback ) { // has custom callback
              callback(this.m_storeQuery.results, this.pSetTableRows);
            } else {
              this.pSetTableRows([]);
            }
            break;
          case CONNECTION_STATUS_API_READ:
            if ( callback ) { // has custom callback
              callback(this.m_storeQuery.results, this.m_rowOperating, this.pUpdateTableRows);
            } else {
              this.pUpdateTableRows(null);
            }
            break;
          case CONNECTION_STATUS_API_CREATE:
              const createdRow = _.get(this.m_storeQuery, 'results[0].doc');
              if ( callback ) { // has custom callback
                callback(this.m_storeQuery.results, this.pAddTableRows);
              } else {
                
                this.pAddTableRows([createdRow]);
              }
            break;
          case CONNECTION_STATUS_API_UPDATE:
            const updatedRow = {...this.m_rowOperating, ...this.m_storeQuery.updateData};
            if ( callback ) { // has custom callback
              callback(this.m_storeQuery.results, updatedRow, this.pUpdateTableRows);
            } else {
              this.pUpdateTableRows([updatedRow]);
            }
            break;
          case CONNECTION_STATUS_API_DELETE:
              if ( callback ) { // has custom callback
                callback(this.m_storeQuery.results, this.m_rowOperating, this.pDeleteTableRows);
              } else {
                this.pDeleteTableRows([this.m_rowOperating]);
              }
            break;
          default:
            break;
          
        }
      } else {
        processErrorResponse(this.m_storeQuery.error, this.props.history);
        if (apiType !== CONNECTION_STATUS_API_READ) {
          this.setState({
            sConnectionStatus: CONNECTION_STATUS_NONE,
          });
        }
        if (apiType === CONNECTION_STATUS_API_UPDATE) {
          this.pUpdateTableRows([this.m_rowOperating]);
        }
      }
    }
  }

  // ----- SlideShow -----
  handleSlideShowOpen = (row) => {
    const { pKey } = this.props;
    const currentRows = getCurrentRows();
    let findIndex = null;
    _.map(currentRows, (rowItem, rowIndex) => {
      if (_.get(rowItem, pKey) === _.get(row, pKey)) {
        findIndex = rowIndex;
      }
    })
    if (findIndex !== null) {
      this.handleDetailModalShow(row, findIndex);
    }
    const triggerReadNotification = _.get(this.props.pThemeInfo, 'slideShow.triggerReadNotification');
    if (triggerReadNotification) {
      this.processReadRow(row);
    }
  }
  handleSlideChange = (aRowIndex) => {
    const triggerReadNotification = _.get(this.props.pThemeInfo, 'slideShow.triggerReadNotification');
    if (triggerReadNotification) {
      const currentRows = getCurrentRows();
      this.processReadRow(currentRows[aRowIndex]);
    }
  }
  handleDetailModalShow = (data, index, e) => {
    if (e) {
      e.preventDefault();
    }
    this.setState({
      sSlideShowVisible: true,
      sSlideShowCurrentIndex: index,
    });
  }
  handleSlideShowClose = (e) => {
    e.preventDefault();
    this.setState(prev => ({ sSlideShowVisible: !prev.sSlideShowVisible }));
  }

  // ----- Default Read/Update/Delete -----
  checkSelectedRow = (aRow) => {
    if ( !aRow ) {
      return false;
    }
    this.m_rowOperating = aRow;
    if ( !this.m_rowOperating ) {
      return false;
    }
    return true;
  }
  processReadRow = (aRow) => {
    if ( !this.checkSelectedRow(aRow) ) {
      return;
    }

    const { sUnreadRows } = this.state;
    const { pKey } = this.props;
    const primaryKey = _.get(this.m_rowOperating, pKey);
    if ( sUnreadRows && primaryKey !== null && sUnreadRows.indexOf(primaryKey) >= 0 ) { // is real unread rows ?      
      this.unreadNotification.pReadOneNotification(primaryKey);
      this.executeAPIQueries(CONNECTION_STATUS_API_READ, null);
    }
  }
  processDeleteRow = (aRow, aFormDataArray) => {
    if ( !this.checkSelectedRow(aRow) ) {
      return;
    }
    this.executeAPIQueries(CONNECTION_STATUS_API_DELETE, aFormDataArray);
  }
  checkIsEditMode = () => {
    if (!this.apiDataTable)
      return false;
    return !!this.apiDataTable.currentEditingType
  }

  // ----- Event handlers -----
  updateUnreadRows = (unreadRows, isUpdated) => {
    this.setState({
      sUnreadRows: unreadRows
    });
    if (isUpdated && this.state.sConnectionStatus === CONNECTION_STATUS_NONE) {
      this.executeAPIQueries(CONNECTION_STATUS_API_SELECT, null);
    }
  }
  handleDetailRowExpanded = (row, expanded) => {
    const triggerReadNotification = _.get(this.props.pThemeInfo, 'body.detailRow.triggerReadNotification');
    if (expanded && triggerReadNotification) {
      this.processReadRow(row);
    }
  }
  handleSelectionChange = (rows, selectedIndices) => {
    this.m_rowSelected = [];
    _.map(selectedIndices, (rowIndex) => {
      this.m_rowSelected.push(rows[rowIndex]);
    })
  }
  handleColumnEditorChange = (visibleColumns) => {
    this.setState({
      sVisibleColumns: visibleColumns,
    });
  }

  render () {
    const { user, menus, location: { pathname } } = this.props;
    const { pThemeInfo, pColumns, ...restProps } = this.props;
    const { sRows, sColumns, sVisibleColumns, sConnectionStatus, sUnreadRows, sFilterCallback } = this.state;
    const { sSlideShowVisible, sSlideShowCurrentIndex } = this.state;

    const emptyFunc = () => {};

    const hasHeaderRow = _.get(pThemeInfo, 'header.hasHeaderRow');
    const hasFiltering = _.get(pThemeInfo, 'header.hasFiltering');
    const hasSorting = _.get(pThemeInfo, 'header.hasSorting');
    const hasPagination = _.get(pThemeInfo, 'pagination.enabled');

    // editable info
    let isEditable = _.get(pThemeInfo, 'body.editable.enabled');    
    let hasAdding = _.get(pThemeInfo, 'body.editable.hasAdding');
    let hasDeleting = _.get(pThemeInfo, 'body.editable.hasDeleting');
    if (isEditable === undefined) { // editable is not undefined, use page permission
      const permission = getPagePermission(menus, pathname);
      isEditable = _.get(permission, 'update');
      hasAdding = _.get(permission, 'write');
      hasDeleting = _.get(permission, 'delete');
    }

    // above info
    const aboveInfo = _.get(pThemeInfo, 'above');
    const filteredColumns = _.filter(sColumns, (column) => {
      const found = sVisibleColumns.indexOf(column.name) >= 0;
      if (found) 
        return true;
      return false;
    });

    // filter rows if there is external filter func
    const filteredRows = sFilterCallback ? sFilterCallback(sRows) : sRows;

    return (
      <div className="component-apitable-container" id={this.props.pID}>
        <UnreadNotification
          onRef={(ref) => (this.unreadNotification = ref)}
          notificationID={_.get(this.props, 'pAPIInfo.read.notificationID')}
          updateUnreadRows={this.updateUnreadRows}
        />        
        { aboveInfo && 
          <div className="table-above-panel">
            <AbovePanel
              pHasExportButtons={_.get(aboveInfo, 'hasExportButtons')}
              pHasNewButton={_.get(aboveInfo, 'hasNewButton')}
              pNewButtonRoute={_.get(aboveInfo, 'newButton.route') || ''}
              pHandleNewButtonClick={_.get(aboveInfo, 'newButton.handleClick')}
              pIsEditMode={this.checkIsEditMode}
              pExportInfo={{
                columns: filteredColumns,
                data: filteredRows,
                exportInfo: _.get(aboveInfo, 'export'),
              }}
              pColumnEditor={{
                enabled: !!_.get(aboveInfo, 'columnEditor.enabled'),
                defaultVisible: sVisibleColumns,
                totalColumns: pColumns,
                handleChange: this.handleColumnEditorChange
              }}
            />
          </div>
        }
        <DataTable
          {...restProps}
          onRef = { ref => ( this.apiDataTable  = ref ) }
          pCurrentUser={user}
          pColumns={filteredColumns}
          pData={filteredRows}
          pUnreadRows={sUnreadRows}

          pIsLoading={sConnectionStatus !== CONNECTION_STATUS_NONE}

          pClassName={_.get(pThemeInfo, 'className') || ''}
          pAboveInfo={_.get(pThemeInfo, 'above') || null}

          pHasHeaderRow={hasHeaderRow === undefined ? true : hasHeaderRow}
          pHasFiltering={hasFiltering === undefined ? true : hasFiltering}
          pHasSorting={hasSorting === undefined ? true : hasSorting}
          pDefaultSort={_.get(pThemeInfo, 'header.defaultSort') || {
            columnName: 'createdAt',
            direction: 'desc'
          }}
          // pHiddenColumnNames={_.get(pThemeInfo, 'header.hiddenColumnNames') || []}

          pIsEditable={isEditable}
          pHasAdding={hasAdding}
          pHasDeleting={hasDeleting}
          pHandleEditComplete={_.get(pThemeInfo, 'body.editable.handleEditComplete') || emptyFunc}

          pCustomRowClass={_.get(pThemeInfo, 'body.row.customClasses') || []}
          pHighlightMyRow={_.get(pThemeInfo, 'body.row.highlightMyRow') || null}
          pHasMultiCheckbox={_.get(pThemeInfo, 'body.row.selection.type') === ROW_SELECTION_MULTI}
          pSelectionType={_.get(pThemeInfo, 'body.row.selection.type') || ROW_SELECTION_NONE}
          pSelectionClassName={_.get(pThemeInfo, 'body.row.selection.selectedClassName') || ''}
          pDefaultSelectedRows={_.get(pThemeInfo, 'body.row.selection.defaultSelected') || []}
          pHandleSelectionChange={this.handleSelectionChange}
          
          pHandleRowClick={_.get(pThemeInfo, 'body.row.handleRowClick') || emptyFunc}
          pHandleRowDoubleClick={_.get(pThemeInfo, 'body.row.handleRowDoubleClick') || emptyFunc}

          pHasDetailRows={_.get(pThemeInfo, 'body.detailRow.enabled')}
          pRenderDetailRow={_.get(pThemeInfo, 'body.detailRow.customRender') || emptyFunc}
          pHandleDetailRowExpanded={this.handleDetailRowExpanded}

          pIsGoToEnd={_.get(pThemeInfo, 'pagination.isGoToEnd')}
          pHasPagination={hasPagination === undefined ? true : hasPagination}
          pDefaultCountPerPage={_.get(pThemeInfo, 'pagination.defaultCountPerPage') || 10}
          pDefaultPanelSize={_.get(pThemeInfo, 'pagination.defaultPanelSize') || 5}
          
          pHandleSlideShowOpen={_.get(pThemeInfo, 'slideShow.enabled') ? this.handleSlideShowOpen : null}
        />
        {_.get(pThemeInfo, 'slideShow.enabled') && sSlideShowVisible &&
          <SlideShow
            isOpen={sSlideShowVisible}
            toggle={this.handleSlideShowClose}
            pHandleSlideChange={this.handleSlideChange}

            pData={getCurrentRows()}
            showIndex={sSlideShowCurrentIndex}

            className={_.get(pThemeInfo, 'slideShow.className') || ''}
            pHeaderData={_.get(pThemeInfo, 'slideShow.content.header.data') || []}
            pBodyData={_.get(pThemeInfo, 'slideShow.content.body.data') || []}
            pBodyCustomRender={_.get(pThemeInfo, 'slideShow.content.body.customRender') || null}
            pFooterData={_.get(pThemeInfo, 'slideShow.content.footer.data') || []}
            pFooterClassName={_.get(pThemeInfo, 'slideShow.content.footer.className') || ''}
          />
        }
      </div>
    );
  }
}

APITable.propTypes = {
  // Main props for table data
  onRef: PropTypes.func, // set table instance
  pID: PropTypes.string, // javascript id of table
  pKey: PropTypes.string, // id of each row
  pColumns: PropTypes.array.isRequired,

  // API Info
  pDisableFirstFetch: PropTypes.bool,
  pAPIInfo: PropTypes.object, // default CRUD info
  /**
   * {
   *    select: {
   *      queries: [{
   *        method: 'get/post/delete/patch',
   *        url: '/social/news/fetchall'
   *        params: {key: value, key2: value}
   *      }],
   *      callback: (res, funcSetTableRows) => { funcSetTableRows(res[0].docs) }
   *    },
   *    read: {
   *      notificationID: '', // ex: 'COL_NEWS'
   *      queries: [{
   *        method: 'get/post/delete/patch',
   *        url: '/social/news/read/:id'
   *        params: {key: value, key2: value}
   *      }],
   *      callback: (res, row, funcUpdateRows) => { }
   *    },
   *    create: {
   *      queries: [{
   *        method:
   *        url:
   *        params: {key: value, key2: value}
   *      }],
   *      callback: (res, funcAddTableRows) => {funcAddTableRows([res[0].doc])}
   *    },
   *    update: {
   *      queries: [{
   *        method:
   *        url:
   *        params:
   *      }],
   *      callback: (res, row, funcUpdateTableRows) => {funcUpdateRows()}
   *    },
   *    delete: {
   *      queries: [{
   *        method:
   *        url:
   *        params: {key: value, key2: value}
   *      }],
   *      callback: (res, row, funcDeleteTableRows) => {funcDeleteTableRows([row])}
   *    }
   * }
   */
  
  // Theme Info
  pThemeInfo: PropTypes.object, // theme info
  /**
   * {
   *  className: string, // additional class name
   *  above: {
   *    newButton: {
   *      route: string,
   *    },
   *    hasExportbutton: true/false (default: true),
   *    columnEditor: {
   *      enabled: true,
   *      defaultHidden: [],
   *    },
   *  },
   *  header: {
   *    hasHeaderRow: true/false (default: true),
   *    hasSorting: true/false (default: true),
   *    defaultSort: {
   *      columnName: string,
   *      direction: 'asc'/'desc' (default: 'asc')
   *    },
   *    hasFiltering: true/false (default: true),
   *  },
   *  body: {
   *    editable: {
   *      enabled: true/false (default: false),
   *      hasAdding: true/false (default: true),
   *      hasDeleting: true/false (default: true),
   *      handleEditComplete: null,
   *    },
   *    row: {
   *      customClasses: array ([{columnName, matchedValue, class}])
   *      highlightMyRow: {
   *        columnName: string,
   *        className: string (ex: 'row-me')
   *      },
   *      selection: {
   *        type: ROW_SELECTION_NONE / ROW_SELECTION_SINGLE / ROW_SELECTION_MULTI
   *        defaultSelected: array (array of ids)
   *        selectedClassName: '' (default: 'row-selected')
   *      },
   *      handleRowClick: func(row, event),
   *      handleRowDoubleClick: func(row, event),  // only used in SELECTION_SINGLE
   *    },
   *    detailRow: {
   *      enabled: true,
   *      customRender: func(row, rowIndex),
   *      triggerReadNotification: true/false 
   *    }, 
   *  },
   *  pagination: {
   *    enabled: true/false (default: true),
   *    defaultCountPerPage: int,
   *    defaultPanelSize: int,
   *    isGoToEnd: true/false, (default: false)
   *  },
   *  slideShow: {
   *    enabled:
   *    className:
   *    triggerReadNotification: boolean (default: false)
   *    content: {
   *      header: {
   *        className:
   *        data: [
   *          {
   *            key: '' (matched fieldname)
   *            className: ''
   *            icon: 'calendar' ('fa-' will be prefixed automatically)
   *            type: TYPE_DATETIME (SlideShow export types)
   *          }
   *        ]
   *      }
   *      body: {
   *        className:
   *        data: [
   *          {
   *            key: '' (matched fieldname)
   *            className: ''
   *            icon: 'calendar' ('fa-' will be prefixed automatically)
   *            type: TYPE_DATETIME (SlideShow export types)
   *          }
   *        ]
   *      }
   *      footer: {
   *        className:
   *        data: [
   *          {
   *            key: '' (matched fieldname)
   *            className: ''
   *            icon: 'calendar' ('fa-' will be prefixed automatically)
   *            type: TYPE_DATETIME (SlideShow export types)
   *            customRender: func(files, index)
   *          }
   *        ]
   *      }
   *    }
   *  }
   * }
   */
  pFilterCallback: PropTypes.func,
};

APITable.defaultProps = {
  // Main props for table data
  pID: 'table_unknown',
  pKey: '_id',
  pColumns: [],

  // API Info
  pDisableFirstFetch: false,
  pAPIInfo: {
    select: {
      queries: [{
        method: 'get',
        url: '/social/news/fetchall',
        params: {
          a: '1',
          b: '2'
        },
      }],
      callback: (results, funcSetTableData) => {
        // funcSetTableData(results[0].news);
      }
    },
    read: {
      notificationID: '', //ex: API_NOTIFICATION_NEWS,
      queries: [{
        method: 'get',
        url: '/social/news/read/:id',
      }],
      callback: (results, row, funcUpdateTableRows) => {
        // const readingCount = results[0].readingCount;
        // const newRow = {...row, readingCount: readingCount};
        // funcUpdateTableRows([newRow]);
      }
    },
    delete: {
      queries: [{
        method: 'delete',
        url: '/social/news/:id',
      }],
      callback: (results, row, funcDeleteTableRows) => {
        // funcDeleteTableRows([row]);
      }
    },
  },

  // Table Theme Info
  pThemeInfo: {
    className: '',
    above: {
      newButton: null,
      columnEditor: {
        enabled: true,
        defaultHidden: [],
      },
      hasExportButtons: true,
    },
    header: {
      hasHeaderRow: true,
      hasFiltering: true,
      hasSorting: true,
      defaultSort: {
        columnName: 'createdAt',
        direction: 'desc',
      },
    },
    body: {
      editable: {
        enabled: false,
        hasAdding: true,
        hasDeleting: true,
        handleEditComplete: null, //func(rows, added, changed, deleted)
      },
      row: {
        customClasses: [],
        highlightMyRow: null,
        selection: {
          type: ROW_SELECTION_NONE, // ROW_SELECTION_SINGLE, ROW_SELECTION_MULTI
          defaultSelected: [],
        },
        handleRowClick: null, // func(row, event)
        handleRowDoubleClick: null, // func(row, event)
      },
      detailRow: {
        enabled: false,
        customRender: null, // func(row, rowIndex)
        triggerReadNotification: false, 
      }
    },
    pagination: {
      enabled: true,
      defaultCountPerPage: 10,
      defaultPanelSize: 5,
      isGoToEnd: false,
    },
    slideShow: {
      enabled: false,
      className: '',
      triggerReadNotification: true,
      content: {
        header: {
          className: '',
          data: [
            { key: 'title', className: 'header-text' },
            { key: 'createdAt', icon: 'calendar', className: 'news-created-date', type: 0 },
            { key: 'reporter.realName', icon: 'user', className: 'news-sender' }
          ],
        },
        body: {
          className: '',
          data: [
            { key: 'content', type: 0, className: 'news-modal-content' }
          ]
        },
        footer: {
          className: 'detail-modal-footer',
          data: [
            { key: 'files', customRender: null }
          ]
        }
      }
    }
  },

  // Table Outside Filter Info
  pFilterCallback : null
};

export default compose(
  withRouter,
  connect(
    state => ({
      user: state.auth.user,
      menus: state.auth.menus,
    }),
    {
    }
  )
)(APITable);