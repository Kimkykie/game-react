import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { AuthContext } from "../context/context";


class FancyRoute extends React.Component {
  static contextType = AuthContext;

  render () {
    const { component: Component, ...props } = this.props
    return (
      <Route
        {...props}
        render={props => (
          this.context.token ?
            <Component {...props} /> :
            <Redirect to='/login' />
        )}
      />
    )
  }
}


export default FancyRoute;