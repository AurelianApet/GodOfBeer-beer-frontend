import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { DateRange } from 'react-date-range';
import _ from 'lodash';
import cn from 'classnames';
import { Modal, ModalHeader, ModalBody, ModalFooter} from '../Modal';
import {Button} from '../Button';
import LANG from '../../../language'

const FORMAT = 'YYYY' + LANG('BASIC_YEAR') + 'M' + LANG('BASIC_MONTH') + 'D' + LANG('BASIC_DATE');

const PREDEFINED = {
  [LANG('COMP_DATERANGE_TODAY')]: {
    startDate: function startDate(now) {
      return now
    },
    endDate: function endDate(now) {
      return now
    }
  },

  [LANG('COMP_DATERANGE_LASTWEEK')]: {
    startDate: function startDate(now) {
      return moment().startOf('isoWeek').add(-8, 'days')
    },
    endDate: function endDate(now) {
      return moment().startOf('isoWeek').add(-2, 'days')
    }
  },  

  [LANG('COMP_DATERANGE_THISWEEK')]: {
    startDate: function startDate(now) {
      return moment().startOf('isoWeek').add(-1, 'days')
    },
    endDate: function endDate(now) {
      return moment().startOf('isoWeek').add(5, 'days')
    }
  },  

  [LANG('COMP_DATERANGE_NEXTWEEK')]: {
    startDate: function startDate(now) {
      return moment().startOf('isoWeek').add(6, 'days')
    },
    endDate: function endDate(now) {
      return moment().startOf('isoWeek').add(12, 'days')
    }
  },

  [LANG('COMP_DATERANGE_AWEEKAGO')]: {
    startDate: function startDate(now) {
      return now.add(-6, 'days')
    },
    endDate: function endDate(now) {
      return now
    }
  },
  
  [LANG('COMP_DATERANGE_TWOWEEKSAGO')]: {
    startDate: function startDate(now) {
      return now.add(-13, 'days')
    },
    endDate: function endDate(now) {
      return now
    }
  },

  [LANG('COMP_DATERANGE_AMONTHAGO')]: {
    startDate: function startDate(now) {
      return now.add(-29, 'days')
    },
    endDate: function endDate(now) {
      return now
    }
  },

  [LANG('COMP_DATERANGE_LASTMONTH')]: {
    startDate: function startDate(now) {
      return moment().startOf('month').add(-1, 'months')
    },
    endDate: function endDate(now) {
      return moment().startOf('month').add(-1, 'days')
    }
  },  
}
const THEME = {
  DateRange      : {
    background	 : 'transparent',
    display 		 : 'inline-table',
  },
  Calendar       : {
    width				 : 205,
    background   : 'transparent',
    color        : '#000',
  },
  MonthAndYear   : {
    background   : '#717375',
    color        : '#fff'
  },
  MonthButton    : {
    background   : '#555A5F'
  },
  MonthArrowPrev : {
    borderRightColor : '#000',
  },
  MonthArrowNext : {
    borderLeftColor : '#000',
  },
  Weekday        : {
    color        : '#c6cbd0'
  },
  Day            : {
    transition   : 'transform .1s ease, box-shadow .1s ease, background .1s ease',
  },
  DaySelected    : {
    background   : '#45d9b8'
  },
  DayActive    : {
    background   : '#45d9b8',
    boxShadow    : 'none'
  },
  DayInRange     : {
    background   : '#25b998',
    color        : '#000'
  },
  DayHover       : {
    background   : '#ffffff',
    color        : '#7f8c8d',
    transform    : 'scale(1.1) translateY(-10%)',
    boxShadow    : '0 2px 4px rgba(0, 0, 0, 0.4)'
  },
  PredefinedRanges : {
    color				 : '#000',
    background 	 : 'transparent',
    marginLeft	 : 10, 
    marginTop		 : 10 
  }, 
  PredefinedRangesItem : {
    background	 : 'transparent',
    color				 : '#000',
    padding			 : '2px',
  },
  PredefinedRangesItemActive : {
    color				 : ''
  }
}

