import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import {compose} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment';
import Loading from '../Loading';
import ModalImage from '../ModalImage';
import {maskNumber} from '../../../library/utils/masks';

export const TYPE_NO = 1;
export const TYPE_IMG = 2;
export const TYPE_INFO = 3;
export const TYPE_TITLE = 4;
export const TYPE_DETAIL = 5;
export const TYPE_DATETIME = 6;
export const TYPE_NUMBER = 7;
export const TYPE_TEXT = 8;

export const ALIGN_RIGHT = 'right';
export const ALIGN_CENTER = 'center';
export const ALIGN_LEFT = 'left';

class BreweryTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sData: [],
            sFetchStatus: true
        };
        this.checked = {};
    }

    componentDidMount = () => {
        const {onRef} = this.props;
        onRef(this);
        //   this.fetchData();
    };

    componentWillReceiveProps = (newProps) => {
        if (!_.isEqual(this.props.pData, newProps.pData)) {
            this.setState({
                sData: newProps.pData,
            })
        }
    };

    componentWillUnmount = () => {
        //   this.props.onRef( null );
    };

    getCheckedItems = () => {
        const {pData} = this.props;
        let result = [];
        _.map(pData, (dataItem, dataIndex) => {
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
        const {pColumns, operation, pData} = this.props;
        const multiCheck = operation.multiCheck || false;
        return (
            <tbody>
            {_.map(pData, (dataItem, dataIndex) => {
                return (
                    <tr key={dataIndex}>
                        {multiCheck &&
                        <td width={'40px'}><input key={`checkbox-${dataItem._id || ''}`} className='brewery-table-checkbox'
                                   type='checkbox'
                                   onClick={this.handleClickMultiCheck.bind(this, dataItem, dataIndex)}/></td>}
                        {_.map(pColumns, (columnItem, columnIndex) => {
                            let tdContent = null;
                            const thousandNumber = columnItem.thousandNumber || false;
                            const value = thousandNumber ? maskNumber(_.get(dataItem, columnItem.name) || 0) : _.get(dataItem, columnItem.name) || '';
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
                                            />
                                        break;
                                    case TYPE_INFO:
                                        tdContent = <pre>{value}</pre>
                                        break;
                                    case TYPE_TITLE:
                                        tdContent = value;
                                        break;
                                    case TYPE_DETAIL:
                                        tdContent = <i className='fa fa-search'/>
                                        break;
                                    case TYPE_DATETIME:
                                        const valueDate = new Date(value);
                                        tdContent = <span>{moment(valueDate).format('YYYY-MM-DD HH:mm:ss')}</span>;
                                        break;
                                    case TYPE_NUMBER:
                                        tdContent = value || 0;
                                        break;
                                    case TYPE_TEXT:
                                        tdContent = <p>{value}</p>
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

    render() {
        const {className} = this.props;
        const {sFetchStatus} = this.state;
        var checkBoxs = document.getElementsByClassName("brewery-table-checkbox");
        for(let i = 0 ; i < checkBoxs.length ; i ++) {
            checkBoxs[i].checked = false;
        }
        if (sFetchStatus) {
            return (
                <div className={cn('component-container-brewery-table', className)}>
                    <table className='brewery-table'>
                        {/*{this.renderTableHeader()}*/}
                        {this.renderTableBody()}
                    </table>
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

BreweryTable.propTypes = {
    operation: PropTypes.object,
    pColumns: PropTypes.array,
    pData: PropTypes.array,
};

BreweryTable.defaultProps = {
    operation: {},
    pColumns: [],
    pData: [],
};

export default compose(
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(BreweryTable);
