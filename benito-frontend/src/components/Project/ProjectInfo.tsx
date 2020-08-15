import React from "react";
import ReactMarkdown from "react-markdown";
import { hot } from "react-hot-loader";
import "./styles.scss";
import moment from "moment";
import { Project } from "../../types";
import Loader from "../Common/Loader";
import { motion } from "framer-motion";

type Props = {
  project?: Project;
};

function Image(props: any) {
  return <img {...props} style={{ maxWidth: "100%" }} />;
}

const ProjectInfo = (props: Props) => {
  if (!props.project) {
    return (
      <div className="center">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="qui-blurred-image"
        style={{ backgroundImage: `url(${props.project.posterUrl})` }}
      >
        <div className="qui-backdrop">
          <p className="qui-project-title qui-font-title">
            {props.project.title}
          </p>
        </div>
      </div>
      <div className="row qui-border"></div>

      <div className="container-fluid qui-box">
        <div className="row">
          <div className="col-md-12 mt-5 mb-4">
            <div className="qui-project-subtitle">Resumen</div>
            <div className="qui-summary qui-font-text mt-3">
              {props.project.description}
            </div>
          </div>
          <div className="col-md-6 qui-vertical-separator">
            <div className="qui-project-subtitle">Detalles</div>
            <div className="row">
              <div className="col-6 mt-2">
                <div className="qui-summary qui-font-text">
                  Fecha de publicación
                </div>
              </div>
              <div className="col-6 mt-2">
                <div className="qui-summary qui-font-text">
                  {moment(props.project.creationDate).format("DD-MM-YYYY")}
                </div>
              </div>
              <div className="col-6 mt-2">
                <div className="qui-summary qui-font-text">Autores</div>
              </div>
              <div className="col-6 mt-2">
                <div className="qui-summary qui-font-text">
                  {props.project.authors.map((a) => a.fullName).join(", ")}
                </div>
              </div>
              <div className="col-6 mt-2">
                <div className="qui-summary qui-font-text">Etiquetas</div>
              </div>
              <div className="col-6 mt-2">
                <div className="qui-summary qui-font-text">
                  {props.project.tags.join(", ")}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="qui-project-subtitle">Documentación</div>
          </div>
          {props.project.extraContent != "" ? (
            <div className="col-md-12 mt-4">
              <div className="qui-project-subtitle">Contenido adicional</div>
              <ReactMarkdown
                source={props.project.extraContent.valueOf()}
                renderers={{ image: Image }}
              />
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default hot(module)(ProjectInfo);
