import React from "react";
import { hot } from "react-hot-loader";
import { Link } from "react-router-dom";

type ProjectLinkProps = {
  children: React.ReactNode;
  id: string;
};

const ProjectLink = (props: ProjectLinkProps) => (
  <Link to={`/projects/${props.id}`} className="normalize-link">
    {props.children}
  </Link>
);

export default hot(module)(ProjectLink);
