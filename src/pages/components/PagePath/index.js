import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import cn from 'classnames';
import _ from 'lodash';

class PagePath extends Component {
  componentDidMount() {
    document.title = this.props.title;
  }
  componentWillReceiveProps(newProps) {
    document.title = newProps.title;
  }
  handlePageMove = (url, e) => {
    if (url === "")
      return;
    this.props.history.push(url);
  }
  render() {
    const { title, mainurl, sub } = this.props;
    const { location: { pathname } } = this.props;

    let catagory = 0;
    if (pathname.indexOf('/teaching-admin') !== -1) {
      catagory = 0;
    }
    if (pathname.indexOf('/teaching-support') !== -1) {
      catagory = 1;
    }
    if (pathname.indexOf('/teaching-evaluation') !== -1) {
      catagory = 2;
    }
  
    return (
      <div className="component-pagepath">
        <div className={cn((catagory === 0)? "phead-admin" : "", (catagory === 1)? "phead-support" : "", (catagory === 2)? "phead-evaluation" : "")}>
          <span>
            <div onClick={this.handlePageMove.bind(this, mainurl)}>{title}</div>
            {
              _.map(sub, (one, index) => {
                return (
                  <div key={index} onClick={this.handlePageMove.bind(this, one.url)}>
                    <i className="fa fa-angle-double-right" />
                    {one.title}
                  </div>
                );
              })
            }
          </span>
        </div>
      </div>
    );
  }
}

PagePath.propTypes = {
  title: PropTypes.string,
  mainurl: PropTypes.string,
  sub: PropTypes.array,
};

PagePath.defaultProps = {

};

export default compose(
  withRouter,
)(PagePath);
