import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import {compose} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment';

import {executeQuery} from '../../../library/utils/fetch';
import Loading from '../Loading';
import ModalImage from '../ModalImage';
import {maskNumber} from '../../../library/utils/masks';
import Pagination from 'react-js-pagination';

export const TYPE_NO = 1;
export const TYPE_IMG = 2;
export const TYPE_INFO = 3;
export const TYPE_TITLE = 4;
export const TYPE_DETAIL = 5;
export const TYPE_DATETIME = 6;
export const TYPE_NUMBER = 7;
export const TYPE_TEXT = 8;
export const TYPE_DATE = 9;
export const TYPE_COUNT = 10;

export const ALIGN_RIGHT = 'right';
export const ALIGN_CENTER = 'center';
export const ALIGN_LEFT = 'left';

export const MODE_URL = 1;
export const MODE_DATA = 2;

class BeerTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sData: [],
            sFetchStatus: false,
            sortOption: {},
            totalCount: 0,
            activePage: 1,
            pageLimit: 10
        };
        this.checked = {};
        this.searchWord = '';
    }

    componentDidMount = () => {
        const {onRef} = this.props;
        onRef(this);
        this.fetchData();
    };

    componentWillReceiveProps = (newProps) => {
        this.searchWord = newProps.pSearchWord || '';
        setTimeout(() => {
            this.refresh();
        }, 100);
    };

    componentWillUnmount = () => {
        this.props.onRef(null);
    };

    refresh = () => {
        this.fetchData();
        this.checked = {};
    };

    fetchData = () => {
        const {url, getDataFunc, mode, pData} = this.props;
        if (mode === MODE_URL) {
            if (url) {
                executeQuery({
                    method: 'get',
                    url: url,
                    success: (res) => {
                        const result = getDataFunc ? getDataFunc(res) : res.docs || [];
                        console.log('bb:', res);
                        let data = [];
                        _.map(result, (dataItem, dataIndex) => {
                            const contentString = JSON.stringify(dataItem).toLowerCase();
                            if (contentString.indexOf(this.searchWord) > -1) {
                                data.push(dataItem);
                            }
                        });
                        this.setState({
                            sData: data,
                            sFetchStatus: true,
                            totalCount: data.length,
                            activePage: 1
                        });
                    },
                    fail: (err, res) => {

                    }
                });
            }
        } else if (mode === MODE_DATA) {
            this.setState({
                sFetchStatus: true,
                sData: pData,
                totalCount: pData.length,
                activePage: 1
            })
        }
    };

    getCheckedItems = () => {
        const {sData, pageLimit, activePage} = this.state;
        let resultData = [].concat(sData);
        let renderData = resultData.splice((activePage - 1) * pageLimit, pageLimit);
        let result = [];
        _.map(renderData, (dataItem, dataIndex) => {
            if (this.checked[dataIndex]) {
                result.push(dataItem);
            }
        });
        return result;
    };

    handleClickMultiCheck = (aItem, aIndex) => {
        const crrChecked = this.checked[aIndex] || false;
        this.checked[aIndex] = !crrChecked;
    };

    sortData(columnName) {
        let {sortOption, sData} = this.state;
        if (sortOption[columnName]) {
            sortOption[columnName] *= -1;
        } else {
            sortOption[columnName] = 1;
        }
        for (let i = 0; i < sData.length; i ++) {
            for (let j = i + 1; j < sData.length; j ++) {
                let a = _.get(sData[i], columnName);
                let b = _.get(sData[j], columnName);
                if (sortOption[columnName] === 1) {
                    if (a > b) {
                        let c = sData[i];
                        sData[i] = sData[j];
                        sData[j] = c;
                    }
                } else {
                    if (a < b) {
                        let c = sData[i];
                        sData[i] = sData[j];
                        sData[j] = c;
                    }
                }
            }
        }
        this.setState({sortOption: sortOption, sData: sData});
    }

    renderTableHeader = () => {
        const {pColumns, operation} = this.props;
        const multiCheck = operation.multiCheck || false;
        return (
            <thead>
            <tr>
                {multiCheck && <th/>}
                {_.map(pColumns, (columnItem, columnIndex) => {
                    const align = columnItem.align || ALIGN_CENTER;
                    return (
                        <th
                            key={columnIndex}
                            style={{textAlign: align}}
                            className="pointer"
                            onClick={() => {this.sortData(columnItem.name)}}
                        >
                            {columnItem.title}
                        </th>
                    )
                })}
            </tr>
            </thead>
        )
    };

    renderTableBody = () => {
        const {pColumns, operation} = this.props;
        const {sData, pageLimit, activePage} = this.state;
        let resultData = [].concat(sData);
        let renderData = resultData.splice((activePage - 1) * pageLimit, pageLimit);
        const multiCheck = operation.multiCheck || false;
        return (
            <tbody>
            {_.map(renderData, (dataItem, dataIndex) => {
                return (
                    <tr key={dataIndex}>
                        {multiCheck && <td><input key={`checkbox-${dataItem._id || ''}`} className='beer-table-checkbox'
                                                  type='checkbox'
                                                  onClick={this.handleClickMultiCheck.bind(this, dataItem, dataIndex)}/>
                        </td>}
                        {_.map(pColumns, (columnItem, columnIndex) => {
                            let tdContent = null;
                            const thousandNumber = columnItem.thousandNumber || false;
                            let value = '';
                            if (columnItem.name !== 'realName, storeName') {
                                value = thousandNumber ? maskNumber(_.get(dataItem, columnItem.name) || 0) : _.get(dataItem, columnItem.name) || '';
                            } else {
                                let role = _.get(dataItem, 'role');
                                if (role === '일반사용자') {
                                    value = _.get(dataItem, 'realName');
                                } else {
                                    value = _.get(dataItem, 'storeName');
                                }
                            }

                            const onClickFunc = columnItem.clickFunc || (() => {
                            });
                            const className = columnItem.className || '';
                            let style = columnItem.style || {};
                            const align = columnItem.align || ALIGN_CENTER;
                            style.display = 'flex';
                            style.justifyContent = align;
                            if (columnItem.customRender) {
                                tdContent = columnItem.customRender(value, dataItem, columnItem);
                            } else {
                                switch (columnItem.type) {
                                    case TYPE_NO:
                                        tdContent = <span>{dataIndex + 1}</span>;
                                        break;
                                    case TYPE_IMG:
                                        tdContent =
                                            <ModalImage
                                                pContent={{src: value}}
                                                style={{
                                                    width: 90,
                                                    height: 90,
                                                    borderRadius: 15
                                                }}
                                            />;
                                        break;
                                    case TYPE_INFO:
                                        tdContent = <pre>{value}</pre>;
                                        break;
                                    case TYPE_TITLE:
                                        tdContent = value;
                                        break;
                                    case TYPE_DETAIL:
                                        tdContent = <i className='fa fa-search'/>;
                                        break;
                                    case TYPE_DATETIME:
                                        let valueDate = new Date(value);
                                        tdContent = <span>{moment(valueDate).format('YYYY-MM-DD HH:mm:ss')}</span>;
                                        break;
                                    case TYPE_DATE:
                                        let valueDate1 = new Date(value);
                                        tdContent = <span>{moment(valueDate1).format('YYYY-MM-DD')}</span>;
                                        break;
                                    case TYPE_NUMBER:
                                        tdContent = value || 0;
                                        break;
                                    case TYPE_TEXT:
                                        tdContent = <pre>{value}</pre>;
                                        break;
                                    case TYPE_COUNT:
                                        tdContent = value.length || 0;
                                        break;
                                    default:
                                        tdContent = value;
                                        break;
                                }
                            }
                            if (columnItem.type === TYPE_IMG) {
                                return (
                                    <td key={columnIndex} width={'110px'}>
                                        <div style={style} className={className}
                                             onClick={onClickFunc.bind(this, value, dataItem, columnItem)}>{tdContent}</div>
                                    </td>
                                )
                            }
                            return (
                                <td key={columnIndex}>
                                    <div style={style} className={className}
                                         onClick={onClickFunc.bind(this, value, dataItem, columnItem)}>{tdContent}</div>
                                </td>
                            )
                        })}
                    </tr>
                )
            })}
            </tbody>
        )
    };

    handlePageChange(pageNumber) {
        this.setState({activePage: pageNumber});
    }

    render() {
        const {className, hideHeader} = this.props;
        const {sFetchStatus, totalCount, pageLimit, activePage} = this.state;
        ////I can't believe it!!!///////
        var checkBoxs = document.getElementsByClassName("beer-table-checkbox");
        for(let i = 0 ; i < checkBoxs.length ; i ++) {
            checkBoxs[i].checked = false;
        }
        if (sFetchStatus) {
            return (
                <div className={cn('component-container-beer-table', className)}>
                    <table className='beer-table'>
                        {!hideHeader && this.renderTableHeader()}
                        {this.renderTableBody()}
                    </table>

                    <div className="pagination-container">
                        <div className="column text-center">
                            {
                                totalCount > pageLimit ? (<Pagination
                                    activePage={activePage}
                                    itemsCountPerPage={pageLimit}
                                    totalItemsCount={totalCount}
                                    pageRangeDisplayed={5}
                                    onChange={this.handlePageChange.bind(this)}
                                />) : ''
                            }
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="loading-wrapper">
                    <Loading/>
                </div>
            )
        }

    }
}

BeerTable.propTypes = {
    mode: PropTypes.number,
    url: PropTypes.string,
    className: PropTypes.string,
    operation: PropTypes.object,
    pColumns: PropTypes.array,
    pData: PropTypes.array,
    onRef: PropTypes.func,
    getDataFunc: PropTypes.func,
    hideHeader: PropTypes.bool
};

BeerTable.defaultProps = {
    mode: MODE_URL,
    url: '',
    className: '',
    operation: {},
    pColumns: [],
    pData: [],
    hideHeader: false,
    onRef: () => {
    },
    getDataFunc: null,
};

export default compose(
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(BeerTable);
