import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import _ from 'lodash';
import cn from 'classnames';
import md5 from 'md5';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

import {validateDate} from '../../../library/utils/dateTime';
import {executeQuery} from '../../../library/utils/fetch';
import {confirmAlertMsg} from '../../../library/utils/confirmAlert';
import {
    pushNotification,
    processErrorResponse,
    NOTIFICATION_TYPE_SUCCESS,
    NOTIFICATION_TYPE_ERROR
} from '../../../library/utils/notification';
import APIFormInput from './controllers/APIFormInput';
import APIFormMaskedInput from './controllers/APIFormMaskedInput';
import APIFormTextarea from './controllers/APIFormTextarea';
import APIFormRadio from './controllers/APIFormRadio';
import APIFormOption from './controllers/APIFormOption';
import APIFormCheck from './controllers/APIFormCheck';
import APIFormAPISelect from './controllers/APIFormAPISelect';
import APIFormSelect from './controllers/APIFormSelect';
import APIFormEditor from './controllers/APIFormEditor';
import APIFormFileUpload from './controllers/APIFormFileUpload';
import APIFormCustomElement from './controllers/APIFormCustomElement';
import APIFormButton from './controllers/APIFormButton';
import APIFormPhoto from './controllers/APIFormPhoto';
import APIFormErrorElement from './controllers/APIFormErrorElement';
import APIFormUserSelect from './controllers/APIFormUserSelect';
import APIFormComponentArray from './controllers/APIFormComponentArray';
import APIFormExtendedInput from './controllers/APIFormExtendedInput';
import APIFormPasswordInput from './controllers/APIFormPassWordInput';
import APIFormDataTable from './controllers/APIFormDataTable';
import APIFormButtonRadio from './controllers/APIFormButtonRadio';

import LANG from '../../../language';
import APIFormCheckedInputArray from './controllers/APIFormCheckedInputArray';

// type of input item
export const TYPE_PHOTO = 0;
export const TYPE_BLANK = 1;
export const TYPE_RADIO = 2;
export const TYPE_OPTION = 3;
export const TYPE_DATE = 4;
export const TYPE_CHECK = 5;
export const TYPE_MASK_INPUT = 6;
export const TYPE_NUMBER = 7;
export const TYPE_SELECT = 8;
export const TYPE_TIME = 9;
export const TYPE_DATETIME = 10;
export const TYPE_CUSTOM = 11;
export const TYPE_BUTTON = 12;
export const TYPE_APISELECT = 13;
export const TYPE_INPUT = 14;
export const TYPE_TEXTAREA = 15;
export const TYPE_CHONJIEDITOR = 16;
export const TYPE_FILEUPLOAD = 17;
export const TYPE_USER_SELECT = 18;
export const TYPE_COMPONENT_ARRAY = 19;
export const TYPE_EXTENDED_INPUT = 20;
export const TYPE_PASSWORD = 21;
export const TYPE_DATATABLE = 22;
export const TYPE_BUTTON_RADIO = 23;
export const TYPE_CHECK_INPUT_ARRAY = 24;

// type of extended input
export const EXTENDED_NORMAL = 0;
export const EXTNEDED_PASSWORD = 1;
export const EXTENDED_DATE = 2;
export const EXTENDED_TIME = 3;
export const EXTENDED_DATE_TIME = 4;
export const EXTENDED_NUMBER = 5;
export const EXTENDED_MASKED = 6;

// type of title
export const TITLE_NORMAL = 0;
export const TITLE_ICON = 1;
export const TITLE_CUSTOM = 2;

// type of submit butotn
export const BUTTON_NORMAL = 0;
export const BUTTON_ICON = 1;
export const BUTTON_CUSTOM = 2;
export const BUTTON_STRING = 3;

// type of shortkey
export const SHORTKEY_NONE = 0;
export const SHORTKEY_CTRL = 1;
export const SHORTKEY_ALT = 2;
export const SHORTKEY_CTRL_ALT = 3;

