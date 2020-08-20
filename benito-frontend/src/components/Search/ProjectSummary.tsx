import React from "react";
import { hot } from "react-hot-loader";
import "./styles.scss";
import { Project } from "../../types";
import { Link } from "react-router-dom";

type Props = {
  project: Project;
};

const ProjectSummary = (props: Props) => (
  <div className="row container-fluid mt-3 ml-0">
    <div className="col-sm-12 col-md-10">
      <div className="qui-summary-title font-size-24 font-size-48-md">
        <Link to={{ pathname: `/projects/${props.project.id}` }}>
          {props.project.title}
        </Link>
      </div>
      <div className="d-sm-block d-md-none">
        <img className="qui-summary-image-sm" src={props.project.posterUrl} />
      </div>
      <div className="qui-summary qui-font-text mt-3">
        {props.project.description}
      </div>
      <div className="qui-authors">
        {props.project.authors.map((a) => a.fullName).join(", ")}
      </div>
    </div>
    <div className="col-md-2 d-none d-md-flex align-items-center">
      <img className="qui-summary-image-md" src={props.project.posterUrl} />
    </div>
  </div>
);

export default hot(module)(ProjectSummary);
