import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import cn from 'classnames';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {
    Modal,
    ModalHeader,
    ModalBody
} from '../../../components/Modal';
import SearchInputer from '../../../components/SearchInputer';

class InsertPubModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sIsShowEnableModal: true,
            sSearchedData: [],
        };
        this.pubId = '';
        this.checked = []
    }

    componentDidMount = () => {
        const {onRef, pPubData} = this.props;
        this.setState({sSearchedData: pPubData})
        onRef(this);
    };

    componentWillUnmount = () => {
        this.props.onRef(null);
    };

    handleCloseModal = () => {
        this.setState({
            sIsShowEnableModal: false,
        });
        this.props.handleCloseModal();
    };

    handleChangeRefuseReason = (e) => {
        if (!e) {
            return;
        }
        const value = e.target.value;
        this.refuseReason = value;
    };

    handleInsert = () => {
        this.props.handleInsertPub(this.checked);
    };

    onCheckedItems = (id, e) => {
        const crrChecked = this.checked[id] || false;
        this.checked[id] = !crrChecked;
        this.setState(this.checked)
    };

    handleSearchWordInputed = (aData) => {
        this.setState({sSearchedData: aData})
    };

    render() {
        const {pPubData} = this.props;
        const {sIsShowEnableModal, sSearchedData} = this.state;
        return (
            <Modal
                isOpen={sIsShowEnableModal}
                toggle={this.handleCloseModal}
                className='enable-user-modal'
            >
                <ModalHeader
                    toggle={this.props.handleCloseModal}
                    className='enable-user-modal-header'
                >
                    <h4>추가</h4>
                </ModalHeader>
                <ModalBody className='enable-user-modal-body'>
                    <div>
                        <SearchInputer
                            pHandleSearch={this.handleSearchWordInputed}
                            pData={pPubData}
                        />
                    </div>
                    <div style={{marginTop: 20}}>
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>매장명</th>
                                    <th>사업자번호</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                sSearchedData.length === 0 &&
                                <tr>
                                   <td colSpan={3}>없음</td>
                                </tr>
                            }
                            {
                                _.map(sSearchedData, (pubItem, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <i className={cn('insert-pub-checkbox fa', this.checked[pubItem._id] ? 'fa-check-square-o' : 'fa fa-square-o')} onClick ={this.onCheckedItems.bind(this, pubItem._id)}/>
                                            </td>
                                            <td>{pubItem.name}</td>
                                            <td>{pubItem.uid.bus_id}</td>
                                        </tr>
                                    )

                                })
                            }
                            </tbody>
                        </table>
                    </div>
                    <div className='user-detail-operation-buttons'>
                        <button className='operation-button' onClick={this.handleInsert}>추가</button>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}

InsertPubModal.propTypes = {
    pPubData: PropTypes.array,
    handleCloseModal: PropTypes.func,
    handleInsertPub: PropTypes.func,
    onRef: PropTypes.func,
};

InsertPubModal.defaultProps = {
    pPubData: [],
    handleCloseModal: () => {
    },
    handleInsertPub: () => {
    },
    onRef: () => {
    },
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(InsertPubModal);
