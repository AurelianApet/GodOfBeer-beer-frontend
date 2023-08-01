import React, {Component} from 'react';
import cn from 'classnames';
import ReactLoading from 'react-loading-components';

import {Button} from '../../Button';
import {
    MODE_NONE, MODE_CREATE, MODE_UPDATE,
    BUTTON_NORMAL, BUTTON_ICON, BUTTON_CUSTOM,
    ACTION_SUBMIT, ACTION_CANCEL, ACTION_CUSTOM, ACTION_ROUTE
} from '../../APIForm';

export class APIFormButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDisabled: undefined,
        };
    }

    componentDidMount = () => {
        const {submitButtonEnable, onRef, item, mode} = this.props;
        onRef(this);
        if (item.action && item.action.type === ACTION_SUBMIT) {
            this.setState({
                isDisabled: mode.mode === MODE_NONE || (item.action.errDisabled && !submitButtonEnable),
            })
        }
        document.addEventListener('keyup', this.handleKeyUp, false);
    }

    componentWillReceiveProps = (newProps) => {
        const {submitButtonEnable, item, mode} = newProps;
        if (item.action && item.action.type === ACTION_SUBMIT) {
            this.setState({
                isDisabled: mode.mode === MODE_NONE || (item.action.errDisabled && !submitButtonEnable),
            })
        }
    }

    componentWillUnmount = () => {
        this.props.onRef(null);
        document.removeEventListener('keyup', this.handleKeyUp, false);
    }

    handleKeyUp = (e) => {
        const {item} = this.props;
        if (item.shortKeyInfo) {
            const shortKey = item.shortKeyInfo.shortKey;
            const key = item.shortKeyInfo.key;
            switch (shortKey) {
                case 0: // none
                    if (e.key === key) {
                        this.handleButtonClick();
                    }
                    break; // ctrl
                case 1:
                    if (e.ctrlKey && e.key === key) {
                        this.handleButtonClick();
                    }
                    break;
                case 2:  // alt
                    if (e.altKey && e.key === key) {
                        this.handleButtonClick();
                    }
                    break;
                case 3:  // ctrl + alt
                    if (e.ctrlKey && e.altKey && e.key === key) {
                        this.handleButtonClick();
                    }
                    break;
                default:
                    if (e.key === key) {
                        this.handleButtonClick();
                    }
                    break;
            }
        }
    }

    handleButtonClick = () => {
        const {item} = this.props;
        const {isDisabled} = this.state;
        if (!isDisabled && item.action && item.action.type === ACTION_SUBMIT) {
            this.props.handleSubmitForm();
        }
        if (item.action && item.action.type === ACTION_CANCEL) {
            this.props.handleCancel(item.action.url);
        }
        if (item.action && item.action.type === ACTION_ROUTE) {
            this.props.handleRoute(item.action.url);
        }
        if (item.action && item.action.type === ACTION_CUSTOM && item.action.action) {
            item.action.action();
        }
    }

    render() {
        const {mode, item, connectionStatus, parent} = this.props;
        const {isDisabled} = this.state;
        let buttonHtml = [];
        switch (item.kind) {
            case BUTTON_NORMAL:  // BUTTON_NORMAL
                buttonHtml.push(
                    <Button
                        key={`apiform-button-normal-${parent.props.id}`}
                        className='apiform-button'
                        onClick={this.handleButtonClick.bind(null)}
                        isLoading={item.action && item.action.type === ACTION_SUBMIT && connectionStatus !== 0}
                        isDisabled={isDisabled}
                    >
                        {!!item.title && item.title}
                        {!item.title && (mode.mode === MODE_NONE || mode.mode === MODE_CREATE) && '작성'}
                        {!item.title && (mode.mode === MODE_UPDATE) && '편집'}
                    </Button>
                );
                break;
            case BUTTON_ICON:  // BUTTON_ICON
                if (connectionStatus !== 0) {
                    buttonHtml.push(
                        <div key='loading-button' className="loadingWrapper">
                            <ReactLoading type="three_dots" fill="#FFF" width={24} height={24}/>
                        </div>
                    )
                } else {
                    buttonHtml.push(
                        <i
                            key={`apiform-button-normal-${parent.props.id}`}
                            className={cn('apiform-button', item.icon, isDisabled ? 'apiform-button-disabled' : '')}
                            title={item.title || ''}
                            onClick={this.handleButtonClick.bind(null)}
                        />
                    );
                }
                break;
            case BUTTON_CUSTOM:  // BUTTON_CUSTOM
                if (item.customRender) {
                    buttonHtml.push(item.customRender(item, mode, connectionStatus, this.props.handleSubmitForm()));
                }
                break;
            default:
                buttonHtml.push(
                    <div
                        key={`apiform-button-default-${parent.props.id}`}
                        className='apiform-button'
                        onClick={this.handleButtonClick.bind(null)}
                    >
                        {!!item.title && item.title}
                        {!item.title && (mode.mode === MODE_NONE || mode.mode === MODE_CREATE) && '작성'}
                        {!item.title && (mode.mode === MODE_UPDATE) && '편집'}
                    </div>
                );
                break;
        }
        if (mode.mode !== 0) {
            return (
                <div
                    key={`apiForm-button-${item.name}`}
                    className={cn('apiform-button-div', item.className)}
                    title={item.title || ''}
                >
                    {buttonHtml}
                </div>
            );
        } else {
            return null;
        }
    }
}

APIFormButton.propTypes = {};

APIFormButton.defaultProps = {};

export default APIFormButton;