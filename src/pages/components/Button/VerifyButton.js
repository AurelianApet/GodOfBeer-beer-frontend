import React, { Component, Fragment } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';

// eslint-disable-next-line
export class VerifyButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      buttonHovered: false,
    };
  }
  handleMouseEnter = () => {
    this.setState({
      buttonHovered: true,
    });
  }

  handleMouseLeave = () => {
    this.setState({
      buttonHovered: false,
    });
  }
  render() {
    const { onClick, isVerified, isLoading } = this.props;
    const { buttonHovered } = this.state;
    return (
      isVerified ?
        <div
          className={cn('smarty-tag-check', 'smarty-tag-green')}
          onClick={onClick}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          ✓
          <span className="verifyText">
            { buttonHovered ? 'Undo' : 'Verified' }
          </span>
        </div>
        :
        <Fragment>
          {
            isLoading && (
              <div className="smarty-ui-loading">
                <div title="Loading..." className={cn('smarty-dots', 'smarty-addr-29102')} />
              </div>
            )
          }
          <div className={cn('smarty-tag-check')} onClick={onClick}>
            ✓<span className="verifyText">Verify Address</span>
          </div>
        </Fragment>
    );
  }
}

VerifyButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  isVerified: PropTypes.bool,
  isLoading: PropTypes.bool,
};

VerifyButton.defaultProps = {
  isVerified: false,
  isLoading: true,
};

export default VerifyButton;
