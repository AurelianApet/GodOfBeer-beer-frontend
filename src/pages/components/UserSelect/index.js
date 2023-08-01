import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import LANG from '../../../language';
import MultiCheck from '../MultiCheck';
import { removeFromArray } from '../../../library/utils/array';

class UserSelect extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }

  processInitData = (aData) => {
    let result = [];
    _.map(aData, (item, index) => {
      let resultItem = {};
      let hasMembers = item.members && item.members.length > 0;
      if (hasMembers){
        if ( item.isStudentGroup === true || item.isTeacherGroup === true || item.isVisibleFromStudent === true ) {
            let kind = 'teacher';
            if (item.isStudentGroup === true){
              kind = 'student'
            }
            resultItem = { text: item.name, id: item._id, kind: kind, childs: [] };
            let temp = this.processInitData(item.members);
          let sortedData = _.orderBy(temp, 'text', 'asc');
          resultItem.childs = sortedData;
          }
        }
        else{
          if (!!item.realName) {
            resultItem =  { text: item.realName, id: item.uid };
          }
          else {
            if ( item.isStudentGroup === true || item.isTeacherGroup === true || item.isVisibleFromStudent === true ) {
              let kind = 'teacher';
              if (item.isStudentGroup === true){
                kind = 'student'
              }
              resultItem =  { text: item.name, id: "noChilds", kind: kind };
            }
          }
        }
      if ( resultItem.text !== undefined ) {
        result.push(resultItem);
      }
    })
    return result;
  }

  processInitDefaultValue = () => {
    const { defaultValue } = this.props;
    let realDefaultValue = [];
    _.map(defaultValue, (data, index) => {
      let item = { text: data.realName, id: data.uid };
      realDefaultValue.push(item);
    })
    return realDefaultValue;
  }

  handleUserSelectChange = (selData) => {
    let tempSelData = [];
    _.map(selData, (eachData, index) => {
      let tempEachData = {uid: eachData.id, realName: eachData.text}
      tempSelData.push(tempEachData);
    })
    if(this.props.pHandleUserChange !== null ) this.props.pHandleUserChange(tempSelData);
  }
  
  render() {
    const { errorMessage, label, className, hasSystemManager, auth: { groups } } = this.props;
    const tempData = this.processInitData(groups);
    let realData = tempData;

    if (hasSystemManager === false){
      realData = removeFromArray(tempData, 'text', LANG('COMP_MULTICHECK_ADMINISTRATER'));
    }
    
    const realDefaultValue = this.processInitDefaultValue();
    const kinds = [];
    return (
      <MultiCheck
        label={label}
        className={className}
        data={realData}
        defaultValue= {realDefaultValue}
        pKinds = {kinds}
        errorMessage= {errorMessage}
        pHandleChange={this.handleUserSelectChange}
      />
    )
  }
}

UserSelect.propTypes = {
  defaultValue: PropTypes.array,
  errorMessage: PropTypes.string,
  className: PropTypes.string,
  label: PropTypes.string,
  pHandleUserChange: PropTypes.func,
  hasSystemManager: PropTypes.bool,
};

UserSelect.defaultProps = {
  defaultValue: [],
  className: '',
  label: '',
  errorMessage: '',
  pHandleUserChange: null,
  hasSystemManager: false,
};

export default compose(
  withRouter,
  connect(
    state => ({
      auth: state.auth,
    }),
  )
)(UserSelect);