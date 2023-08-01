import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import _ from 'lodash';

import {
    MODE_CREATE, MODE_UPDATE, MODE_READ,
} from '../../../components/APIForm';
import BeerTable, {TYPE_NO, TYPE_IMG, TYPE_DETAIL, TYPE_TEXT, TYPE_TITLE} from '../../../components/BeerTable';
import UpadateModal from './UpdateModal';
import {confirmAlertMsg} from '../../../../library/utils/confirmAlert';
import {executeQuery} from '../../../../library/utils/fetch';
import LANG from '../../../../language';
import {
    pushNotification,
    NOTIFICATION_TYPE_WARNING,
    NOTIFICATION_TYPE_SUCCESS
} from '../../../../library/utils/notification';

class ProducerMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sInfoTableMode: MODE_READ,
            sModalMode: MODE_READ,
            sIsShowUpdateModal: false,
            sIsShowChangePasswordModal: false,
            sUpdateId: '',
            sUserId: null,
        };
        this.detailInfo = {};
    }

    componentDidMount() {
        const userId = _.get(this.props, 'user._id') || '';
        this.setState({
            sUserId: userId,
        });
    }

    handleClickProducerTable = (value, dataItem, columnItem) => {
        this.setState({
            sUpdateId: dataItem._id,
            sModalMode: MODE_UPDATE,
            sIsShowUpdateModal: true,
        })
    };

    handleModalShowChange = (aState, aComState) => {
        this.setState({
            sIsShowUpdateModal: aState,
        });
        if (aComState) {
            this.beerTable.refresh();
        }
    };

    handleCreateNewBrewery = () => {
        this.setState({
            sIsShowUpdateModal: true,
            sModalMode: MODE_CREATE,
        })
    };

    handleDeleteBrewery = () => {
        const {location: {pathname}} = this.props;
        const selectedBrewry = this.beerTable.getCheckedItems();

        if (selectedBrewry.length === 0) {
            pushNotification(NOTIFICATION_TYPE_WARNING, '선택된 데이터가 없습니다')
        } else {
            let confirmParam = {
                title: LANG('BASIC_DELETE'),
                detail: LANG('BASIC_ALERTMSG_DELETE_BREWERY'),
                confirmTitle: LANG('BASIC_ALERTMSG_YES'),
                noTitle: LANG('BASIC_ALERTMSG_NO'),
                confirmFunc: this.processDeleteBrewery,
            };
            confirmAlertMsg(confirmParam, pathname);
        }
    };

    processDeleteBrewery = () => {
        const selectedBrewry = this.beerTable.getCheckedItems();
        let ids = [];
        _.map(selectedBrewry, (breweryItem, breweryIndex) => {
            ids.push(breweryItem._id);
        });
        if (ids.length > 0) {
            executeQuery({
                method: 'post',
                url: '/brewery/multidel',
                data: {
                    ids,
                },
                success: (res) => {
                    const warnings = res.warnings || [];
                    if (warnings.length > 0) {
                        _.map(warnings, (warningItem, index) => {
                            pushNotification(NOTIFICATION_TYPE_WARNING, warningItem);
                        })
                    } else {
                        pushNotification(NOTIFICATION_TYPE_SUCCESS, '삭제가 완료되었습니다');
                    }
                    this.beerTable.refresh();
                },
                fail: (err, res) => {
                }
            })
        }
    };

    renderBeerTable = () => {
        const userId = _.get(this.props, 'user._id') || '';
        if (userId) {
            return (
                <BeerTable
                    onRef={(ref) => {
                        this.beerTable = ref
                    }}
                    url={`/brewery/fetchlist?uid=${userId}`}
                    getDataFunc={(res) => {
                        const result = res.brewery || [];
                        this.hasBrewery = result.length !== 0;
                        return result;
                    }}
                    pColumns={[
                        {
                            type: TYPE_NO,
                            title: 'NO.'
                        },
                        {
                            name: 'image',
                            title: 'BreweryImage',
                            type: TYPE_IMG,
                        },
                        {
                            name: 'name',
                            title: '브루어리명',
                            type: TYPE_TITLE,
                            clickFunc: this.handleClickProducerTable,
                            className: 'pointer font-bold'
                        },
                        {
                            name: 'beerCount',
                            title: 'Beers',
                            type: TYPE_TITLE,
                        }
                    ]}
                    operation={{
                        multiCheck: true,
                    }}
                />
            )
        }
        return null;
    };

    render() {
        const {sIsShowUpdateModal, sModalMode, sUpdateId} = this.state;
        return (
            <div className='container-page-producer-main'>
                <div className='producer-change'>
                    <div className='producer-change-header'>
                        <div className='producer-title'>양조장 정보</div>
                        <div className='producer-buttons'>
                            <div className='producer-operation-button' onClick={this.handleCreateNewBrewery}>추가</div>
                            <div className='producer-operation-button' onClick={this.handleDeleteBrewery}>삭제</div>
                            <div className='producer-operation-button'>엑셀저장</div>
                        </div>
                    </div>
                    <div className='producer-table'>
                        {this.renderBeerTable()}
                    </div>
                </div>
                {sIsShowUpdateModal &&
                <UpadateModal
                    handleModalClose={this.handleModalShowChange}
                    pMode={sModalMode}
                    pId={sUpdateId}
                />
                }
            </div>
        );
    }
}

ProducerMain.propTypes = {};

ProducerMain.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(ProducerMain);
