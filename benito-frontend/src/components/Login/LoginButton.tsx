import React from "react";
import { hot } from "react-hot-loader";
import "./styles.scss";
import store from "../../store";
import {
  loadLogin,
  finishLogin,
  setUsernameError,
  setPasswordError,
  setLoginTrue,
} from "../../actions/login";
import { RootState } from "../../reducers";
import { connect } from "react-redux";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { UserSession } from "../../store/user/types";
import { setUserSession } from "../../actions/user/index";
import { benitoHost } from "../../config";

type LoginRequest = {
  username: String;
  password: String;
  userType: "STUDENT" | "TEACHER";
};

function validate(): Boolean {
  var valid = true;
  if (store.getState().login.username.valueOf() === "") {
    store.dispatch(setUsernameError());
    valid = false;
  }

  if (store.getState().login.password === "") {
    store.dispatch(setPasswordError());

    valid = false;
  }

  return valid;
}

function login() {
  var isValid = validate();

  if (!isValid) {
    return;
  }

  store.dispatch(loadLogin());

  let data: LoginRequest = {
    username: store.getState().login.username,
    password: store.getState().login.password,
    userType: "STUDENT",
  };

  let config: AxiosRequestConfig = {
    method: "POST",
    url: `${benitoHost}/benito/login`,
    data: data,
  };

  type UserData = {
    session: String;
    userInfo: UserSession;
  };

  axios(config)
    .then((response: AxiosResponse<UserData>) => response.data)
    .then((user) =>
      store.dispatch(setUserSession(user.session, "saraza", user.userInfo))
    )
    .then(() => store.dispatch(setLoginTrue()))
    .catch((e) => console.log(e.message))
    .finally(() => store.dispatch(finishLogin()));
}

const LoginButton = (props: { displayLogin: Boolean }) => (
  <div>
    <button
      className="btn btn-primary btn-block"
      type="button"
      disabled={props.displayLogin.valueOf()}
      onClick={() => login()}
    >
      <span
        className="spinner-border spinner-border-sm"
        role="status"
        aria-hidden="true"
        hidden={!props.displayLogin.valueOf()}
      />
      <span hidden={props.displayLogin.valueOf()}>Iniciar sesión</span>
    </button>
  </div>
);

const mapStateToProps = (state: RootState) => {
  return {
    displayLogin: state.login.displayLoader,
  };
};

export default hot(module)(connect(mapStateToProps)(LoginButton));
