import React from "react";
import { hot } from "react-hot-loader";
import "./styles.scss";

export type ProjectData = {
    id: String;
    title: String;
    description: String;
    posterUrl: string;
    authors: Array<Person>;
    creationDate: Date;
    tags: Array<String>
  };
  
  type Person = {
    username: String;
    profileUrl: String;
  };
  
  type Props = {
    project: ProjectData;
  };

const ProjectInfo = (props: Props) => (
    <div className="row container-fluid mt-3 ml-0">
      <div className="col-sm-12 col-md-10">
        <div className="qui-summary-title qui-font-title">
          {props.project.title}
        </div>
        <div className="d-sm-block d-md-none">
          <img className="qui-summary-image-sm" src={props.project.posterUrl} />
        </div>
        <div className="qui-summary qui-font-text mt-3">
          {props.project.description}
        </div>
      </div>
      <div className="col-md-2 d-none d-lg-block">
        <img className="qui-summary-image-md" src={props.project.posterUrl} />
      </div>
    </div>
  );

  export default hot(module)(ProjectInfo);