import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {executeQuery} from '../../../library/utils/fetch';

class SearchInputer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sIsMobileDimension: props.isMobileDimension,
        }
        this.searchWord = '';
    }

    componentWillReceiveProps = (newProps) => {
        this.setState({
            sIsMobileDimension: newProps.isMobileDimension,
        })
    }

    handleChangeSearchInputer = (e) => {
        if (!e) {
            return;
        }
        this.searchWord = e.target.value;
    }

    handleSearchInputKeyDown = (e) => {
        if (!e) return;
        if (e.key === 'Enter') {
            this.handleClickSearchButton();
        } else if (e.key === 'Escape') {
            this.serachInput.value = '';
            this.searchWord = '';
            this.handleClickSearchButton();
        }
    }

    handleClickSearchButton = () => {
        const {pData, pHandleSearch} = this.props;
        let result = [];
        const searchWord = this.searchWord.toLowerCase();
        if (this.searchWord) {
            _.map(pData, (dataItem, dataIndex) => {
                const contentString = JSON.stringify(dataItem).toLowerCase();
                if (contentString.indexOf(searchWord) > -1) {
                    result.push(dataItem);
                }
            });
            executeQuery({
                method: 'post',
                url: '/searchkey/create',
                data: {
                    key: this.searchWord,
                },
                success: (res) => {
                },
                fail: (err, res) => {
                },
            })
        } else {
            result = pData;
        }
        pHandleSearch(result, searchWord);
    }

    render() {
        const {sIsMobileDimension} = this.state;
        const {placeholder, defaultData} = this.props;
        return (
            <div
                className={!sIsMobileDimension ? 'container-component-search-inputer' : 'mobile-container-component-search-inputer'}>
                <div className='search-input'>
                    <input
                        ref={ref => (this.serachInput = ref)}
                        placeholder={placeholder}
                        defaultValue={defaultData}
                        onChange={this.handleChangeSearchInputer}
                        onKeyDown={this.handleSearchInputKeyDown}
                    />
                </div>
                <div className='search-button' onClick={this.handleClickSearchButton}>
                    <i className='fa fa-search'/>
                </div>
            </div>
        );
    }
}

SearchInputer.propTypes = {
    placeholder: PropTypes.string,
    defaultData: PropTypes.string,
    pData: PropTypes.array,
    pHandleSearch: PropTypes.func,
};

SearchInputer.defaultProps = {
    placeholder: 'Search..',
    defaultData: '',
    pData: [],
    pHandleSearch: () => {
    },
};

export default compose(
    withRouter,
    connect(
        state => ({
            user: state.auth.user,
        }),
    )
)(SearchInputer);