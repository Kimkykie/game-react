import React from "react";
import jwt_decode from "jwt-decode";
import { BrowserRouter, Route, Switch, withRouter } from "react-router-dom";
import Login from "../pages/Login";
import Register from '../pages/Register'
import useToken from "./useToken";
import { AuthContext } from "./context/context";
import routes from "./tools/routes";
import FancyRoute from "./tools/FancyRoute";
import Layout from "./Layout";

function App() {
  const { token, setToken } = useToken();
  if (!token) {
    return <Login setToken={setToken} />;
  }
  if (token) {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }
  return (
    <AuthContext.Provider className="wrapper" value={{ token }}>
      <BrowserRouter>
        <Layout />
        <Switch>
          {routes.map((route, i) => (
            <FancyRoute key={i} {...route} />
          ))}
          <Route path="/login" component={withRouter(Login)} />
          <Route path="/register" component={withRouter(Register)} />
        </Switch>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
