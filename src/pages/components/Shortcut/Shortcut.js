import React, { Component }  from 'react';
import cn from 'classnames';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip'

import { links } from './Shortcut-menu'


export class Shortcut extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  handleIconClick = (url) => {
    this.props.history.push(url);
  }
  
  renderLinkMenuItem = (obj, index, level) => {
    const hasChilds = obj.childs && obj.childs.length > 0;
    const icon = obj.iconImage;
    return(
      <div key={index} className={cn("links-with-ul")}>
        {(hasChilds && icon) &&
          <img src={icon} alt="" className="icon-image" data-tip={obj.title} data-for={`${obj.title}_${index}`}/>
        }
        {(!hasChilds && icon) &&
          <img src={icon} alt="" className={cn("icon-image-link", obj.className)} onClick={() => this.handleIconClick(obj.url)} data-tip={obj.title} data-for={`${obj.title}_${index}`}/>
        }
        {(!hasChilds && !icon) &&
          <i className={cn(obj.className, obj.iconClass)} onClick={() => this.handleIconClick(obj.url)} data-tip={obj.title} data-for={`${obj.title}_${index}`}></i>
        }
      
        {hasChilds &&
          <div className="icon-image-link-container">
            {
              _.map(obj.childs, (item, index2) => {
                return this.renderLinkMenuItem(item, index2, level + 1);
              })
            }
          </div>
        }
        

        <ReactTooltip 
          id = {`${obj.title}_${index}`}
          type = "info"
          effect = "solid"
          place = "left"
          className = {`tooltip-${obj.className}`}
          border = {true}
          offset = {{left : 10}}
        />
      </div>
    )
  }

  renderLinkMenu = () => {
    return (
      <div className="links-container">
        {
          _.map(links, (item, index) => {
            return this.renderLinkMenuItem(item, index, 0);
          })
        }
      </div>
    )
  }
  
  render(){
    return (
      <div className="shortcut">
        {this.renderLinkMenu()}
      </div>
    )
  }

}

Shortcut.propTypes = {
};

Shortcut.defaultProps = {
};

export default withRouter(Shortcut);
