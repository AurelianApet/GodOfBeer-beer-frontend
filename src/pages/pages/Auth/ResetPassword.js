import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { parseUrlParams } from '../../../library/utils/parseUrlParams';
import Loading from '../../components/Loading';
import APIForm, { 
  MODE_CREATE, 
  ACTION_SUBMIT, 
  BUTTON_NORMAL, 
  TYPE_BUTTON, TYPE_BLANK, TYPE_PASSWORD,
  TITLE_NORMAL,
  ERROR_BORDER, 
} from '../../components/APIForm';
import LANG                     from '../../../language';
import { executeQuery } from '../../../library/utils/fetch';
import { pushNotification, NOTIFICATION_TYPE_ERROR, NOTIFICATION_TYPE_SUCCESS } from '../../../library/utils/notification';

class ResetPassword extends Component {
	constructor(props) {
    super(props)
		this.state = {
      sIsAuthenticated: false,
      sUserInfo: {},
    };
	}

	componentDidMount() {
    const params = parseUrlParams( this.props.history.location.search ) || {};
    const key = params.key || '';
    if ( key ) {
      executeQuery({
        method: 'post',
        url: '/auth/decodekey',
        data: {
          code: key,
        },
        success: ( res ) => {
          this.setState({
            sIsAuthenticated: true,
            sUserInfo: res || {},
          })
        },
        fail: ( err, res ) => {
          const errMsg = _.get( err, 'data.error' ) || '해당 url의 디코딩이 실패하였습니다.';
          pushNotification( NOTIFICATION_TYPE_ERROR, errMsg );
        }
      })
    }
  }
  
  renderMainForm = () => {
    const { sUserInfo } = this.state;
    return (
      <div className='resetpassword-form'>
        <APIForm
          onRef={(ref) => {this.apiForm = ref}}
          pMode={{
            mode: MODE_CREATE,
          }}
          pFormInfo={[
            [{
              name: 'blank',
              className: 'note-label',
              title: {
                type: TITLE_NORMAL,
                string: `${sUserInfo.realName || ''} 님의 비밀번호를 초기화합니다.`,
              },
              colSpan: 2,
              type: TYPE_BLANK,
            }],
            [{
              name: 'newPassword',
              type: TYPE_PASSWORD,
              title: {
                string: LANG('PAGE_AUTH_PASSWORD')
              },
              valid: {
                required: {
                  isRequired: true,
                  errMsg: '비밀번호를 입력하세요.',
                },
                checkValidation: ( input ) => {
                    this.password = input;
                    const regExpPw = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{9,20}$/;
                    if ( !regExpPw.test( input ) ) {
                        return '영문, 숫자, 특수문자를 포함한 9자~20자 이하';
                    }
                    return null;
                }
              },
            }],
            [{
              name: 'passwordConfirm',
              type: TYPE_PASSWORD,
              title: {
                string: LANG('PAGE_AUTH_CONFIRM_PASSWORD')
              },
              valid: {
                checkValidation: ( input ) => {
                  if( this.password !== input ) {
                    return '비밀번호가 일치하지 않습니다.';
                  }
                  return null;
                }
              },
            }],
            [{
              type: TYPE_BUTTON,
              action: {
                type: ACTION_SUBMIT,
              },
              colSpan: 2,
              kind: BUTTON_NORMAL,
              className: "find-button",
              title: '비밀번호 초기화',
            }],
          ]}
          pAPIInfo={{
            create: {
              queries: [{
                method: 'put',
                url: `/user/resetpasswordbyemail/${sUserInfo._id || ''}`,
              }],
              callback: ( res, func ) => { 
                pushNotification( NOTIFICATION_TYPE_SUCCESS, '비밀번호가 초기화되었습니다.' );
              },
              fail: ( err, func, funcPushNotification ) => {
                
              }
            },
          }}
          pThemeInfo={{
            error: {
              errorStyle: ERROR_BORDER,
              showAll: true,
              errColor: '#ff6400',
            }
          }}
        />
      </div>
      
    )
  }

	render() {
    const { sIsAuthenticated } = this.state;
		return (
			<div className ='container-page-resetpassword'>
        {sIsAuthenticated?
          this.renderMainForm()
        :
          <Loading />
        }
			</div>
			
		);
	}
}

ResetPassword.propTypes = {
};

ResetPassword.defaultProps = {
};

export default withRouter(ResetPassword);