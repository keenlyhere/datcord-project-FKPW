import "./ServerNav.css";
import avatar from "../../../assets/datcord_logo_svg.svg";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
import MainContent from "../MainContent";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkReadAllServers,
  thunkReadUserServers,
} from "../../../store/servers";
import { thunkGetChannels } from "../../../store/channels";
import CreateServerForm from "../../Servers/CreateServerForm";
import OpenModalButton from "../../OpenModalButton";

export default function ServerNav() {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  // const allServers = useSelector((state) => state.servers);
  const servers = useSelector((state) => state.servers.userServers);
  // console.log("User Servers 1", userServers);
  // console.log("ServerNav - servers:", allServers);
  // const servers = Object.values(allServers);
  // const servers = Object.values(userServers);
  // const [servers, setServers] = useState([]);
  const history = useHistory();

  useEffect(() => {
    // dispatch(thunkReadAllServers());
    dispatch(thunkReadUserServers())
      // .then((res) => {
      //   // console.log("USERSERVERS, ", servers);
      //   // setServers(res);
      // })
      .then(() => setLoaded(true));
  }, [dispatch]);

  const handleClick = async (serverId) => {
    console.log(serverId);
    const serverChannels = await dispatch(thunkGetChannels(serverId)).then(
      (res) =>
        res === "Server has no channels"
          ? history.push(`/channels/${serverId}/0`)
          : history.push(`/channels/${serverId}/${res[0].id}`)
    );
  };

  return (
    <div className="ServerNav-container">
      <div className="ServerNav-profile">
        <img src={avatar} className="ServerNav-icon" alt="server-icon" />
      </div>
      <div className="ServerNav-divider"></div>
      {/* // can probably map all the servers icon_url */}
      {servers.length &&
        loaded &&
        servers.map((server) => (
          <div
            className="ServerNav-server-icons"
            key={server.id}
            onClick={() => handleClick(server.id)}
          >
            <img
              src={server.icon_url}
              className="ServerNav-icon"
              alt="server-icon"
            />
          </div>
        ))}
      <div className="ServerNav-divider"></div>

      {/* <i className="fa-solid fa-plus"></i> */}
      <OpenModalButton
        buttonText="Create-Server"
        modalComponent={<CreateServerForm />}
        // onButtonClick={closeMenu}
      />

      <div className="ServerNav-icons">
        <i class="fa-solid fa-compass fa-lg"></i>
      </div>
    </div>
  );
}
