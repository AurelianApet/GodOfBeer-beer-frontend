import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Pagination from 'react-js-pagination';

import { appConfig } from '../../../appConfig';
import LANG from '../../../language';
import Select from '../Form/Select';

class PaginationPanel extends Component {
  render() {
    const { pTotalCount, pCurrentPageNumber, pCountPerPage, pPanelSize } = this.props;

    const locStart = (pCurrentPageNumber - 1) * pCountPerPage + 1;
    const locEnd = (pCurrentPageNumber * pCountPerPage > pTotalCount ? pTotalCount : pCurrentPageNumber * pCountPerPage);
    
    return (
      <div className="pagination-bar">
        <div className="pagination-info">
          <div className="pagination-info-all">
            {LANG('COMP_PAGINATIONPANEL_ALL')}
          </div>
          <div className="pagination-info-detail">
            {pTotalCount} ( {locStart} ~ {locEnd} )
          </div>
        </div>
        
        <div className="pagination-container">
          <Pagination
            activePage={pCurrentPageNumber}
            itemsCountPerPage={pCountPerPage}
            totalItemsCount={pTotalCount}
            pageRangeDisplayed={pPanelSize}
            onChange={this.props.pHandleCurrentPageNumberChange}
          />
        </div>
        
        <div className="pagination-count-per-page">
          <Select 
            name="countPerPage"
            pLabel={LANG('COMP_PAGINATIONPANEL_COUNT')}
            pData={appConfig.PAGINATION_COUNT_PER_PAGE}
            pValue={pCountPerPage.toString()}
            pHasDefault={false}
            pIsLabelAfter={true}
            pIsErrorVisible={false}
            onChange={this.props.pHandleCountPerPageChange}
          />
        </div>
      </div>
    );
  }
}

PaginationPanel.propTypes = {
  pTotalCount: PropTypes.number.isRequired,

  pCurrentPageNumber: PropTypes.number.isRequired,
  pCountPerPage: PropTypes.number.isRequired,
  pPanelSize: PropTypes.number.isRequired,

  pHandleCountPerPageChange: PropTypes.func,
  pHandleCurrentPageNumberChange: PropTypes.func,
}

PaginationPanel.defaultProps = {
  pTotalCount: 0,
  pCurrentPageNumber: 1,
  pCountPerPage: 10,
  pPanelSize: 5,
}

export default PaginationPanel;