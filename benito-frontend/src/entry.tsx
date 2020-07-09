import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./components/Login/index";
import store from "./store";
import { Provider } from "react-redux";

const router = (
  <Router>
    <Switch>
      <Route exact path="/login" component={Login} />
      <Route exact path="/*" component={App} />
    </Switch>
  </Router>
);

ReactDOM.render(
  <Provider store={store}>{router}</Provider>,
  document.getElementById("root")
);
