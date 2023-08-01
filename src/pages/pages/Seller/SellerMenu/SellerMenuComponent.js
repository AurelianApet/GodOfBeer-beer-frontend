import React, {Component} from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import MaskedInput from 'react-text-mask';

import {Modal, ModalHeader, ModalBody} from '../../../components/Modal';
import Loading from '../../../components/Loading';
import FileUpload from '../../../components/Form/FileUpload';
import SearchSelect from '../../../components/SearchSelect';
import FileList from '../../../components/Form/FileList';

import {executeQuery} from '../../../../library/utils/fetch';
import {findFromArray} from '../../../../library/utils/array';
import {
    pushNotification,
    NOTIFICATION_TYPE_WARNING,
    NOTIFICATION_TYPE_ERROR,
    NOTIFICATION_TYPE_SUCCESS
} from '../../../../library/utils/notification';
import {maskNumber, numberUnmask} from '../../../../library/utils/masks';
import {copyObject} from '../../../../library/utils/objects';

import {appConfig} from '../../../../appConfig';
import {confirmAlertMsg} from '../../../../library/utils/confirmAlert';
import cn from 'classnames';
import {generateRandomString} from "../../../../library/utils/helper";

const ORDER_MASK = createNumberMask({
    prefix: '',
    suffix: '',
    thousandsSeparatorSymbol: '',
});
const PRICE_MASK = createNumberMask({
    prefix: '',
    suffix: '',
    allowNegative: true,
    thousandsSeparatorSymbol: ',',
});

