import React, { useState } from "react"
//import { ConditionallyRender } from "react-util-kit";
import {Chatbot} from "react-chatbot-kit"
import ActionProvider from "./ActionProvider"
import MessageParser from "./MessageParser"

import "../../assets/scss/bot/bot.scss"
import { RootState } from "../../reducers"
import { hot } from "react-hot-loader"
import { connect } from "react-redux"
import { RouteComponentProps, withRouter } from "react-router-dom"
import { SessionState } from "../../store/session/types"
import { createChatBotMessage } from "react-chatbot-kit";
import GeneralOptions from "./widgets/GeneralOptions/GeneralOptions";
import CategoriesOptions from "./widgets/GeneralOptions/CategoriesOptions";
import ProjectOptions from "./widgets/GeneralOptions/ProjectOptions";

interface ProyectabotProps extends RouteComponentProps {
  session?: SessionState;
}

const Proyectabot = (props: ProyectabotProps) => {

  let color: string = "#c41234"
  if(props.session && props.session.isLoggedIn  && props.session.selectedOrganization){
    color = props.session.selectedOrganization.color
  }

  const botName = "Proyectabot";

  const config = {
    botName: botName,
    lang: "es",
    customStyles: {
      botMessageBox: {
        backgroundColor: color,
      },
      chatButton: {
        backgroundColor: color,
      },
    },
    initialMessages: [
      createChatBotMessage(`Hola, soy ${botName}. ¿En qué te puedo ayudar?`,
      {
        widget: "generalOptions",
        delay: 500,
      }
      ),
    ],
    widgets: [
      {
        widgetName: "generalOptions",
        widgetFunc: (props:any) => <GeneralOptions {...props} />,
      },
      {
        widgetName: "categoriesOptions",
        widgetFunc: (props:any) => <CategoriesOptions {...props} />,
      },
      {
        widgetName: "ProjectOptions",
        widgetFunc: (props:any) => <ProjectOptions {...props} />,
      },
    ],
  };

  const [showChatbot, toggleChatbot] = useState(true);

  return(
    <div> 
      <div className="app-chatbot-container">
        <Chatbot
          config={config}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
          
        />
      </div>
      <button
        className="app-chatbot-button"
        onClick={() => toggleChatbot((prev) => !prev)}
      >asdasdasd
      </button>
    </div>
  );
}


const mapStateToProps = (rootState: RootState) => {
  return {
    session: rootState.session,
  };
};

export default hot(module)(connect(mapStateToProps)(withRouter(Proyectabot)));

