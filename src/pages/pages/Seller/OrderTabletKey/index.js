import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import {connect} from 'react-redux';

import { Modal, ModalHeader, ModalBody } from '../../../components/Modal';
import { pushNotification, NOTIFICATION_TYPE_SUCCESS } from '../../../../library/utils/notification';
import { executeQuery } from '../../../../library/utils/fetch';
import {generateSoftKey} from "../../../../library/utils/helper";

class OrderTabletKeyComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            softKeys: this.props.data,
            sIsShowAddTagModal: false,
            addCount: 0,
            sCheckedTags: []
        };
    }

    handleClickAddTagButton = () => {
        this.setState({
            sIsShowAddTagModal: true,
        })
    };

    handleCloseAddTagModal = () => {
        this.setState({
            sIsShowAddTagModal: false,
        })
    };

    handleCancelNewTags = () => {
        this.setState({
            sIsShowAddTagModal: false,
        })
    };

    handleAddNewTags = () => {
        let {softKeys, addCount} = this.state;
        for (let i = 0; i < addCount; i ++) {
            softKeys.push({
                soft_key: generateSoftKey()
            })
        }
        this.setState(({
            softKeys: softKeys,
            addCount: 0,
            sIsShowAddTagModal: false,
        }))
    };

    handleClickRemoveTagButton = () => {
        let { sCheckedTags, softKeys } = this.state;
        let results = [];
        for (let i = 0; i < softKeys.length; i ++) {
            if (sCheckedTags.indexOf(i) < 0) {
                results.push(softKeys[i]);
            }
        }

        this.setState({
            softKeys: results,
            sCheckedTags: []
        });
    };

    handleChangeAddedTags = ( e ) => {
        if ( !e ) return;
        const value = e.target.value;
        this.setState({
            addCount: value * 1
        })
    };

    handleChangeTagContent = ( index, e ) => {
        if ( !e ) return;
        let {softKeys} = this.state;
        softKeys[index].soft_key = e.target.value;
        this.setState({
            softKeys: softKeys
        })
    };

    handleSaveSoftKeys = () => {
        executeQuery({
            method: 'put',
            url: `/pub/updatekeys/${this.props.pubId}`,
            data: {
                softKeys: this.state.softKeys,
                is_kitchen: !!this.props.isKitchen
            },
            success: ( res ) => {
                pushNotification( NOTIFICATION_TYPE_SUCCESS, '성공적으로 저장되었습니다.' );
            },
            fail: ( err, res ) => {}
        });
    };

    handleClickTagItem = ( index ) => {
        let { sCheckedTags } = this.state;
        if (sCheckedTags.indexOf(index) >= 0) {
            sCheckedTags.splice(sCheckedTags.indexOf(index), 1);
        } else {
            sCheckedTags.push(index);
        }

        this.setState({
            sCheckedTags,
        })
    };

    renderTags = () => {
        const { softKeys, sCheckedTags } = this.state;
        let resultHtml = [];

        let count = softKeys.length;
        for (let i = 0; i < count; i ++) {
            resultHtml.push((
                <div key={i} className='softkey-item'>
                    <div className='softkey-tag-name'>
                        <i className={sCheckedTags.indexOf(i) >= 0 ? 'fa fa-check-square-o' : 'fa fa-square-o'} onClick={this.handleClickTagItem.bind( this, i )}/>
                    </div>
                    <div className='softkey-tag-content'>
                        <input
                            defaultValue={softKeys[i].soft_key}
                            onChange={this.handleChangeTagContent.bind( this, i )}
                        />
                    </div>
                </div>
            ))
        }
        return resultHtml;
    };

    render() {
        const { sIsShowAddTagModal, addCount } = this.state;
        return (
            <div className='container-page-softkey-register'>
                <div className='soft-register-header'>
                    <div className='add-qrcode-tag-button' onClick={this.handleClickAddTagButton}>추가</div>
                    <div className='remove-qrcode-tag-button' onClick={this.handleClickRemoveTagButton}>삭제</div>
                </div>
                <div className='soft-container'>
                    {this.renderTags()}
                </div>
                <div className="soft-footer">
                    <div className="btn-save-soft" onClick={() => {this.handleSaveSoftKeys()}}>저장</div>
                </div>
                {sIsShowAddTagModal &&
                <Modal
                    isOpen={sIsShowAddTagModal}
                    toggle={this.handleCloseAddTagModal}
                    className='modal-add-new-tag'
                >
                    <ModalHeader
                        toggle={this.handleCloseAddTagModal}
                        className='modal-add-new-tag-header'>
                        <h4>사용대수 추가</h4>
                    </ModalHeader>
                    <ModalBody className='modal-add-new-tag-body'>
                        <div className='tag-inputer-container'>
                            <input
                                type="number"
                                name='count'
                                defaultValue={addCount || ''}
                                ref="count"
                                onChange={this.handleChangeAddedTags}
                            />
                        </div>
                        <div className='tag-operation-buttons'>
                            <div className='add-new-tag-button' onClick={this.handleAddNewTags}>추가</div>
                            <div className='cancel-new-tag-button' onClick={this.handleCancelNewTags}>취소</div>
                        </div>
                    </ModalBody>
                </Modal>
                }
            </div>
        );
    }
}

OrderTabletKeyComponent.propTypes = {
    pubId: PropTypes.string,
    data: PropTypes.array,
};

OrderTabletKeyComponent.defaultProps = {
    pubId: '',
    data: null,
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(OrderTabletKeyComponent);