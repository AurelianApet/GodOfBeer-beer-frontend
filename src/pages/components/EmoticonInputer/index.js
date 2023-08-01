import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import DorpDownList, {
  DIRECTION_LEFT, DIRECTION_TOP,
  ALIGN_MATRIX, ALIGN_CENTER,
  ACTION_HOVER,
} from '../DropDownList';

export const DIRECTION_UP = 0;
export const DIRECTION_DOWN = 1;
export const EMOTICON_COUNT = 84;

class EmoticonInputer extends Component {
  constructor( props ) {
    super( props );    
    this.sampleIcons = [];
    for ( let i = 1; i < EMOTICON_COUNT + 1; i++ ) {
      this.sampleIcons.push( i );
    }
    this.totalIcons = this.getIcons(props.pContent);
  }

  convertToEmoticonString = ( aNum ) => {
    let resultString = '';
    if ( aNum < 0 ) {
      resultString = ':000:';
    } else if ( aNum < 10 ) {
      resultString = `:00${aNum}:`;
    } else if ( aNum < 100 ) {
      resultString = `:0${aNum}:`;
    } else if ( aNum < 1000 ) {
      resultString = `:${aNum}:`;
    } else {
      resultString = ':999:';
    }
    return resultString;
  }

  getIcons = (content) => {
    let resultIcons = [];
    const icons = _.get( content , 'icons' ) || this.sampleIcons;
    _.map( icons, ( item, index ) => {
      resultIcons.push({
        data: { title: this.convertToEmoticonString( item ), key: item },
        align: ALIGN_CENTER,
        className: 'emoticon',
      });
    });
    return resultIcons;
  }

  handleClickItem = ( aItem ) => {
    const { pController } = this.props;
    const handleClickEmoticon = _.get( pController, 'handleClicked' ) || (() => {});
    handleClickEmoticon( aItem.data );
  }

  renderTitle = () => {
    return (
      <i className='fa fa-twitter' />
    )
  }

  render() {
    return (
      <DorpDownList
        pTitle={{
          customRender: this.renderTitle
        }}
        pContent={this.totalIcons}
        pTheme={{
          className: 'emoticon-inputer',
          hDirection: DIRECTION_LEFT,
          vDirection: DIRECTION_TOP,
          itemAlign: ALIGN_MATRIX,
          action: ACTION_HOVER,
        }}
        pController={{
            handleClickItem: this.handleClickItem
        }}
      />
    );
  }
}

EmoticonInputer.propTypes = {
  pContent: PropTypes.object,
  pThemeInfo: PropTypes.object,
  pController: PropTypes.object,
};

EmoticonInputer.defaultProps = {
  pContent: {},
  pThemeInfo: {
    className: '',
    cols: 10,
    direction: DIRECTION_UP,
  },
  pController: {
    handleClicked: () => {},
  }
};

export default EmoticonInputer;
