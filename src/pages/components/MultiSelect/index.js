import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import _ from 'lodash';

global.gMultiSelectID = 0;

class MultiSelect extends Component {
  constructor(props) {
    super(props);

    let sSelectID = "multiselect" + global.gMultiSelectID++;
    this.state = {
      sSelectID,
      isMultiCheckOpen: false,
      sData: [],
    }
  }

  componentDidMount() {


    const { onChange, placeholder, data, isErrorPlaceHolder, errorMessage, isValidateRequired } = this.props;
    let realErrorMessage = errorMessage;
    if ( isValidateRequired === true && realErrorMessage.toString() === "" ) realErrorMessage = "";
    let realPlaceHolder = placeholder;
    if (isErrorPlaceHolder && realErrorMessage !== "") realPlaceHolder = realErrorMessage;
    window.onDidMount_multiselect_init(
      onChange, 
      this.state.sSelectID, 
      data,
      realPlaceHolder,
    );
  }

  componentWillReceiveProps(props) {
    if(!_.isEqual(props.data, this.props.data)) {
      const { onChange, placeholder, data } = props;
      window.onDidMount_multiselect_init(
        onChange, 
        this.state.sSelectID, 
        data,
        placeholder,
      );
    }
  }

  handleInputClick = () => {
    let virtualData = [];

    

    this.setState({
      isMultiCheckOpen: true,
    });
  } 

  render() {
    const {name, className, preSelected, isValidateRequired, errorMessage, isErrorPlaceHolder} = this.props;
    let realErrorMessage = errorMessage;
    if ( isValidateRequired === true && realErrorMessage.toString() === "" ) realErrorMessage = "";
    return (
      <div className="container-component-multiselect">
        <div className="multiselect-body">
          <div className="select-label">{this.props.label}</div>
          <input
            name={name}
            value={preSelected}
            type="hidden"
            id={this.state.sSelectID}
            className={cn(className, 'form-control select2', (isErrorPlaceHolder && realErrorMessage !== "")? "form-control-error" : "")} 
          />
          {
            isErrorPlaceHolder && realErrorMessage !== "" &&
            <i className="fa fa-info input-alert"/>
          }
        </div>        
        {
          isValidateRequired === true && !isErrorPlaceHolder && <div className="multiSelectError">{realErrorMessage}</div>
        }
      </div>
    )
  }
}

MultiSelect.propTypes = {
  name: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  isValidateRequired: PropTypes.bool,
  errorMessage: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  preSelected: PropTypes.string, // "ID1,ID2"
};

MultiSelect.defaultProps = {
  name: 'multisel_',
  className: '',
  onChange: () => {},
  placeholder: '',
  label: '',
  preSelected: '',
  isValidateRequired: true,
  errorMessage: '',
};

export default MultiSelect;

export const getGroupMemberInfos = (aCommaSeperated, aUsers) => {
  if (aCommaSeperated === null || aCommaSeperated === '')
    return [];
  let vSplitted = aCommaSeperated.split(',');
  let result = []; 
  vSplitted.forEach((id) => {
    aUsers.forEach((user) => {
      if(user._id === id) {
        result.push({
          uid: user._id,
          userID: user.userID,
          realName: user.realName,
        })
      }
    })
  })
  return result;
}

export const initializeFromUsers = (aUsers) => {
  const result = [];
  const sorted = _.orderBy(aUsers, item => {
    let name = !item.realName ? 'undefined' : item.realName;
    if (item && item.position) {
      name = item.position.name + ' - ' + name;
    }
    return name;
  })
  sorted.forEach((item, index) => {
    let name = !item.realName ? 'undefined' : item.realName;
    if (item && item.position) {
      name = item.position.name + ' - ' + name;
    }
    result.push({
      text: name,
      id: item._id,
    })
  });
  return result;
}

export const getDataFromArray = (aMembers, aFieldName, aTarget = '', aTargetFieldName = aFieldName) => {
  let members = '';
  if (aMembers && aMembers.length > 0) {
    aMembers.forEach((member, index) => {
      if (member[aTargetFieldName] !== aTarget){
        members += (member[aFieldName]);
        if(index !== aMembers.length - 1) {
          members += ', ';
        }
      }
    })
  }
  if (members.substr(members.length - 2, 1) === ',') {
    members = members.substr(0, members.length - 2);
  }
  return members;
}