export default class DateRangePicker extends React.Component {
  constructor(props){
    super(props);
    let startDate = moment(), endDate = moment();
    if(props.hasDefaultRange) {
      startDate = moment(props.startDate, 'YYYY-MM-DD');
      endDate = moment(props.endDate, 'YYYY-MM-DD');
    }
    this.state = {
      display: false,
      isSet: props.hasDefaultRange,
      isWorking: false,
      startDate: startDate,
      endDate: endDate,
      workingStartDate: startDate,
      workingEndDate: endDate
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
  }

  componentWillReceiveProps(newProps) {
    if(!_.isEqual(newProps.startDate, this.props.startDate) || !_.isEqual(newProps.endDate, this.props.endDate)) {
      this.setState({
        startDate: moment(newProps.startDate, 'YYYY-MM-DD'),
        endDate: moment(newProps.endDate, 'YYYY-MM-DD'),
        workingStartDate: moment(newProps.startDate, 'YYYY-MM-DD'),
        workingEndDate: moment(newProps.endDate, 'YYYY-MM-DD'),
      });
    }
  }

  handleKeyDown = e => {
    if (e.key === 'Enter') {
      if(this.state.display && this.state.isWorking) {
        this.handleClickApply();
      }
    } else if (e.key === 'Escape') {
      this.handleClickCancel();
    }
  }
  
  handleChange = (payload) => {
    this.setState({
      isWorking: true,
      workingStartDate : payload.startDate,
      workingEndDate : payload.endDate
    })
  }

  handleClickTitle = () => {
    const { readOnly } = this.props;
    if (readOnly) return;
    this.setState({
      display: !this.state.display
    })
  }

  handleClickApply = () => {
    if(!this.state.isWorking){
      this.setState({
        isSet: false,
        isWorking: false,
        display: false,
        startDate: moment(),
        endDate: moment(),
        workingStartDate: moment(),
        workingEndDate: moment()
      })
      if(this.props.onCancel)
        this.props.onCancel()
    }else{
      this.setState({
        isSet: true,
        isWorking: false,
        display: false,
        startDate: this.state.workingStartDate,
        endDate: this.state.workingEndDate
      })
      if(this.props.onApply)
        this.props.onApply(this.state.workingStartDate, this.state.workingEndDate)
    }
  }

  handleClickCancel = () => {
    if(this.state.isWorking){
      this.setState({
        display: false,
        isWorking: false,
        workingStartDate: this.state.startDate,
        workingEndDate: this.state.endDate
      })
    }else{
      this.setState({
        display: false,
        isWorking: false,
      })
    }    
  }

  onClickClear = () => {
    this.setState({
      isSet: false,
      isWorking: false,
      display: false,
      workingStartDate: moment(),
      workingEndDate: moment()
    })
    if(this.props.onClear)
      this.props.onClear()
  }

  render() {
    const {display, isSet, isWorking, startDate, endDate, workingStartDate, workingEndDate} = this.state;
    let range = '', titleRange =LANG('COMP_DATERANGE_TITLE');
    if(isSet) {
      titleRange = (startDate && startDate.format(FORMAT).toString()) + ' ~ ' + (endDate && endDate.format(FORMAT).toString());
    } else {
      titleRange = LANG('COMP_DATERANGE_SELECT');
    }
    if((isSet || isWorking) && workingStartDate && workingEndDate)
      range = (workingStartDate && workingStartDate.format(FORMAT).toString()) + ' ~ ' + (workingEndDate && workingEndDate.format(FORMAT).toString());
    else
      range = LANG('COMP_DATERANGE_NONE');
    return (
      <div className="date-range">
        <div className="date-range-header">
          <div className="date-range-title" onClick={this.handleClickTitle}>
            <i className='fa fa-calendar-o'/> &nbsp; {titleRange} &nbsp;&nbsp;&nbsp;
            <i className={!display ? 'fa fa-caret-up' : 'fa fa-caret-down'}/>
          </div>
          {isSet && this.props.onClear && 
            <Button
              onClick={this.onClickClear}
              color="secondary"
            >
              {LANG('COMP_DATERANGE_INIT')}
            </Button>
          }
        </div>
        <Modal
          className={cn("modal-daterange", this.props.className || "")}
          isOpen={display}
          toggle={this.handleClickCancel}
        >
          <ModalHeader toggle={this.handleClickCancel}>
            <div className="date-range-value">
              {LANG('COMP_DATERANGE_LABEL')}:&nbsp;<span>{range}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <DateRange
              startDate={ workingStartDate }
              endDate={ workingEndDate }
              linkedCalendars={ true }
              ranges={ PREDEFINED }
              onChange={ this.handleChange.bind(this) }
              theme={THEME}
            />
          </ModalBody>
          <ModalFooter>
            <div className="btn-toolbar btn-toolbar-right">
              <Button
                disabled={!isWorking}
                onClick={this.handleClickApply}
                color="primary"
              >
                {LANG('COMP_DATERANGE_SETTING')}
              </Button>
              <Button
                onClick={this.handleClickCancel}
                color="secondary"
              >
                {LANG('COMP_DATERANGE_CANCEL')}
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    )
  }
}

DateRangePicker.propTypes = {
  onApply: PropTypes.func,
  onCancel: PropTypes.func,
  onClear: PropTypes.func,
  hasDefaultRange: PropTypes.bool,
  readOnly:PropTypes.bool,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

DateRangePicker.defaultProps = {
  hasDefaultRange: false,
  readOnly: false,
  startDate: '',
  endDate: '',
};