class SellerMenu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sMainMenu: [],
            sOtherMenu: [],
            tempOtherMenu: [],
            sBeersByBottleType: {},
            sFetchStatus: {},
            sIsHiddenFoodMenu: {},
            tempHiddenFoodMenu: {},
            sIsVisibleBeerMenuModal: false,
            sIsVisibleEditCategoryModal: false,
            sSelectedCapacity: [],
            sIsShowNewFoodKind: false,
            sBeerMenuMode: 1,
            sFoodMenuMode: 0
        };
        this.beers = {};
        this.menuOrder = {};
        this.pubId = '';
        this.modified = false;
    }

    componentDidMount = () => {
        this.getBeerData();
        this.getPubInfo();
    };

    getBeerData = () => {
        executeQuery({
            method: 'get',
            url: '/beer/fetchall',
            success: (res) => {
                let {sFetchStatus} = this.state;
                const result = res.beer || [];
                this.totalBeers = result;
                let beersByBottleType = {};
                _.map(result, (beerItem, beerIndex) => {
                    const crrUnitcost = beerItem.unitcost || [];
                    this.beers[beerItem._id] = crrUnitcost;
                    if (crrUnitcost.length > 0) {
                        let unitcostGroupedByBottleType = {};
                        _.map(crrUnitcost, (costItem, costIndex) => {
                            let key = costItem.bottleType === 'Draft' ? 'Draft' : 'Bottle & Can';
                            let crrArray = unitcostGroupedByBottleType[key] || [];
                            crrArray.push(beerItem);
                            unitcostGroupedByBottleType[key] = crrArray;
                        });
                        _.map(unitcostGroupedByBottleType, (costItem, costIndex) => {
                            let crrArray = beersByBottleType[costIndex] || [];
                            crrArray.push({
                                _id: beerItem._id,
                                name: beerItem.name,
                            });
                            beersByBottleType[costIndex] = crrArray;
                        });
                    }
                });
                sFetchStatus.beer = true;
                this.setState({
                    sFetchStatus,
                    sBeersByBottleType: beersByBottleType,
                });
            },
            fail: (err, res) => {

            }
        });
    };

    getPubInfo = () => {
        const {userId, userKind} = this.props;
        if (userId) {
            executeQuery({
                method: 'get',
                url: `/pub/fetchone?${userKind}=${userId}`,
                success: (res) => {
                    let {sFetchStatus} = this.state;
                    const result = _.get(res, 'pub[0]') || {};
                    this.pubId = result._id;
                    const mainMenu = result.mainMenu || [];
                    const otherMenu = result.otherMenu || [];
                    let mainMenuGrouped = {};
                    let otherMenuGrouped = {};
                    _.map(mainMenu, (menuItem, menuIndex) => {
                        const crrBottleType = menuItem.bottleType || '';
                        if (crrBottleType) {
                            let crrGroupedMenu = mainMenuGrouped[crrBottleType] || [];
                            crrGroupedMenu.push(menuItem);
                            mainMenuGrouped[crrBottleType] = crrGroupedMenu;
                            this.menuOrder[crrBottleType] = menuItem.no;
                        }
                    });
                    let isHiddenFoodMenu = {};
                    _.map(otherMenu, (menuItem, menuIndex) => {
                        const crrKind = menuItem.kind || '';
                        if (crrKind) {
                            let crrGroupedMenu = otherMenuGrouped[crrKind] || [];
                            crrGroupedMenu.push(menuItem);
                            otherMenuGrouped[crrKind] = crrGroupedMenu;
                            this.menuOrder[crrKind] = menuItem.no;
                            isHiddenFoodMenu[crrKind] = menuItem.isHidden || false;
                        }
                    });

                    sFetchStatus.pub = true;
                    this.setState({
                        sFetchStatus,
                        sMainMenu: mainMenuGrouped,
                        sOtherMenu: otherMenuGrouped,
                        sIsHiddenFoodMenu: isHiddenFoodMenu,
                    });
                },
                fail: (err, res) => {

                }
            })
        } else {
            setTimeout(() => {
                this.getPubInfo();
            }, 100);
        }
    };

    handleRemoveAllMenus = (aType) => {
        const {location: {pathname}} = this.props;
        let confirmParam = {
            title: '분류삭제',
            detail: '이 분류를 삭제하시겠습니까?',
            confirmTitle: '예',
            noTitle: '아니',
            confirmFunc: this.processRemoveAllMenus.bind(null, aType),
        };
        confirmAlertMsg(confirmParam, pathname);

    };

    handleRemoveAllFoodMenus = (aType) => {
        let {tempOtherMenu} = this.state;
        let newOtherMenu = {};
        _.map(tempOtherMenu, (menuItem, menuIndex) => {
            if (menuIndex !== aType) {
                newOtherMenu[menuIndex] = menuItem;
            }
        });
        this.setState({
            tempOtherMenu: newOtherMenu,
        });
    };

    handleAddNewBeerMenuItem = () => {
        const {sBeerMenuMode} = this.state;
        let aType = sBeerMenuMode === 1 ? 'Draft' : 'Bottle & Can';
        this.editBeerMenuItem = {type: aType, item: null, index: null};
        this.handleToggleBeerMenuModal(true);
    };

    handleAddNewFoodMenuItem = () => {
        const {sOtherMenu, sFoodMenuMode} = this.state;
        let menuOrder = this.menuOrder;
        const sortedMenu = _.sortBy(sOtherMenu, [function (menuItem) {
            return menuOrder[_.get(menuItem, '[0].kind')] || 0;
        }]);
        let aType = '';
        for (let i = 0; i < sortedMenu.length; i ++) {
            const kind = _.get(sortedMenu[i], '[0].kind') || '';
            if (i === sFoodMenuMode) {
                aType = kind;
            }
        }
        this.editFoodMenuItem = {type: aType, item: null, index: null, no: 1};
        this.handleToggleFoodMenuModal(true);
    };

    handleEditMenuItem = (aType, aItem, aIndex) => {
        this.editBeerMenuItem = {type: aType, item: copyObject(aItem), index: aIndex};
        this.handleToggleBeerMenuModal(true, {sSelectedCapacity: this.beers[_.get(aItem, 'beer._id') || ''] || [],})
    };

    handleEditCategory = (aType, menuIndex) => {
        this.editFoodMenuCategory = {type: aType, index: menuIndex, oldType: aType};
        this.handleToggleEditCategoryModal(true, {})
    };

    handleEditFoodMenuItem = (aType, aItem, aIndex) => {
        this.editFoodMenuItem = {type: aType, item: copyObject(aItem), index: aIndex};
        this.handleToggleFoodMenuModal(true);
    };

    handleToggleBeerMenuModal = (aState, aAdditionalState) => {
        if (!aState) {
            this.editBeerMenuItem = null;
        }
        const additionalState = aAdditionalState || {};
        this.setState({
            sIsVisibleBeerMenuModal: aState,
            sSelectedCapacity: [],
            ...additionalState,
        })
    };

    handleToggleEditCategoryModal = (aState, aAdditionalState) => {
        if (!aState) {
            this.editFoodMenuCategory = null;
        }
        const additionalState = aAdditionalState || {};
        this.setState({
            sIsVisibleEditCategoryModal: aState,
            ...additionalState,
        })
    };

    handleToggleFoodMenuModal = (aState, aAdditionalState) => {
        if (!aState) {
            this.editFoodMenuItem = null;
        }
        const additionalState = aAdditionalState || {};
        this.setState({
            sIsVisibleFoodMenuModal: aState,
            ...additionalState,
        })
    };

    handleRemoveMenuItem = (aType, aIndex) => {
        let {sMainMenu} = this.state;
        let targetMenu = sMainMenu[aType] || [];
        targetMenu.splice(aIndex, 1);
        sMainMenu[aType] = targetMenu;
        this.setState({
            sMainMenu,
        })
    };

    handleRemoveFoodMenuItem = (aType, aIndex) => {
        let {sOtherMenu} = this.state;
        let targetMenu = sOtherMenu[aType] || [];
        targetMenu.splice(aIndex, 1);
        sOtherMenu[aType] = targetMenu;
        this.setState({
            sOtherMenu,
        })
    };

    handleRemoveModalImage = () => {
        _.set(this.editFoodMenuItem, 'item.image', '');
    };
    
    handleRemoveBeerModalImage = () => {
        _.set(this.editBeerMenuItem, 'item.image', '');
    };

    handleChangeBeerMenuItem = (e) => {
        if (!e) return;
        const {value, name} = e.target;
        if (name === 'price') {
            _.set(this.editBeerMenuItem, 'item.priceUnit', '원');
            _.set(this.editBeerMenuItem, 'item.price', numberUnmask(`${value}`));
        } else {
            _.set(this.editBeerMenuItem, `item.${name}`, value);
        }
    };

    handleChangeFoodMenuItem = (e) => {
        if (!e) return;
        const {value, name} = e.target;
        _.set(this.editFoodMenuItem, `item.${name}`, value);
    };

    handleChangeCategory = (e, kind) => {
        if (!e) return;
        const {value} = e.target;
        let {tempOtherMenu} = this.state;
        tempOtherMenu[kind][0].kind = value;
        this.setState({tempOtherMenu: tempOtherMenu});
    };

    handleChangeFoodMenuItemSoldOut = (aType, aIndex) => {
        let {sOtherMenu} = this.state;
        const crrSoldOut = _.get(sOtherMenu, `${aType}[${aIndex}].soldOut`);
        _.set(sOtherMenu, `${aType}[${aIndex}].soldOut`, !crrSoldOut);
        this.setState({
            sOtherMenu,
        })
    };

    handleSelectBeerItem = (aItem) => {
        _.set(this.editBeerMenuItem, 'item.beer', aItem);
        _.set(this.editBeerMenuItem, 'item.capacity', 0);
        _.set(this.editBeerMenuItem, 'item.capacityUnit', '');
        this.setState({
            sSelectedCapacity: this.beers[aItem._id || ''] || [],
        });
    };

    handleSelectBeerCapacity = (aItem) => {
        _.set(this.editBeerMenuItem, 'item.capacity', aItem.capacity);
        _.set(this.editBeerMenuItem, 'item.capacityUnit', aItem.capacityUnit);
    };

    handleAddNewFoodKind = () => {
        const {sOtherMenu, sIsHiddenFoodMenu} = this.state;
        this.setState({
            sIsVisibleEditCategoryModal: true,
            tempOtherMenu: sOtherMenu,
            tempHiddenFoodMenu: sIsHiddenFoodMenu
        });
    };

    handleChangeNewFoodKind = (e) => {
        if (!e) return;
        this.newFoodKind = e.target.value;
    };

    handleSaveNewFoodKind = () => {
        let {tempOtherMenu, tempHiddenFoodMenu} = this.state;
        let temp = {...tempOtherMenu};
        let key = 'temp-' + generateRandomString(5);
        temp[key] = [{
            kind: '',
            no: 1,
            isNew: true,
        }];
        tempHiddenFoodMenu[key] = false;
        this.setState({
            tempOtherMenu: temp,
            tempHiddenFoodMenu: tempHiddenFoodMenu
        });
    };

    handleCancelNewFoodKind = () => {
        this.newFoodKind = '';
        this.setState({
            sIsShowNewFoodKind: false,
        })
    };

    handleChangeMenuOrder = (aType, e) => {
        if (!e) return;
        this.menuOrder[aType] = e.target.value;
    };

    handleSaveBeerMenuItem = () => {
        this.handleUploadBeerDone([]);
    };

    handleUploadBanner = ( uploadedFiles ) => {
        if (uploadedFiles.length > 0) {
            let basicUrl = appConfig.apiUrl.substr(0, appConfig.apiUrl.lastIndexOf('/') + 1);
            let fileItem = uploadedFiles[0];
            let fileName = fileItem.name || '';
            let fileType = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
            let url = basicUrl + fileItem.id + '.' + fileType;
            _.set(this.editBeerMenuItem, 'item.image', url);
        }
        else {
            _.set(this.editBeerMenuItem, 'item.image', '');
        }
    };

    handleUploadBeerDone = (uploadedFiles) => {
        const target = this.editBeerMenuItem.item || {};
        if (!target.beerName) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '메뉴명을 입력해주세요.');
            return;
        }
        if (!target.price) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '가격을 입력해주세요.');
            return;
        }
        if (!_.get(target, 'beer._id')) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '맥주를 선택해주세요.');
            return;
        }
        if (!target.capacity) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '용량을 선택해주세요.');
            return;
        }
        // if (uploadedFiles.length > 0) {
        //     const basicUrl = appConfig.apiUrl.substr(0, appConfig.apiUrl.lastIndexOf('/') + 1);
        //     const fileItem = uploadedFiles[0];
        //     const fileName = fileItem.name || '';
        //     const fileType = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
        //     const url = basicUrl + fileItem.id + '.' + fileType;
        //     _.set(this.editBeerMenuItem, 'item.image', url);
        // }
        // else {
        //     _.set(this.editBeerMenuItem, 'item.image', '');
        // }
        const price = _.get(this.editBeerMenuItem, 'item.price') || '';
        _.set(this.editBeerMenuItem, 'item.price', numberUnmask(`${price}`));
        const priceUnit = _.get(this.editBeerMenuItem, 'item.priceUnit') || '원';
        _.set(this.editBeerMenuItem, 'item.priceUnit', priceUnit);
        const capacityUnit = _.get(this.editBeerMenuItem, 'item.capacityUnit') || 'ml';
        _.set(this.editBeerMenuItem, 'item.capacityUnit', capacityUnit);
        const capacity = _.get(this.editBeerMenuItem, 'item.capacity') || '';
        _.set(this.editBeerMenuItem, 'item.capacity', numberUnmask(`${capacity}`));
        const index = _.get(this.editBeerMenuItem, 'index');
        const type = _.get(this.editBeerMenuItem, 'type') || '';
        let {sMainMenu} = this.state;
        let targetArray = sMainMenu[type] || [];
        if (index || index === 0) {
            _.set(targetArray, `[${index}]`, target);
        } else {
            targetArray.push(target);
        }
        sMainMenu[type] = targetArray;
        this.handleToggleBeerMenuModal(false, {sMainMenu})
    };

    handleSaveCategory = () => {
        let {tempOtherMenu, tempHiddenFoodMenu} = this.state;
        let keys = Object.keys(tempOtherMenu);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].indexOf('temp-') >= 0) {
                if (tempOtherMenu[keys[i]][0].kind.trim() === '') {
                    delete tempOtherMenu[keys[i]];
                    delete tempHiddenFoodMenu[keys[i]];
                } else {
                    let duplicatedKind = false;
                    _.map(tempOtherMenu, (menuItem, menuKind) => {
                        if (tempOtherMenu[keys[i]][0].kind.trim() === menuKind) {
                            duplicatedKind = true;
                        }
                    });
                    if (duplicatedKind) {
                        pushNotification(NOTIFICATION_TYPE_WARNING, '중복되는 분류가 있습니다. 확인해주세요.');
                        return;
                    }

                    let type = tempOtherMenu[keys[i]][0].kind;
                    let item = tempOtherMenu[keys[i]];
                    for (let j = 0; j < item.length; j++) {
                        item[j].kind = type;
                        item[j].no = this.menuOrder[keys[i]];
                    }
                    tempOtherMenu[type] = item;
                    this.menuOrder[type] = this.menuOrder[keys[i]];
                    delete tempOtherMenu[keys[i]];
                    delete this.menuOrder[keys[i]];
                }
            } else {
                if (keys[i] !== tempOtherMenu[keys[i]][0].kind) {
                    let type = tempOtherMenu[keys[i]][0].kind;
                    let item = tempOtherMenu[keys[i]];
                    for (let j = 0; j < item.length; j++) {
                        item[j].kind = type;
                        item[j].no = this.menuOrder[keys[i]];
                    }
                    tempOtherMenu[type] = item;
                    this.menuOrder[type] = this.menuOrder[keys[i]];
                    delete tempOtherMenu[keys[i]];
                    delete this.menuOrder[keys[i]];
                }
            }
        }

        console.log(this.menuOrder);
        this.setState({
            sOtherMenu: tempOtherMenu,
            sIsHiddenFoodMenu: tempHiddenFoodMenu
        });
        this.handleToggleEditCategoryModal(false);
    };

    handleUploadDone = (uploadedFiles) => {
        let target = this.editFoodMenuItem.item || {};
        if (typeof target.content === 'object') {
            target.content = '';
        }
        if (!target.foodName) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '메뉴명을 입력해주세요.');
            return;
        }
        if (!target.price) {
            pushNotification(NOTIFICATION_TYPE_ERROR, '가격을 입력해주세요..');
            return;
        }
        if (uploadedFiles.length > 0) {
            const basicUrl = appConfig.apiUrl.substr(0, appConfig.apiUrl.lastIndexOf('/') + 1);
            const fileItem = uploadedFiles[0];
            const fileName = fileItem.name || '';
            const fileType = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
            const url = basicUrl + fileItem._id + '.' + fileType;
            _.set(this.editFoodMenuItem, 'item.image', url);
        }
        else {
            _.set(this.editFoodMenuItem, 'item.image', '');
        }
        const price = _.get(this.editFoodMenuItem, 'item.price') || '';
        _.set(this.editFoodMenuItem, 'item.price', numberUnmask(`${price}`));
        const priceUnit = _.get(this.editFoodMenuItem, 'item.priceUnit') || '원';
        _.set(this.editFoodMenuItem, 'item.priceUnit', priceUnit);
        const index = _.get(this.editFoodMenuItem, 'index');
        const type = _.get(this.editFoodMenuItem, 'type') || '';
        const no = _.get(this.editFoodMenuItem, 'no') || 1;
        target.kind = type;
        target.no = no;
        const {sOtherMenu} = this.state;
        let modifiedOtherMenu = {...sOtherMenu};
        let targetArray = modifiedOtherMenu[type] || [];

        if (_.get(targetArray, '[0].isNew')) {
            targetArray.splice(0, 1);
        }

        if (index || index === 0) {
            _.set(targetArray, `[${index}]`, target);
        } else {
            targetArray.push(target);
        }
        modifiedOtherMenu[type] = targetArray;
        this.handleToggleFoodMenuModal(false, {sOtherMenu: modifiedOtherMenu,})
    };

    handleToggleIsHiddenFoodMenu = (aFoodKind) => {
        let {tempHiddenFoodMenu} = this.state;
        const crrState = tempHiddenFoodMenu[aFoodKind] || false;
        _.set(tempHiddenFoodMenu, aFoodKind, !crrState);
        this.setState({
            tempHiddenFoodMenu,
        })
    };

    handleSaveFoodMenuItem = () => {
        let image = _.get(this.editFoodMenuItem, 'item.image') || '';
        if (typeof image === 'object' && Object.keys(image).length === 0) {
            image = '';
        }
        if (image) {
            this.handleUploadDone([]);
        } else {
            this.fileUpload.processSubmit();
        }
    };


    handleSaveSellerMenu = () => {
        const {sMainMenu, sOtherMenu, sIsHiddenFoodMenu} = this.state;
        let mainMenu = [];
        let otherMenu = [];
        let orders = [];
        let orderDuplicated = false;
        _.map(sMainMenu, (menuItem, menuIndex) => {
            const order = this.menuOrder[menuIndex] || 1;
            if (!findFromArray(orders, '', order)) {
                orders.push(order);
            } else {
                orderDuplicated = true;
            }
            _.map(menuItem, (item, index) => {
                mainMenu.push({
                    no: order,
                    bottleType: menuIndex,
                    beerName: item.beerName,
                    price: item.price,
                    priceUnit: item.priceUnit,
                    beer: item.beer,
                    capacity: item.capacity,
                    capacityUnit: item.capacityUnit,
                    image: item.image || '',
                    createAt: new Date(),
                    soldOut: item.soldOut,
                    _id: item._id || null
                });
            });
        });
        _.map(sOtherMenu, (menuItem, menuIndex) => {
            const order = this.menuOrder[menuIndex] || 1;
            if (!findFromArray(orders, '', order)) {
                orders.push(order);
            } else {
                orderDuplicated = true;
            }
            _.map(menuItem, (item, index) => {
                if (!item.foodName) return;
                otherMenu.push({
                    no: this.menuOrder[menuIndex] || 1,
                    kind: menuIndex,
                    foodName: item.foodName,
                    price: item.price,
                    priceUnit: item.priceUnit,
                    content: item.content,
                    image: item.image || '',
                    soldOut: item.soldOut || false,
                    isHidden: sIsHiddenFoodMenu[menuIndex],
                    _id: item._id || null
                });
            });
        });
        // if (orderDuplicated) {
        //     pushNotification(NOTIFICATION_TYPE_ERROR, '메뉴순서를 확인해주세요.');
        //     return;
        // }
        executeQuery({
            method: 'put',
            url: `/pub/updatemenu/${this.pubId}`,
            data: {
                mainMenu,
                otherMenu,
            },
            success: (res) => {
                this.modified = false;
                pushNotification(NOTIFICATION_TYPE_SUCCESS, '성공적으로 저장되었습니다.');

                let {sFetchStatus} = this.state;
                const result = _.get(res, 'pub[0]') || {};
                this.pubId = result._id;
                const mainMenu = result.mainMenu || [];
                const otherMenu = result.otherMenu || [];
                let mainMenuGrouped = {};
                let otherMenuGrouped = {};
                _.map(mainMenu, (menuItem, menuIndex) => {
                    const crrBottleType = menuItem.bottleType || '';
                    if (crrBottleType) {
                        let crrGroupedMenu = mainMenuGrouped[crrBottleType] || [];
                        crrGroupedMenu.push(menuItem);
                        mainMenuGrouped[crrBottleType] = crrGroupedMenu;
                        this.menuOrder[crrBottleType] = menuItem.no;
                    }
                });
                let isHiddenFoodMenu = {};
                _.map(otherMenu, (menuItem, menuIndex) => {
                    const crrKind = menuItem.kind || '';
                    if (crrKind) {
                        let crrGroupedMenu = otherMenuGrouped[crrKind] || [];
                        crrGroupedMenu.push(menuItem);
                        otherMenuGrouped[crrKind] = crrGroupedMenu;
                        this.menuOrder[crrKind] = menuItem.no;
                        isHiddenFoodMenu[crrKind] = menuItem.isHidden || false;
                    }
                });

                sFetchStatus.pub = true;
                this.setState({
                    sFetchStatus,
                    sMainMenu: mainMenuGrouped,
                    sOtherMenu: otherMenuGrouped,
                    sIsHiddenFoodMenu: isHiddenFoodMenu,
                });
            },
            fail: (err, res) => {

            }
        })
    };

    renderBeerModalImage = (aItem) => {
        return <img src={aItem} alt=''/>
    };

    processRemoveAllMenus = (aType) => {
        let {sMainMenu} = this.state;
        sMainMenu[aType] = [];
        this.setState({
            sMainMenu,
        });
    };


    handleBannerChange = (aFiles) => {
        console.log('handle-banner-change');
        this.fileUpload.processSubmit();
    };

    renderBeerMenuModal = () => {
        const {sIsVisibleBeerMenuModal, sBeersByBottleType, sSelectedCapacity} = this.state;
        if (!sIsVisibleBeerMenuModal) return null;
        let image = _.get(this.editBeerMenuItem, 'item.image') || '';
        if (typeof image === 'object') image = '';
        const targetBeers = sBeersByBottleType[this.editBeerMenuItem.type || ''] || [];
        let selectedCapacity = [];
        _.map(sSelectedCapacity, (capacityItem, capacityIndex) => {
            const type = this.editBeerMenuItem.type || '';
            if (type.indexOf(capacityItem.bottleType) > -1) {
                selectedCapacity.push(capacityItem);
            }
        });
        return (
            <Modal
                isOpen={sIsVisibleBeerMenuModal}
                toggle={this.handleToggleBeerMenuModal.bind(this, false)}
                className='modal-beer-menu'
            >
                <ModalHeader
                    toggle={this.handleToggleBeerMenuModal.bind(this, false)}
                    className='modal-beer-menu-header'
                >
                    <h4>{(this.editBeerMenuItem.index || this.editBeerMenuItem.index === 0) ? '메뉴편집' : '메뉴등록'}</h4>
                </ModalHeader>
                <ModalBody className='modal-beer-menu-body'>
                    <div className='modal-beer-menu-body-item'>
                        <div className='modal-item-title'>메뉴명</div>
                        <div className='modal-item-content'>
                            <input
                                name='beerName'
                                defaultValue={_.get(this.editBeerMenuItem, 'item.beerName') || ''}
                                onChange={this.handleChangeBeerMenuItem}
                            />
                        </div>
                    </div>
                    <div className='modal-beer-menu-body-item'>
                        <div className='modal-item-title'>가격</div>
                        <div className='modal-item-content'>
                            <MaskedInput
                                name='price'
                                mask={PRICE_MASK}
                                defaultValue={_.get(this.editBeerMenuItem, 'item.price') || ''}
                                onChange={this.handleChangeBeerMenuItem}
                            />
                            원
                        </div>
                    </div>
                    <div className='modal-beer-menu-body-item'>
                        <div className='modal-item-title'>맥주</div>
                        <div className='modal-item-content'>
                            <SearchSelect
                                pTitle={{
                                    key: 'name'
                                }}
                                defaultValue={_.get(this.editBeerMenuItem, 'item.beer')}
                                pData={targetBeers}
                                onChange={this.handleSelectBeerItem}
                            />
                        </div>
                    </div>
                    <div className='modal-beer-menu-body-item'>
                        <div className='modal-item-title'>용량</div>
                        <div className='modal-item-content'>
                            <SearchSelect
                                pHasSearch={false}
                                pTitle={{
                                    func: (aItem) => {
                                        return `${aItem.capacity || ''}${aItem.capacityUnit || ''}`
                                    }
                                }}
                                defaultValue={{
                                    bottleType: _.get(this.editBeerMenuItem, 'type') || '',
                                    capacity: _.get(this.editBeerMenuItem, 'item.capacity'),
                                    capacityUnit: _.get(this.editBeerMenuItem, 'item.capacityUnit'),
                                }}
                                pData={selectedCapacity}
                                onChange={this.handleSelectBeerCapacity}
                            />
                        </div>
                    </div>
                    <div className='modal-beer-menu-body-item'>
                        <div className='modal-item-title'>사진</div>
                        <div className='modal-item-content'>
                            <form>
                                {image &&
                                <FileList
                                    pFiles={[image]}
                                    downloadAvailable={false}
                                    pHandleDelete={this.handleRemoveBeerModalImage}
                                    pIconCustomRender={this.renderBeerModalImage}
                                />
                                }
                                <FileUpload
                                    url='/files/upload/public'
                                    className='beer-menu-image-fileUpload-dropzone'
                                    ref={ref => {
                                        this.fileUpload = ref;
                                    }}
                                    //handleUploadDone={this.handleUploadBeerDone}
                                    handleUploadDone={this.handleUploadBanner}
                                    onChange={this.handleBannerChange}
                                    pMaxFileCount={1}
                                    pFileFilter={/^(image\/bmp|image\/gif|image\/jpg|image\/jpeg|image\/png)$/i}
                                />
                            </form>
                        </div>
                    </div>
                    <div className='modal-beer-menu-operation-buttons'>
                        <div className='operation-button' onClick={this.handleSaveBeerMenuItem}>저장</div>
                        <div className='operation-button'
                             onClick={this.handleToggleBeerMenuModal.bind(this, false)}>취소
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        )

    };

    renderFoodModalImage = (aItem) => {
        return <img src={aItem} alt=''/>
    };

    renderEditCategoryModal = () => {
        const {sIsVisibleEditCategoryModal, tempOtherMenu, sIsHiddenFoodMenu} = this.state;
        if (!sIsVisibleEditCategoryModal) return null;
        return (
            <Modal isOpen={sIsVisibleEditCategoryModal}
                   toggle={this.handleToggleEditCategoryModal.bind(this, false)}
                   className='modal-food-menu'>
                <ModalHeader toggle={this.handleToggleEditCategoryModal.bind(this, false)} className='modal-food-menu-header'>
                    <h4>분류관리</h4>
                    <button onClick={() => {this.handleSaveNewFoodKind()}}>분류추가</button>
                </ModalHeader>
                <ModalBody className='modal-food-menu-body'>
                    <table>
                        <thead>
                            <tr>
                                <th width={'15%'}>순서</th>
                                <th width={'60%'}>분류</th>
                                <th width={'15%'}>숨김</th>
                                <th width={'10%'}></th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            _.map(tempOtherMenu, (item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>
                                            <MaskedInput
                                                mask={ORDER_MASK}
                                                className='menu-order-number'
                                                defaultValue={this.menuOrder[index] || 1}
                                                onChange={this.handleChangeMenuOrder.bind(this, index)}
                                            />
                                        </td>
                                        <td>
                                            <input name='type'
                                                   defaultValue={item[0].kind || ''}
                                                   onChange={(e) => {this.handleChangeCategory(e, index)}}/>
                                        </td>
                                        <td>
                                            <i className={sIsHiddenFoodMenu[index] ? 'fa fa-check-square-o' : 'fa fa-square-o'}
                                               onClick={this.handleToggleIsHiddenFoodMenu.bind(this, index)}/>
                                        </td>
                                        <td>
                                            <i className='add-delete-new-menu fa fa-trash'
                                               onClick={this.handleRemoveAllFoodMenus.bind(this, index)}/>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                    <div className='modal-food-menu-operation-buttons'>
                        <div className='operation-button' onClick={this.handleSaveCategory.bind(this)}>저장</div>
                        <div className='operation-button'
                             onClick={this.handleToggleEditCategoryModal.bind(this, false)}>취소
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        )
    };

    renderFoodMenuModal = () => {
        const {sIsVisibleFoodMenuModal} = this.state;
        if (!sIsVisibleFoodMenuModal) return null;
        let image = _.get(this.editFoodMenuItem, 'item.image') || '';
        let content = _.get(this.editFoodMenuItem, 'item.content') || '';
        if (typeof image === 'object') image = '';
        if (typeof content === 'object') content = '';
        return (
            <Modal
                isOpen={sIsVisibleFoodMenuModal}
                toggle={this.handleToggleFoodMenuModal.bind(this, false)}
                className='modal-food-menu'
            >
                <ModalHeader
                    toggle={this.handleToggleFoodMenuModal.bind(this, false)}
                    className='modal-food-menu-header'
                >
                    <h4>{(this.editFoodMenuItem.index || this.editFoodMenuItem.index === 0) ? '메뉴편집' : '메뉴등록'}</h4>
                </ModalHeader>
                <ModalBody className='modal-food-menu-body'>
                    <div className='modal-food-menu-body-item'>
                        <div className='modal-item-title'>메뉴명</div>
                        <div className='modal-item-content'>
                            <input
                                name='foodName'
                                defaultValue={_.get(this.editFoodMenuItem, 'item.foodName') || ''}
                                onChange={this.handleChangeFoodMenuItem}
                            />
                        </div>
                    </div>
                    <div className='modal-food-menu-body-item'>
                        <div className='modal-item-title'>가격</div>
                        <div className='modal-item-content'>
                            <MaskedInput
                                name='price'
                                mask={PRICE_MASK}
                                defaultValue={_.get(this.editFoodMenuItem, 'item.price') || ''}
                                onChange={this.handleChangeFoodMenuItem}
                            />
                            원
                        </div>
                    </div>
                    <div className='modal-food-menu-body-item'>
                        <div className='modal-item-title'>설명</div>
                        <div className='modal-item-content'>
                            <textarea
                                name='content'
                                defaultValue={content}
                                onChange={this.handleChangeFoodMenuItem}
                            />
                        </div>
                    </div>
                    <div className='modal-food-menu-body-item'>
                        <div className='modal-item-title'>사진</div>
                        <div className='modal-item-content'>
                            <form>
                                {image &&
                                <FileList
                                    pFiles={[image]}
                                    downloadAvailable={false}
                                    pHandleDelete={this.handleRemoveModalImage}
                                    pIconCustomRender={this.renderFoodModalImage}
                                />
                                }
                                <FileUpload
                                    url='/files/upload/public'
                                    className='food-menu-image-fileUpload-dropzone'
                                    ref={ref => {
                                        this.fileUpload = ref;
                                    }}
                                    handleUploadDone={this.handleUploadDone}
                                    pMaxFileCount={1}
                                    pFileFilter={/^(image\/bmp|image\/gif|image\/jpg|image\/jpeg|image\/png)$/i}
                                />
                            </form>
                        </div>
                    </div>
                    <div className='modal-food-menu-operation-buttons'>
                        <div className='operation-button' onClick={this.handleSaveFoodMenuItem}>저장</div>
                        <div className='operation-button'
                             onClick={this.handleToggleFoodMenuModal.bind(this, false)}>취소
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        )
    };

    renderMenuType = (aType, aLength) => {
        return (
            <td rowSpan={aLength || 1}>
                {aType}
                <i className='add-delete-new-menu fa fa-trash' onClick={this.handleRemoveAllMenus.bind(this, aType)}/>
                <i className='add-delete-new-menu fa fa-plus'
                   onClick={this.handleAddNewBeerMenuItem.bind(this, aType)}/>
            </td>
        );
    };

    renderMenuOrder = (aType, aLength) => {
        return (
            <td rowSpan={aLength || 1}>
                <MaskedInput
                    mask={ORDER_MASK}
                    className='menu-order-number'
                    defaultValue={this.menuOrder[aType] || 1}
                    onChange={this.handleChangeMenuOrder.bind(this, aType)}
                />
            </td>
        );
    };

    renderBeerMenuTr = (aType) => {
        const {sMainMenu} = this.state;
        const targetMenu = sMainMenu[aType] || [];

        return (
            <table className={'beer-menu-table'}>
                <thead>
                <tr>
                    <th width={'22.5%'}>메뉴명</th>
                    <th width={'22.5%'}>가격</th>
                    <th width={'22.5%'}>맥주</th>
                    <th width={'22.5%'}>용량</th>
                    <th width={'10%'}></th>
                </tr>
                </thead>
                <tbody>
                {
                    targetMenu.length === 0 && (
                        <tr>
                            <td colSpan='5'>등록된 메뉴가 없습니다.</td>
                        </tr>
                    )
                }
                {
                    targetMenu.map((menuItem, menuIndex) => {
                        return (
                            <tr key={`${menuItem._id}-${menuIndex}`}>
                                <td onClick={this.handleEditMenuItem.bind(this, aType, menuItem, menuIndex)} className={'pointer'}>{menuItem.beerName || ''}</td>
                                <td>{`${maskNumber(menuItem.price || '') || 0}${menuItem.priceUnit}`}</td>
                                <td>{_.get(menuItem, 'beer.name') || ''}</td>
                                <td>{`${maskNumber(menuItem.capacity || '') || 0}${menuItem.capacityUnit || ''}`}</td>
                                <td>
                                    <i className='fa fa-trash'
                                       onClick={this.handleRemoveMenuItem.bind(this, aType, menuIndex)}/>
                                </td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        );
    };

    selectBeerMenuTab(val) {
        this.setState({sBeerMenuMode: val})
    }
    selectFoodMenuTab(val) {
        this.setState({sFoodMenuMode: val})
    }

    renderBeerMenuTable = () => {
        const {sBeerMenuMode} = this.state;

        return (
            <div className={'tab-container'}>
                <div className={'tabs'}>
                    <div className={'tab-title'}>
                        분류
                    </div>
                    <div className={cn('tab-menu-item', sBeerMenuMode === 1 && 'active')} onClick={() => {
                        this.selectBeerMenuTab(1)
                    }}>Draft
                    </div>
                    <div className={cn('tab-menu-item', sBeerMenuMode === 2 && 'active')} onClick={() => {
                        this.selectBeerMenuTab(2)
                    }}>Bottle & Can
                    </div>
                </div>
                <div className={'tab-content'}>
                    {
                        sBeerMenuMode === 1 && this.renderBeerMenuTr('Draft')
                    }
                    {
                        sBeerMenuMode === 2 && this.renderBeerMenuTr('Bottle & Can')
                    }
                </div>
            </div>
        )
    };

    renderFoodMenuTr = (aItem, aIndex, menuIndex) => {
        const {sIsHiddenFoodMenu} = this.state;
        return (
            <table className={'beer-menu-table'} key={menuIndex}>
                <thead>
                <tr>
                    <th width={'22.5%'}>메뉴명</th>
                    <th width={'22.5%'}>가격</th>
                    <th width={'22.5%'}>설명</th>
                    <th width={'22.5%'}>사진</th>
                    <th width={'10%'}></th>
                </tr>
                </thead>
                <tbody>
                {
                    !aItem || aItem.length === 0 || aItem[0].isNew && (
                        <tr>
                            <td colSpan='5'>등록된 메뉴가 없습니다.</td>
                        </tr>
                    )
                }
                {
                    !(!aItem || aItem.length === 0 || aItem[0].isNew) &&
                    _.map(aItem, (item, index) => {
                        return (
                            <tr key={`${aIndex}-${index}`}>
                                <td onClick={this.handleEditFoodMenuItem.bind(this, aIndex, item, index)} className={'pointer'}>{item.foodName || ''}</td>
                                <td>{`${maskNumber(item.price || '') || 0}${item.priceUnit || ''}`}</td>
                                <td><pre>
                                    {item.content || ''}</pre>
                                </td>
                                <td>{item.image ? <img src={item.image} alt='' style={{width: '40px', height: '40px', borderRadius: '5px'}}/> : ''}</td>
                                <td>
                                    <i className='fa fa-trash' onClick={this.handleRemoveFoodMenuItem.bind(this, aIndex, index)}/>
                                </td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        );
        // if (!aItem || aItem.length === 0 || aItem[0].isNew) {
        //     return (
        //         <tr key={aIndex}>
        //             <td rowSpan={aItem.length || 1}>
        //                 <MaskedInput
        //                     mask={ORDER_MASK}
        //                     className='menu-order-number'
        //                     defaultValue={this.menuOrder[aIndex] || 1}
        //                     onChange={this.handleChangeMenuOrder.bind(this, aIndex)}
        //                 />
        //             </td>
        //             <td rowSpan={aItem.length || 1}>
        //                 <div>{aIndex}</div>
        //                 <div>
        //                     <i className='add-delete-new-menu fa fa-trash'
        //                        onClick={this.handleRemoveAllFoodMenus.bind(this, aIndex)}/>
        //                     <i className='add-delete-new-menu fa fa-edit'
        //                        onClick={this.handleEditCategory.bind(this, aIndex, menuIndex)}/>
        //                     <i className='add-delete-new-menu fa fa-plus'
        //                        onClick={this.handleAddNewFoodMenuItem.bind(this, aIndex, this.menuOrder[aIndex] || 1)}/>
        //                 </div>
        //             </td>
        //             <td colSpan='6'>등록된 메뉴가 없습니다.</td>
        //             <td></td>
        //         </tr>
        //     );
        // }
        // return _.map(aItem, (item, index) => {
        //     return (
        //         <tr key={`${aIndex}-${index}`}>
        //             {index === 0 &&
        //             <td rowSpan={aItem.length || 1}>
        //                 <MaskedInput
        //                     mask={ORDER_MASK}
        //                     className='menu-order-number'
        //                     defaultValue={this.menuOrder[aIndex] || 1}
        //                     onChange={this.handleChangeMenuOrder.bind(this, aIndex)}
        //                 />
        //             </td>
        //             }
        //             {index === 0 &&
        //             <td rowSpan={aItem.length || 1}>
        //                 <div>{aIndex}</div>
        //                 <div>
        //                     <i className='add-delete-new-menu fa fa-trash'
        //                        onClick={this.handleRemoveAllFoodMenus.bind(this, aIndex)}/>
        //                     <i className='add-delete-new-menu fa fa-edit'
        //                        onClick={this.handleEditCategory.bind(this, aIndex, menuIndex)}/>
        //                     <i className='add-delete-new-menu fa fa-plus'
        //                        onClick={this.handleAddNewFoodMenuItem.bind(this, aIndex, this.menuOrder[aIndex] || 1)}/>
        //                 </div>
        //             </td>
        //             }
        //             {index === 0 &&
        //             <td rowSpan={aItem.length || 1}>
        //                 <i className={sIsHiddenFoodMenu[aIndex] ? 'fa fa-check-square-o' : 'fa fa-square-o'}
        //                    onClick={this.handleToggleIsHiddenFoodMenu.bind(this, aIndex)}/>
        //             </td>
        //             }
        //             <td>{item.foodName || ''}</td>
        //             <td>{`${maskNumber(item.price || '') || 0}${item.priceUnit || ''}`}</td>
        //             <td>
        //                 <pre>{item.content || ''}</pre>
        //             </td>
        //             <td>{item.image ? <img src={item.image} alt=''/> : ''}</td>
        //             <td><i className={item.soldOut ? 'fa fa-check-square-o' : 'fa fa-square-o'}
        //                    onClick={this.handleChangeFoodMenuItemSoldOut.bind(this, aIndex, index)}/></td>
        //             <td>
        //                 <i className='fa fa-edit'
        //                    onClick={this.handleEditFoodMenuItem.bind(this, aIndex, item, index)}/>
        //                 <i className='fa fa-trash' onClick={this.handleRemoveFoodMenuItem.bind(this, aIndex, index)}/>
        //             </td>
        //         </tr>
        //     )
        // })
    };

    renderFoodMenuTable = () => {
        const {sOtherMenu, sFoodMenuMode} = this.state;
        let menuOrder = this.menuOrder;
        const sortedMenu = _.sortBy(sOtherMenu, [function (menuItem) {
            return menuOrder[_.get(menuItem, '[0].kind')] || 0;
        }]);

        return (
            <div className={'tab-container'}>
                <div className={'tabs'}>
                    <div className={'tab-title'}>
                        분류
                    </div>
                    {_.map(sortedMenu, (menuItem, menuIndex) => {
                        const kind = _.get(menuItem, '[0].kind') || '';
                        return (
                            <div key={menuIndex} className={cn('tab-menu-item', sFoodMenuMode === menuIndex && 'active')} onClick={() => {this.selectFoodMenuTab(menuIndex)}}>
                                {kind}
                            </div>
                        );
                    })}
                </div>
                <div className={'tab-content'}>
                    {_.map(sortedMenu, (menuItem, menuIndex) => {
                        const kind = _.get(menuItem, '[0].kind') || '';
                        if (menuIndex === sFoodMenuMode) {
                            return this.renderFoodMenuTr(menuItem, kind, menuIndex);
                        }
                    })}

                </div>
            </div>
        )

        // return (
        //     <table className='food-menu-table'>
        //         <thead>
        //         <tr>
        //             <th>순서</th>
        //             <th>분류</th>
        //             <th>숨김</th>
        //             <th>메뉴명</th>
        //             <th>가격</th>
        //             <th>설명</th>
        //             <th>사진</th>
        //             <th>Sold out</th>
        //             <th></th>
        //         </tr>
        //         </thead>
        //         <tbody>
        //         {_.map(sortedMenu, (menuItem, menuIndex) => {
        //             const kind = _.get(menuItem, '[0].kind') || '';
        //             return this.renderFoodMenuTr(menuItem, kind, menuIndex);
        //         })}
        //         </tbody>
        //     </table>
        // )
    };

    render() {
        const {sFetchStatus, sIsShowNewFoodKind} = this.state;
        if (sFetchStatus.beer && sFetchStatus.pub) {
            return (
                <div className='container-page-seller-menu'>
                    <div className='menu-table-container'>
                        <div className='menu-table-header'>
                            <div className='menu-table-title'>Beer</div>
                            <div className='right-buttons'>
                                <button onClick={() => {this.handleAddNewBeerMenuItem()}}>추가</button>
                            </div>
                        </div>
                        {this.renderBeerMenuTable()}
                    </div>
                    <div className='menu-table-container'>
                        <div className='menu-table-header'>
                            <div className='menu-table-title'>Menu</div>
                            <div className='right-buttons'>
                                <button onClick={() => {this.handleAddNewFoodKind()}}>분류관리</button>
                                <button onClick={() => {this.handleAddNewFoodMenuItem()}}>추가</button>
                            </div>
                            {sIsShowNewFoodKind &&
                            <div className='new-food-kind-inputer'>
                                <input onChange={this.handleChangeNewFoodKind}/>
                                <div className='new-food-kind-inputer-buttons'>
                                    <div className='save-new-food-kind' onClick={this.handleSaveNewFoodKind}>저장</div>
                                    <div className='cancel-new-food-kind' onClick={this.handleCancelNewFoodKind}>취소
                                    </div>
                                </div>
                            </div>
                            }
                        </div>
                        {this.renderFoodMenuTable()}
                    </div>
                    <div className='seller-menu-save-button-container'>
                        <div className='seller-menu-save-button' onClick={this.handleSaveSellerMenu}>저장</div>
                    </div>
                    {this.renderBeerMenuModal()}
                    {this.renderFoodMenuModal()}
                    {this.renderEditCategoryModal()}
                </div>
            );
        } else {
            return (
                <div className='loading-wrapper'>
                    <Loading/>
                </div>
            );
        }
    }
}

SellerMenu.propTypes = {};

SellerMenu.defaultProps = {};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(SellerMenu);