// type of mode
export const MODE_READ = 0;
export const MODE_CREATE = 1;
export const MODE_UPDATE = 2;
export const MODE_NONE = 3;

// type of action
export const ACTION_SUBMIT = 0;
export const ACTION_CANCEL = 1;
export const ACTION_CUSTOM = 2;
export const ACTION_ROUTE = 3;

// type of errorStyle
export const ERROR_BORDER = 0;
export const ERROR_ALERT = 1;
export const ERROR_CUSTOM = 2;
export const ERROR_DIV = 3;
export const ERROR_NOTIFICATION = 4;

// type of connection status
const CONNECTION_STATUS_NONE = 0;
const CONNECTION_STATUS_API_SELECT = 1;
const CONNECTION_STATUS_API_CREATE = 2;
const CONNECTION_STATUS_API_UPDATE = 3;
const CONNECTION_STATUS_API_DELETE = 4;

let gTabIndex = -1;
let gCreatedForms = [];

class APIForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sDefaultData: {},
            values: {},
            optionShow: {},
            errors: {},
            submitButtonEnable: false,
            sConnectionStatus: CONNECTION_STATUS_NONE,
        };
        this.controllers = {};
        this.formData = {};
        this.m_storeQuery = {
            currentIndex: 0,
            results: {},
            error: null,
        };
        this.errors = {
            errors: {},
            status: true,
        }
        this.fileUploads = [];
        this.uploadedCount = 0;
        this.mounted = false;
        this.modified = false;
    }

    componentDidMount = () => {
        document.addEventListener('keyup', this.handleKeyUp, false);
        const {onRef, pMode, id} = this.props;
        gCreatedForms.push(id);
        onRef(this);
        if (pMode.mode === MODE_READ || pMode.mode === MODE_UPDATE) {
            this.executeAPIQueries(this.props, CONNECTION_STATUS_API_SELECT, null);
        } else {
            this.mounted = true;
            this.setState({
                sDefaultData: {},
            }, () => {
                this.initializeForm();
            })
        }
    }

    componentWillReceiveProps = (newProps) => {
        if (newProps.pMode.mode !== this.props.pMode.mode) {
            if (newProps.pMode.mode === MODE_READ || newProps.pMode.mode === MODE_UPDATE) {
                this.executeAPIQueries(newProps, CONNECTION_STATUS_API_SELECT, null);
            } else {
                this.setState({
                    sDefaultData: {},
                }, () => {
                    this.initializeForm();
                })
            }
        }
    }

    componentWillUnmount() {
        const {onRef, id} = this.props;
        onRef(null);
        document.removeEventListener('keyup', this.handleKeyUp, false);
        this.mounted = false;
        let createdForms = [];
        _.map(gCreatedForms, (formItem, formIndex) => {
            if (id !== formItem) {
                createdForms.push(formItem);
            }
        });
        gCreatedForms = createdForms;
        if (createdForms.length === 0) {
            gTabIndex = -1;
        }
    }

    initializeForm = () => {
        const {pFormInfo} = this.props;
        const {sDefaultData} = this.state;
        let optionShow = {};
        let values = {};
        _.map(pFormInfo, (rowItem, rowIndex) => {
            _.map(rowItem, (item, index) => {
                const hasDefaultData = !!sDefaultData && !!sDefaultData[item.name];
                switch (item.type) {
                    case TYPE_OPTION:  //TYPE_OPTION
                        optionShow[item.name] = false;
                        if (hasDefaultData) {
                            values[item.name] = sDefaultData[item.name];
                        }
                        break;
                    case TYPE_CHECK:  //TYPE_CHECK
                        _.map(item.value, (checkItem, checkIndex) => {
                            if (!!sDefaultData && !!sDefaultData[checkItem.name]) {
                                values[checkItem.name] = sDefaultData[checkItem.name];
                            }
                        })
                        break;
                    case TYPE_SELECT:  // TYPE_SELECT
                        if (hasDefaultData) {
                            values[item.name] = sDefaultData[item.name];
                        }
                        break;
                    default:
                        break;
                }
            });
        });
        this.mounted = true;
        this.setState({
            sDefaultData: this.formData,
            submitButtonEnable: this.errors.status,
            optionShow: optionShow,
            values: values,
        });
    }

    checkItemValidate = (data, item) => {
        if (item.valid && item.valid.required && item.valid.required.isRequired) {
            if (item.type === TYPE_CHONJIEDITOR) {
                const realData = window.htmlToText(data);
                if (!realData || realData.length === 0 || realData.trim() === '' || realData.trim() === '&nbsp;') {
                    return {
                        error: item.valid.required.errMsg || LANG('PAGE_SCHEMA_INPUT_ITEM'),
                        status: false,
                    }
                }
            } else {
                if (!data || data.length === 0 || data === '') {
                    return {
                        error: item.valid.required.errMsg || LANG('PAGE_SCHEMA_INPUT_ITEM'),
                        status: false,
                    }
                }
            }
        }
        if (item.valid && item.valid.checkValidation) {
            const error = item.valid.checkValidation(data);
            if (error) {
                return {
                    error: error,
                    status: false,
                }
            } else {
                return {
                    error: null,
                    status: true,
                }
            }
        }
        if (item.type === TYPE_DATE) {
            if (data) {
                return {
                    error: validateDate(data),
                    status: validateDate(data) === null,
                }
            }
        }
        return {
            error: null,
            status: true,
        }
    }

    validationCheck = () => {
        const {pFormInfo} = this.props;
        let errors = {}
        let status = true;
        _.map(pFormInfo, (rowItem, rowIndex) => {
            _.map(rowItem, (item, index) => {
                let itemForCheck = {...item};
                if (this.controllers[item.name] === TYPE_EXTENDED_INPUT) {
                    itemForCheck.type = this.controllers[item.name].type;
                }
                const validationResult = this.checkItemValidate(this.formData[item.name], itemForCheck);
                errors[item.name] = validationResult.error;
                status = status && validationResult.status;
            })
        });
        return {errors: errors, status: status};
    }

    checkReadyForQuery = () => {
        const {sConnectionStatus} = this.state;
        if (sConnectionStatus !== CONNECTION_STATUS_NONE) {
            return false;
        }
        return true;
    }

    executeAPIQueries = (aProps, aAPIType, aFormData) => {
        const {pAPIInfo} = aProps;
        if (!this.checkReadyForQuery()) {
            return;
        }
        let queries = [], callback = null, fail = null, defaultData = null;
        switch (aAPIType) {
            case CONNECTION_STATUS_API_SELECT:
                queries = _.get(pAPIInfo, 'select.queries') || [];
                callback = _.get(pAPIInfo, 'select.callback') || null;
                fail = _.get(pAPIInfo, 'select.fail') || null;
                defaultData = _.get(pAPIInfo, 'select.formData') || null;
                break;
            case CONNECTION_STATUS_API_CREATE:
                queries = _.get(pAPIInfo, 'create.queries') || [];
                callback = _.get(pAPIInfo, 'create.callback') || null;
                fail = _.get(pAPIInfo, 'create.fail') || null;
                break;
            case CONNECTION_STATUS_API_UPDATE:
                queries = _.get(pAPIInfo, 'update.queries') || [];
                callback = _.get(pAPIInfo, 'update.callback') || null;
                fail = _.get(pAPIInfo, 'update.fail') || null;
                break;
            case CONNECTION_STATUS_API_DELETE:
                queries = _.get(pAPIInfo, 'delete.queries') || [];
                callback = _.get(pAPIInfo, 'delete.callback') || null;
                fail = _.get(pAPIInfo, 'delete.fail') || null;
                break;
            default:
                queries = [];
                callback = null;
                break;
        }

        // check query count
        if (queries.length === 0 && !defaultData) {
            return;
        }

        // execute query
        this.m_storeQuery.results = {};
        this.m_storeQuery.currentIndex = 0;
        this.m_storeQuery.error = null;
        const totalQueryNum = queries.length;

        // set loading flag
        this.setState({
            sConnectionStatus: aAPIType,
        });

        // execute queries
        let hasError = false;
        if (defaultData) {
            const data = {
                docs: defaultData,
            }
            this.processQueryResults(true, data, aAPIType, 0, 0, callback, fail);
        } else {
            _.map(queries, (query, queryIndex) => {
                let url = query.url;
                if (url && (aAPIType === CONNECTION_STATUS_API_SELECT || CONNECTION_STATUS_API_UPDATE || aAPIType === CONNECTION_STATUS_API_DELETE)) {
                    url = url.replace(/:id/ig, query.id);
                }
                if (!hasError && (!query.valid || (query.valid && query.valid(aFormData, this.setErrors)))) {
                    executeQuery({
                        method: query.method || 'get',
                        url: url || '',
                        params: query.params || {},
                        data: (query.data && query.data(aFormData)) || {...aFormData, isMobile: window.mobileCheck()} || {isMobile: window.mobileCheck()},
                        success: (res) => {
                            this.processQueryResults(true, res, aAPIType, queryIndex, totalQueryNum, callback, fail);
                        },
                        fail: (errResp, err) => {
                            this.processQueryResults(false, err, aAPIType, queryIndex, totalQueryNum, callback, fail);
                        }
                    });
                } else {
                    hasError = true;
                }
            });
        }
        if (hasError && this.mounted) {
            this.setState({
                sConnectionStatus: CONNECTION_STATUS_NONE,
            });
        }
    }

    setDefaultData = (aData) => {
        const {pFormInfo} = this.props;
        this.formData = {};
        _.map(pFormInfo, (rowItem, rowIndex) => {
            _.map(rowItem, (item, index) => {
                if (!!item.name) {
                    this.formData[item.name] = _.get(aData, item.name);
                }
                if (item.type === TYPE_CHECK && item.value && item.value.length !== 0) {
                    _.map(item.value, (valueItem, valueIndex) => {
                        this.formData[valueItem.name] = _.get(aData, valueItem.name);
                    })
                }
            });
        });
        this.errors = this.validationCheck();
        this.initializeForm();
    }

    setErrors = (aData) => {
        _.map(aData, (errorItem, errorIndex) => {
            if (errorIndex) {
                this.errors.errors[errorIndex] = errorItem;
            }
        });
    }

    setExecuteErrors = () => {
        this.setState({
            errors: this.errors.errors,
        });
    }

    getFormData = () => {
        const {pFormInfo} = this.props;
        _.map(pFormInfo, (rowItem, rowIndex) => {
            _.map(rowItem, (item, index) => {
                if (item.name && this.controllers[item.name]) {
                    _.set(this.formData, item.name, this.controllers[item.name].value);
                }
            });
        });
    }

    isChanged = () => {
        return this.modified;
    }

    handleControllerChange = () => {
        this.getFormData();
        this.errors = this.validationCheck();
        this.setState({
            errors: {},
            submitButtonEnable: this.errors.status,
        });
        this.modified = true;
    }

    handleCancel = (aUrl) => {
        if (this.modified) {
            const {location: {pathname}} = this.props;
            let confirmParam = {
                title: LANG('BASIC_ALERTMSG_TITLE'),
                detail: LANG('BASIC_ALERTMSG_BACK'),
                confirmTitle: LANG('BASIC_ALERTMSG_YES'),
                noTitle: LANG('BASIC_ALERTMSG_NO'),
                confirmFunc: this.processGoBack.bind(null, aUrl),
            };
            confirmAlertMsg(confirmParam, pathname);
        } else {
            this.processGoBack(aUrl);
        }
    }

    handleSubmitForm = () => {
        if (this.submitted) {
            return;
        }
        this.uploadedCount = 0;
        this.getFormData();
        this.errors = this.validationCheck();
        this.setState({
            errors: this.errors.errors,
        });
        if (this.errors.status) {
            if (this.fileUploads.length === 0) {
                this.handleUploadDone(null, [], this.formData);
            } else {
                _.map(this.fileUploads, (item, index) => {
                    this.controllers[item].processSubmit(this.formData);
                });
            }
        }
    }

    handleUploadDone = (aName, uploadedFiles) => {
        const {pFormInfo} = this.props;
        if (aName && uploadedFiles && uploadedFiles.length !== 0) {
            let fileListFiles = [];
            _.map(this.controllers[aName].fileListFiles, (item, index) => {
                const id = _.get(item, '_id');
                const name = _.get(item, 'name');
                if (!!id && !!name) {
                    fileListFiles.push(item);
                }
            });
            this.formData[aName] = fileListFiles;
            _.map(uploadedFiles, (fileItem, fileIndex) => {
                this.formData[aName].push(fileItem);
            });
        }
        _.map(pFormInfo, (rowItem, rowIndex) => {
            _.map(rowItem, (item, index) => {
                if (item.type === TYPE_PASSWORD || (item.type === TYPE_EXTENDED_INPUT && item.extendedSetting && item.extendedSetting.inputType === EXTNEDED_PASSWORD && !item.isPlain)) {
                    this.formData[item.name] = !!this.formData[item.name] ? md5(this.formData[item.name]) : '';
                }
            });
        });
        this.uploadedCount++;
        if (this.uploadedCount >= this.fileUploads.length) {
            const {pMode} = this.props;
            switch (pMode.mode) {
                case MODE_CREATE:
                    this.executeAPIQueries(this.props, CONNECTION_STATUS_API_CREATE, this.formData);
                    break;
                case MODE_UPDATE:
                    this.executeAPIQueries(this.props, CONNECTION_STATUS_API_UPDATE, this.formData);
                    break;
                default:
                    break;
            }
        }
    }

    processSuccessNotification = (aData) => {
        if (aData) {
            pushNotification(NOTIFICATION_TYPE_SUCCESS, aData);
        }
    }

    processErrorNotification = (aData) => {
        if (aData) {
            pushNotification(NOTIFICATION_TYPE_ERROR, aData);
        }
    }

    processQueryResults = (isSuccessed, result, apiType, queryIndex, totalQueryNum, callback, fail) => {
        this.m_storeQuery.results[queryIndex] = isSuccessed ? result : null;
        this.m_storeQuery.currentIndex++;
        let errors = {};
        if (!isSuccessed) {
            if (!this.m_storeQuery.error) {
                this.m_storeQuery.error = {};
            }
            if (result && result.response && result.response.data) {
                if (!result.response.data.error || (result.response.data.error && typeof result.response.data.error !== 'object')) {
                    processErrorResponse(result.response, this.props.history);
                } else {
                    this.m_storeQuery.error[queryIndex] = result.response.data;
                }
            } else {
                processErrorResponse(result, this.props.history);
            }
        }
        if (this.m_storeQuery.currentIndex >= totalQueryNum) { // all queries called
            if (!this.m_storeQuery.error) { // success
                switch (apiType) {
                    case CONNECTION_STATUS_API_SELECT:
                        const fetchedData = _.get(this.m_storeQuery, 'results[0].docs');
                        if (callback) { // has custom callback
                            callback(this.m_storeQuery.results, this.setDefaultData, this.processSuccessNotification);
                        } else {
                            this.setDefaultData(fetchedData);
                        }
                        break;
                    case CONNECTION_STATUS_API_CREATE:
                        if (callback) { // has custom callback
                            callback(this.m_storeQuery.results, null, this.processSuccessNotification);
                        }
                        break;
                    case CONNECTION_STATUS_API_UPDATE:
                        if (callback) { // has custom callback
                            callback(this.m_storeQuery.results, null, this.processSuccessNotification);
                        }
                        break;
                    default:
                        break;
                }
            } else {
                _.map(this.m_storeQuery.error, (errorItem, errorIndex) => {
                    _.map(errorItem.error, (item, index) => {
                        if (index === 'other') {
                            this.processErrorNotification(item);
                        } else {
                            this.errors.errors[index] = item;
                        }
                    });
                });
                if (fail) {
                    fail(this.m_storeQuery.error, this.setExecuteErrors, this.processErrorNotification)
                } else {
                    if (!_.isEmpty(this.m_storeQuery.error))
                        processErrorResponse(this.m_storeQuery.error, this.props.history)
                }
            }
            errors = this.errors || {};
            if (this.mounted) {
                this.modified = false;
                this.submitted = true;
                setTimeout(() => {
                    this.submitted = false;
                }, 1000);
                this.setState({
                    errors: errors.errors || {},
                    sConnectionStatus: CONNECTION_STATUS_NONE,
                });
            }
        }
    }

    processGoBack = (aUrl) => {
        this.props.history.push(aUrl);
    }

    renderLabelItem = (aItem, aIndex) => {
        const {pThemeInfo} = this.props;
        const {errors} = this.state;
        const hasError = errors[aItem.name] && errors[aItem.name] !== '';
        const errStyle = {color: (hasError && pThemeInfo && pThemeInfo.error && pThemeInfo.error.errColor) || ''}
        let memberHtml = [];
        memberHtml.push(
            <td
                key={`${aIndex}_1`}
                className={cn(aItem.type === TYPE_BUTTON ? '' : 'apiform-title', `${aItem.name}-title`, hasError ? 'apiform-title-error' : '')}
                style={errStyle}
            >
                {aItem.title && (!aItem.title.type || aItem.title.type === TITLE_NORMAL) && aItem.title.string}
                {aItem.title && aItem.title.type === TITLE_ICON &&
                <i className={aItem.title.className} style={errStyle}/>}
                {aItem.title && aItem.title.type === TITLE_CUSTOM && aItem.title.customRender && aItem.customRender(aItem)}
            </td>
        );
        return memberHtml;
    }

    renderBlank = (aItem) => {
        return (
            <div className={cn('apiform-blank', aItem.className)}>
                {aItem.title && aItem.title.type === TITLE_NORMAL &&
                <span>{aItem.title.string}</span>
                }
            </div>
        );
    }

    renderInputItem = (aItem, aIndex, aMode) => {
        const {pScrollableContainer, pThemeInfo} = this.props;
        const {sDefaultData, values, optionShow, sConnectionStatus, errors} = this.state;
        let memberHtml = [];
        const errorElementParams = {
            item: aItem,
            index: aIndex,
            errors: errors,
            parent: this,
            pScrollableContainer: pScrollableContainer,
            themeInfo: pThemeInfo,
        };
        let errorDivHtml = [];
        if ((pThemeInfo && pThemeInfo.error && pThemeInfo.error.showAll) || (!this.errorDivRendered)) {
            const hasError = errors[aItem.name] && errors[aItem.name] !== '';
            if (hasError) {
                this.errorDivRendered = true;
                if (this.controllers[aItem.name] && this.controllers[aItem.name].getFocus) {
                }
            }
            if (this.mounted) {
                errorDivHtml = <APIFormErrorElement {...errorElementParams} />;
            }
        }
        let memberContent = [];
        let params = {
            onRef: (ref) => {
                this.controllers[aItem.name] = ref
            },
            mode: aMode,
            item: aItem,
            defaultData: sDefaultData[aItem.name],
            index: aIndex,
            tabIndex: gTabIndex,
            parent: this,
            isErrBorder: pThemeInfo && pThemeInfo.error && pThemeInfo.error.errorStyle === ERROR_BORDER,
            handleChange: this.handleControllerChange,
        }
        gTabIndex++;
        switch (aItem.type) {
            case TYPE_PHOTO:  // TYPE_PHOTO
                memberContent = <APIFormPhoto {...params} />;
                break;
            case TYPE_BLANK:  // TYPE_BLANK
                memberContent = this.renderBlank(aItem);
                break;
            case TYPE_RADIO:  // TYPE_RADIO
                memberContent = <APIFormRadio {...params} />;
                break;
            case TYPE_BUTTON_RADIO:  // TYPE_BUTTON_RADIO
                memberContent = <APIFormButtonRadio {...params} />;
                break;
            case TYPE_OPTION:  // TYPE_OPTION
                params.value = values[aItem.name];
                params.optionShow = optionShow[aItem.name];
                memberContent = <APIFormOption {...params} />;
                break;
            case TYPE_DATE:  // TYPE_DATE
                params.mask = [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
                memberContent = <APIFormMaskedInput {...params} />;
                break;
            case TYPE_CHECK:  // TYPE_CHECK
                params.values = values;
                params.parent = this;
                memberContent = <APIFormCheck {...params} />
                break;
            case TYPE_MASK_INPUT:  // TYPE_MASK_INPUT
                params.mask = aItem.mask;
                memberContent = <APIFormMaskedInput {...params} />
                break;
            case TYPE_NUMBER:  // TYPE_NUMBER
                params.mask = createNumberMask({
                    prefix: '',
                    suffix: '',
                    thousandsSeparatorSymbol: '',
                    allowLeadingZeroes: true,
                });
                memberContent = <APIFormMaskedInput {...params} />;
                break;
            case TYPE_SELECT:  // TYPE_SELECT
                memberContent = <APIFormSelect {...params} />;
                break;
            case TYPE_APISELECT:  // TYPE_APISELECT
                memberContent = <APIFormAPISelect {...params} />;
                break;
            case TYPE_TIME:  // TYPE_TIME
                params.mask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
                memberContent = <APIFormMaskedInput {...params} />;
                break;
            case TYPE_DATETIME:  // TYPE_DATETIME
                params.mask = [/\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
                memberContent = <APIFormMaskedInput {...params} />;
                break;
            case TYPE_CUSTOM:  // TYPE_CUSTOM
                memberContent = <APIFormCustomElement {...params} />;
                break;
            case TYPE_BUTTON:  // TYPE_BUTTON
                const {submitButtonEnable} = this.state;
                params.connectionStatus = sConnectionStatus;
                params.handleSubmitForm = this.handleSubmitForm;
                params.handleCancel = this.handleCancel;
                params.handleRoute = this.processGoBack;
                params.submitButtonEnable = submitButtonEnable;
                memberContent = <APIFormButton {...params} />;
                break;
            case TYPE_INPUT:  // TYPE_INPUT
                memberContent = <APIFormInput {...params} />;
                break;
            case TYPE_TEXTAREA:  // TYPE_TEXTAREA
                memberContent = <APIFormTextarea {...params} />;
                break;
            case TYPE_CHONJIEDITOR:  // TYPE_CHONJIEDITOR
                memberContent = <APIFormEditor {...params} />;
                break;
            case TYPE_FILEUPLOAD:  // TYPE_FILEUPLOAD
                this.fileUploads.push(aItem.name);
                params.handleUploadDone = this.handleUploadDone;
                memberContent = <APIFormFileUpload {...params} />;
                break;
            case TYPE_USER_SELECT:  // TYPE_USER_SELECT
                memberContent = <APIFormUserSelect {...params} />;
                break;
            case TYPE_COMPONENT_ARRAY:  // TYPE_COMPONENT_ARRAY
                memberContent = <APIFormComponentArray {...params} />;
                break;
            case TYPE_EXTENDED_INPUT:  // TYPE_EXTENDED_INPUT
                memberContent = <APIFormExtendedInput {...params} />;
                break;
            case TYPE_PASSWORD:   // TYPE_PASSWORD
                memberContent = <APIFormPasswordInput {...params} />;
                break;
            case TYPE_DATATABLE:  // TYPE_DATATABLE
                memberContent = <APIFormDataTable {...params} />;
                break;
            case TYPE_CHECK_INPUT_ARRAY: // TYPE_CHECK_INPUT_ARRAY
                memberContent = <APIFormCheckedInputArray {...params} />;
                break;
            default:
                memberContent = <APIFormInput {...params} />;
                break;
        }

        let colSpan;
        if (aItem.type === TYPE_BUTTON || (aItem.type !== TYPE_BUTTON && aItem.title)) {
            colSpan = aItem.colSpan || 1;
        } else if (aItem.type === TYPE_CUSTOM) {
            colSpan = aItem.colSpan || 1;
        } else {
            colSpan = aItem.colSpan ? aItem.colSpan + 1 : 2;
        }
        memberHtml.push(
            <td
                key={`${aItem.name || ''}_${aIndex}_2`}
                id={aItem.name ? `${aItem.name}-content` : ''}
                className={cn(aItem.type === TYPE_BUTTON ? '' : 'apiform-content', `${aItem.name}-content`, (aItem.type === TYPE_EXTENDED_INPUT || aItem.type === TYPE_BUTTON) ? '' : aItem.className || '')}
                colSpan={colSpan}
                rowSpan={aItem.rowSpan}
                style={aItem.style}
            >
                {memberContent}
                {!(aItem.type === TYPE_BLANK || aItem.type === TYPE_BUTTON) && errorDivHtml}
            </td>
        )
        return memberHtml;
    }

    renderFormItem = (aItem, aIndex) => {
        const {pMode} = this.props;
        let html = [];
        let memberHtml = [];
        _.map(aItem, (item, index) => {
            if (item.type !== TYPE_PHOTO && item.type !== TYPE_BLANK && item.type !== TYPE_BUTTON && !!item.title) {
                memberHtml.push(this.renderLabelItem(item, index));
            }
            memberHtml.push(this.renderInputItem(item, index, pMode));
        });
        html.push(
            <tr key={aIndex}>
                {memberHtml}
            </tr>
        );
        return html;
    }

    render() {
        const {name, id, className, pFormInfo, location: {pathname}} = this.props;
        this.pathname = pathname;
        this.errorDivRendered = false;
        this.fileUploads = [];
        gTabIndex = gTabIndex === -1 ? 0 : gTabIndex;
        if (this.mounted) {
            return (
                <div className={cn('component-apiform', className)} name={name} id={id}>
                    <form>
                        <table className='apiform-table'>
                            <tbody>
                            {
                                _.map(pFormInfo, (rowItem, rowIndex) => {
                                    return this.renderFormItem(rowItem, rowIndex);
                                })
                            }
                            </tbody>
                        </table>
                    </form>
                </div>
            );
        } else {
            return null;
        }
    }
}

APIForm.propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
    className: PropTypes.string,
    pScrollableContainer: PropTypes.string,
    pMode: PropTypes.object,
    pAPIInfo: PropTypes.object,
    pFormInfo: PropTypes.array,
    onRef: PropTypes.func,
};

APIForm.defaultProps = {
    name: '',
    id: 'APIForm',
    className: '',
    pScrollableContainer: '',
    pMode: {
        mode: MODE_READ,
    },
    pAPIInfo: {},
    pFormInfo: [],
    onRef: () => {
    },
};

/**
 * pFormInfo attributes
 {
    name: 'XXX', // string
    title: 'XXX', // string
    colSpan: XXX, // number
    rowSpan: XXX // number
  }
 */

export default compose(
    withRouter,
)(APIForm);
