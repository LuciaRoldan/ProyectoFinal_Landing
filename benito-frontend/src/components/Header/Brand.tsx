import React from "react";
import { hot } from "react-hot-loader";
import "./styles.scss";
import { Link } from "react-router-dom";

const Brand = (_: any) => (
  <Link to="/" className="center" style={{ textDecoration: "none" }}>
    <div className="qui-brand-name">Proyectate</div>
  </Link>
);

export default hot(module)(Brand);
