import React from 'react';
import PropTypes from 'prop-types';
import {
  Route,
  Redirect,
} from 'react-router-dom';

import { appConfig } from '../appConfig';
import { executeQuery } from './utils/fetch';

const sendPageUrl = ( aUrl ) => {
  if ( !aUrl ) return;
  executeQuery({
    method: 'post',
    url: '/connect/create',
    data: {
      url: aUrl
    },
    success: ( res ) => {

    },
    fail: ( err, res ) => {

    },
  })
}

export const PrivateRoute = ({ component: InternalComponent, ...rest }) => (
  <Route
    {...rest}
    render={(props) => 
      {
        const token = localStorage.getItem('token');
        if(!token) {
          return (
            <Redirect
              to={{
                pathname: '/',
                // eslint-disable-next-line
                state: { from: props.location },
              }}
            />
          );
        } else {
          const content = <InternalComponent {...props} title={rest.title} baseUrl={rest.baseUrl} handleLogOut={rest.handleLogOut} isMobileDimension={rest.isMobileDimension}/>;
          sendPageUrl( rest.path );
          // const subMenuContent = <BeerMenu pBaseUrl={rest.baseUrl} />
          return (
            <div className='container-internal-pages'>
              {/* <div className={cn('container-internal-wrapper', rest.hasSubMenu? 'container-internal-wrapper-has-submenu' : '')}> */}
              <div className='container-internal-wrapper'>
                { content }
                {/* { rest.hasSubMenu && subMenuContent } */}
              </div>
            </div>
          )
        }
      }
    }
  />
);

export const PublicRoute = ({ component: InternalComponent, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
        const token = localStorage.getItem('token');
        sendPageUrl( rest.path );
        return !token ?
        <InternalComponent {...props} />
        :
        <Redirect
            to={{
              pathname: appConfig.startPageURL || '/',
              // eslint-disable-next-line
              state: { from: props.location },
            }}
        />;
    }
    }
  />
);

export const NormalRoute = ({ component: InternalComponent, ...rest }) => (
  <Route
      {...rest}
      render={(props) => {
        sendPageUrl( rest.path );
        return (
          <div className='container-internal-pages'>
            <div className='container-internal-wrapper'>
              <InternalComponent {...props} handleLogOut={rest.handleLogOut}  isMobileDimension={rest.isMobileDimension}/>
            </div>
          </div>
        );
      }
  }
  />
);

PublicRoute.propTypes = {
  component: PropTypes.any.isRequired,
};

PrivateRoute.propTypes = {
  component: PropTypes.any.isRequired,
};

NormalRoute.propTypes = {
  component: PropTypes.any.isRequired,
};