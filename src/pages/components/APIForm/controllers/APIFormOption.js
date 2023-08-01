import React, { Component } from 'react';
import cn from 'classnames';
import _ from 'lodash';

import Option from '../../Option';
import { MODE_READ } from '../../APIForm';
import { executeQuery } from '../../../../library/utils/fetch';
import LANG from '../../../../language';

export class APIFormOption extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      sOptionData: [],
      sFocusedListItemIndex: -1,
    };
    this.mounted = false;
  }

  componentWillMount = () => {
    this.getOptionData();
  }

  componentDidMount = () => {
    const { onRef, defaultData } = this.props;
    this.value = defaultData || '';
    onRef( this );
    this.setData( this.props );
		document.addEventListener('mousedown', this.handleClickOutside);
  }
  
  componentWillReceiveProps = ( newProps ) => {
    this.setData( newProps );
  }

  componentWillUnmount = () => {
    this.props.onRef( null );
    this.mounted = false;
    clearTimeout( this.alreadyHandledTimeOut );
    clearTimeout( this.clickOutSideClear );
		document.removeEventListener('mousedown', this.handleClickOutside);
  }

	setWrapperRef = (node) => {
		this.wrapperRef = node;
	}

  getOptionData = () => {
    const { item, defaultData } = this.props;
    executeQuery({
      method: 'get',
      url: '/options',
      params: {
        kind: item.kind || '',
      },
      success: ( res ) => {
        let optionData = [];
        let selectedIds = [];
        _.map( res.docs, ( doc, index ) => {
          if (defaultData ) {
            _.map( defaultData.split( ',' ), ( item, index ) => {
              if ( item.indexOf( doc.item ) > -1 ) {
                selectedIds.push( doc._id );
              }
            })
          }
          optionData.push({
            id: doc._id,
            value: doc.item,
            title: doc.item,
          });
        });
        this.setState({
          sOptionData: optionData,
          sSelectedIds: selectedIds,
        })
      },
      fail: ( err ) => {
        this.setState({
          sOptionData: [],
        })
      }
    });
  }

  setData = ( aProps ) => {
    const { optionShow } = aProps;
    this.checkValidation();
    this.setState({
      optionShow: optionShow,
      value: this.value,
    }, () => {
      this.mounted = true;
    });
  }

  checkValidation = () => {
    const { item, parent } = this.props;
    const validationResult = parent.checkItemValidate( this.value, item );
    this.setState({
      error: validationResult.error,
    });
  }

  getFocus = () => {
    const { item } = this.props;
    window.getElementFromId( `apiForm-option-${item.name}` ).focus();
  }

  handleKeyUp = ( e ) => {
    e.preventDefault();
    e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
    if ( !this.focused ) {
      return;
    }
    const { sFocusedListItemIndex, sOptionData } = this.state;
    if ( e.key === 'Enter' && sFocusedListItemIndex !== -1 ) {
    }
    let focusedListItemIndex = sFocusedListItemIndex;
    if ( e.key === 'ArrowDown' ) {
      if ( sFocusedListItemIndex !== sOptionData.length ) {
        focusedListItemIndex ++;
      }
    }
    if ( e.key === 'ArrowUp' ) {
      if ( sFocusedListItemIndex !== 0 ) {
        focusedListItemIndex --;
      }
    }
    this.setState({
      sFocusedListItemIndex: focusedListItemIndex,
    });
    return false;
  }

  handleClickOptionList = ( aData, aStatus ) => {
    const { item } = this.props;
    const { sOptionData } = this.state;
    let oldData = this.value.split( ', ' );
    this.value = '';
    if ( !aStatus ) {
      oldData.push( aData.value );
      if ( item.enableMultiSelect ) {
        _.map( sOptionData, ( dataItem, dataIndex ) => {
          let hasValue = false;
          _.map( oldData, ( item, index ) => {
            if ( dataItem.value === item ) {
              hasValue = true;
            }
          });
          if ( hasValue ) {
            this.value = this.value === ''? dataItem.value : this.value + ', ' + dataItem.value;
          }
        })
      } else {
        this.value = aData.value;
      }
    } else {
      if ( item.enableMultiSelect ) {
        _.map( sOptionData, ( dataItem, dataIndex ) => {
          let hasValue = false;
          _.map( oldData, ( item, index ) => {
            if ( dataItem.value === item && dataItem.value !== aData.value ) {
              hasValue = true;
            }
          });
          if ( hasValue ) {
            this.value = this.value === ''? dataItem.value : this.value + ', ' + dataItem.value;
          }
        })
      } else {
        this.value = '';
      }
    }
    let selectedIds = [];
    _.map( sOptionData, ( optionItem, optionIndex ) => {
      if ( this.value ) {
        _.map( this.value.split( ',' ), ( item, index ) => {
          if ( item.indexOf( optionItem.value ) > -1 ) {
            selectedIds.push( optionItem.id );
          }
        });
      }
    });
    this.setState({
      value: this.value,
      sSelectedIds: selectedIds,
      optionListShow: item.enableMultiSelect || false,
    });
    this.checkValidation();
    this.props.handleChange();
  }

  handleSelectedOption = ( aName, aData ) => {
    const { item } = this.props;
    const { sOptionData } = this.state;
    this.value = '';
    if ( item.enableMultiSelect ) {
      if ( aData && aData.length !== 0 ) {
        this.value = aData[0].item;
        if ( aData.length > 1 ) {
          for ( let i = 1; i < aData.length; i ++ ) {
            this.value = this.value + ', ' + aData[i].item;
          }
        }
      }
    } else {
      if ( aData && aData.length !== 0 ) {
        this.value = aData[0].item || '';
      }
    }
    let selectedIds = [];
    _.map( sOptionData, ( optionItem, optionIndex ) => {
      if ( this.value ) {
        _.map( this.value.split( ',' ), ( item, index ) => {
          if ( item.indexOf( optionItem.value ) > -1 ) {
            selectedIds.push( optionItem.id );
          }
        });
      }
    });
    this.setState({
      value: this.value,
      sSelectedIds: selectedIds,
    })
    this.checkValidation();
    this.props.handleChange();
  }

  handleCloseOption = ( aName, e ) => {
    this.setState({
      optionShow: false,
    });
    clearTimeout( this.optionListDiv );
  }

  handleShowOptionList = ( e ) => {
    if ( !this.mounted || this.alreadyHandled ) {
      return;
    }
    this.alreadyHandled = true;
    this.alreadyHandledTimeOut = setTimeout( () => {
      this.alreadyHandled = false;
    }, 200 );
    let { optionListShow } = this.state;
    if ( optionListShow ) {
      clearTimeout( this.optionListDiv );
    } else {
      this.optionListDiv = setTimeout( () => {
        this.setState({
          optionListShow: false,
        });
      }, 3000 );
    }
    this.setState({
      optionListShow: !optionListShow,
    });
  }

  handleCloseOptionList = () => {
    this.optionListDiv = setTimeout( () => {
      if ( !this.mounted ) {
        return;
      }
      this.setState({
        optionListShow: false,
      });
    }, 3000 )
  }

  handleClickOutside = (event) => {
    const { optionShow } = this.state;
    if ( !this.mounted || optionShow ) { 
      return;
    }
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
			this.setState({
        optionListShow: false,
      });
		}
  } 

  handleOverOptionList = () => {
    clearTimeout( this.optionListDiv );
  }

  handleOverOptionListItem = ( aIndex ) => {
  }

  handleShowOption = ( aName, aMode, e ) => {
    if ( aMode.mode === MODE_READ ) {
      return;
    }
    if ( e ) {
      e.stopPropagation();
    }
    this.setState({
      optionShow: true,
      optionListShow: false,
    });
  }

  handleCancelValue = ( aName, e ) => {
    e.stopPropagation();
    this.value = '';
    this.setState({
      value: '',
    })
    this.checkValidation();
    this.props.handleChange();
  }

  handleOnFocus = () => {
    const { optionShow } = this.state;
    if ( optionShow ) {
      return;
    }
    this.focused = true;
    this.handleShowOptionList();
  }

  handleOnBlur = () => {
    this.focused = false;
    this.setState({
      optionListShow: false,
    });
    clearTimeout( this.optionListDiv );
  }

  renderOptionList = () => {
    const { item, mode } = this.props;
    const { sOptionData, value, sFocusedListItemIndex } = this.state;
    return (
      <div 
        key={`apiForm-option-list-${item.name}`}
        className='option-list-container'
        onMouseOut={this.handleCloseOptionList.bind()} 
        onMouseOver={this.handleOverOptionList.bind()}
      >
        {_.map( sOptionData, ( dataItem, dataIndex ) => {
          let hasSelected = false;
          const optionData = value.split( ', ' );
          _.map( optionData, ( item, index ) => {
            if ( dataItem.value === item ) {
              hasSelected = true;
            }
          })
          return (
            <div 
              key={`option-list-item-${dataIndex}`}
              className={cn( 'option-list-item', hasSelected? 'option-list-item-selected' : '', dataIndex === sFocusedListItemIndex? 'option-list-item-focused' : '' )}
              onClick={this.handleClickOptionList.bind( this, dataItem, hasSelected )}
              onMouseOver={this.handleOverOptionListItem.bind( this, dataIndex )}
            >
              {dataItem.title}
            </div>
          );
        })}
        <div 
          key={`option-list-open-option-${item.name}`}
          className='option-list-open-option'
          onClick={this.handleShowOption.bind( this, item.name, mode )}
        >
          {LANG( 'COMP_APIFORM_OPTION_MORE' )}
        </div>
      </div>
    )
  }
  
  render() {
    const { mode, item, index, isErrBorder, tabIndex } = this.props;
    const { optionShow, value, error, optionListShow, sSelectedIds } = this.state;
    let result = [];
    if ( mode.mode !== MODE_READ ) {
      let resultContainer = [];
      resultContainer.push(
        <div 
          key={`apiForm-option-${item.name}`}
          className={cn( 'option-value-container', isErrBorder && !!error? 'apiform-error' : '' )} 
          onClick={this.handleShowOptionList.bind( this )}
          id={`apiForm-option-${item.name}`}
        >
          <span>
            {value}
          </span>
            <i className='fa fa-close option-cancel-btn' onClick={this.handleCancelValue.bind( this, item.name )} />
        </div>
      );
      if ( optionListShow ) {
        resultContainer.push( this.renderOptionList() )
      }
      if ( optionShow ) {
        resultContainer.push(
          <Option 
            name={item.name}
            key={`apiForm-Option-${item.name}`}
            pKeepPrimaryKey={true}
            pDefaultSelectedRows={sSelectedIds}
            pTitle={( item.title && item.title.string ) || ''}
            pKind={item.kind}
            pCanSelectMultiRow={item.enableMultiSelect || false}
            pHandleCloseClick={this.handleCloseOption.bind( this, item.name )}
            pHandleYes={this.handleSelectedOption.bind( this, item.name )}
          />
        );
      }
      result.push(
        <div
          ref={this.setWrapperRef}
          tabIndex={tabIndex}
        >
          {resultContainer}
        </div>
      )
    } else {
      result.push(
        <div key={index} className='apiform-content-view-div'>
          {value}
        </div>
      );
    }
    return result;
  }
}

APIFormOption.propTypes = {
  
};

APIFormOption.defaultProps = {
  
};

export default APIFormOption;