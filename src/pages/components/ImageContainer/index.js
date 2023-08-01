import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ImageContainer extends Component {
  render() {
    const { pContent } = this.props;
    return (
      <div className="image-container">
        <a target="_blank" href={pContent.src}>
          <img className="mainImg" src={pContent.src} alt={pContent.alt} />
        </a>
      </div>
    );
  }
}

ImageContainer.propTypes = {
  pContent: PropTypes.object,
};

ImageContainer.defaultProps = {
  pContent: {
    src: '',
    alt: '',
  },
};

export default ImageContainer;
