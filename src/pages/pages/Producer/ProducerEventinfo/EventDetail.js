import React, { Component }   from 'react';
import { withRouter }         from 'react-router-dom';
import LANG                   from '../../../../language'
import BeerTable, {TYPE_NO}   from '../../../components/BeerTable';
import Radio                  from '../../../components/Radio';

const statusColumns = [
  {
    type: TYPE_NO,
    title: 'No',
  },
  {
    name: 'statusDate',
    title: '응모일'
  },
  {
    name: 'statusId',
    title: '아이디'
  },
  {
    name: 'statusName',
    title: '이름'
  },
]

const chooseResultColumns = [
  {
    name: 'ranking',
    title: '순위',
  },
  {
    name: 'chooseId',
    title: 'ID'
  },
  {
    name: 'chooseName',
    title: '이름'
  },
  {
    name: 'chooseResultName',
    title: '상품명'
  },
  {
    name: 'chooseResultStatus',
    title: '처리상태'
  },
]

const messageSendType = [
  {
    title: LANG('EVENT_MESSAGE_SEND_ALL'),
    value: 'all'
  },
  {
    title: LANG('EVENT_MESSAGE_SEND_ONE'),
    value: 'one'
  },
  {
    title: LANG('EVENT_MESSAGE_SEND_CHOOSE_WRONG'),
    value: 'wrong'
  }
]
class EventDetail extends Component {
	constructor(props) {
		super(props)
		this.state = {

    };
	}

	componentDidMount() {
	}

	/**
	 * handle functinos
	 **/

  handleSendMessage = () => {
    return '';
  }

  handleMessageRadio = () => {

  }

	/**
	 * process functions
	 **/

	/**
	 * other functions
	 **/

	/**
	 * render functions
	 **/
  renderHeadingDetail = () => {
    const { pDataItems } = this.props;
    return (
      <div>
        <div className = 'panel-heading'>
          <p>{LANG('EVENT_DETAIL_TITLE')}</p>
        </div>
        <div className = 'txt-center-position'>
          <table>
            <tbody>
              <tr>
                <th>이벤트명</th>
                  <td colspan='3'>{ pDataItems.eventName }</td>
              </tr>
              <tr>
                <th>등 록 일</th>
                  <td>{ pDataItems.createdAt }</td>
                <th>응모기간</th>
                  <td>{pDataItems.startDate} ~ {pDataItems.endDate}</td>
              </tr>
              <tr>
                <th>발 표 일</th>
                  <td>{ pDataItems.announcementDate }</td>
                <th>처리상태</th>
                  <td>{ pDataItems.content }</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  renderEventStatus = () => {
    const { pDataItems } = this.props;
    return (
      <div className = 'txt-center-position'>
        <div className='event-status'>
          <div><p>| {LANG('EVENT_STATUS_TITLE')} |</p></div>
          
          <div className = 'event-status-input'>
            <div> {LANG('EVENT_STATUS_COUNT')} </div>
            <div> <label value = {pDataItems.createdAt} /> 명 </div>
          </div>
        </div>
        <div>
          {
            <BeerTable
              onRef={( ref ) => {this.beerTable = ref}}
              pColumns = {statusColumns}
            />
          }
        </div>
      </div>

    )
  }

  renderChooseResult = () => {
    const { pDataItems } = this.props;
    return (
      <div className = 'txt-center-position'>
        <div className='event-status'>
          <div><p>| {LANG('EVENT_CHOOSE_TITLE')} |</p></div>
          
          <div className = 'event-status-input'>
            <div> {LANG('EVENT_CHOOSE_COUNT')} </div>
            <div> <label value = {pDataItems.createdAt} /> 명 </div>
          </div>
        </div>
        <div>
          {
            <BeerTable
              onRef={( ref ) => {this.beerTable = ref}}
              pColumns = {chooseResultColumns}
            />
          }
        </div>
      </div>
    )
  }

  renderMessageDetail = () => {
    return (
      <div className = 'txt-center-position'>
        <div className='event-status'>
          <div><p>| {LANG('EVENT_MESSAGE_DETAIL')} |</p></div>
        </div>
        <div>
          {
            <BeerTable
              onRef={( ref ) => {this.beerTable = ref}}
              pColumns = {messageSendType}
            />
          }
        </div>
      </div>
    )
  }

  renderMessageSend = () => {
    return (
      <div className = 'txt-center-position'>
        <div> <p>| {LANG('EVENT_MESSAGE_DETAIL_SEND')} |</p></div>
        <div className='event-status'>
          <div>
            <textarea className = 'textarea-multi' id = 'messageContent'></textarea>
          </div>
          <div>
            <Radio
              onRef={( ref ) => {this.radio = ref}}
              values = {messageSendType}
              onChange = {this.handleMessageRadio}
            />
          </div>
        </div>
        <div className = 'new-beer-button-group'>
          <button className = 'simple-button' onClick = {this.handleSendMessage}>{LANG('EVENT_MESSAGE_SEND_BUTTON')}</button>
        </div>
      </div>
    )
  }

	render() {
		return (
			<div className='container-page-producer-event-detail'>
				<div className = 'commonBorder'>
          <div className = 'border-style overflow'>
            {
              this.renderHeadingDetail()
            }
            {
              this.renderEventStatus()
            }
            {
              this.renderChooseResult()
            }
            <div className = 'new-beer-button-group' >
              <button className = 'simple-button' onClick = {this.handleSubmitBtn}>{LANG('EVENT_CHOOSE_INFO_BUTTON')}</button>
              <button className = 'simple-button' onClick = {this.closeUpdateModal}>{LANG('EVENT_AUTO_CHOOSE_BUTTON')}</button>
            </div>
            {
              this.renderMessageDetail()
            }
            {
              this.renderMessageSend()
            }
          </div>
				</div>
			</div>
		);
	}
}

EventDetail.propTypes = {
};

EventDetail.defaultProps = {
};

export default withRouter(EventDetail);