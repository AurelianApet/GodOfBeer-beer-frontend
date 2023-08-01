import React, { Component } from 'react';
import moment from 'moment';

const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

class UserTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sShowSeperator: true,
    };  
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState( prev => ({ 
        sShowSeperator: !prev.sShowSeperator,
      }));
    }, 500);
  }

  render() {
    const { sShowSeperator } = this.state;
    const now = new Date();
    const hour = moment(now).format('HH');
    const seperator = ' : ';
    const minute = moment(now).format('mm');
    return (
      <div className="usertime-component">
        <div className="clock-content">
          <div className="clock-date">
            <div className="date-date">
              {`${now.getFullYear() - 1911}(${now.getFullYear()})년 ${now.getMonth() + 1}월 ${now.getDay()}일`}
            </div>
            <div className="date-day">
              {days[now.getDay()]}
            </div>
          </div>
          <div className="clock-time">
            <div className="clock-time-container">
              <div className='clock-hour'>
                {hour}
              </div>
              <div className='clock-seperator'>
                {sShowSeperator && seperator}
              </div>
              <div className='clock-minute'>
                {minute}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UserTime;