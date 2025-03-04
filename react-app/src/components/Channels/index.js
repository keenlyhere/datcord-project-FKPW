import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import logo from "../../assets/datcord_logo_svg.svg";
import { thunkGetChannels } from "../../store/channels";
import OpenModalButton from "../OpenModalButton";
import CreateChannelForm from "./CreateChannelForm";
import EditDeleteChannelModal from "./EditDeleteChannelModal/dp-index";
import "./Channel.css";
import { Modal, useModal } from "../../context/Modal";
import EditChannelForm from "./EditDeleteChannelModal";
import EditServer from "../Servers/EditServer";
import DeleteServer from "../Servers/DeleteServer";
import { thunkGetServerMembers } from "../../store/serverMembers";
import { logout } from "../../store/session";
import { thunkReadUserServers } from "../../store/servers";

export default function Channels() {
	const { serverId, channelId } = useParams();
	const history = useHistory();
	//   console.log("Channels - serverId, channelId:", serverId, channelId);
	const dispatch = useDispatch();
	const user = useSelector((state) => state.session.user);
	// console.log("USER:", user);
	// const server = useSelector(state => state.servers)[+serverId]
	const allServers = useSelector((state) => state.servers);
	const server2 = allServers[serverId];
	// console.log("userServers=====", server2);
	const server = useSelector((state) => state.channels.server);
	// console.log("server we want:", server.find((thing) => thing.id === +serverId))
	// console.log("SERVER", server);
	let channels = Object.values(
		useSelector((state) => state.channels.channels)
	);
	// if (channels) channels = channels.channels
	const serverMembers = Object.values(
		useSelector((state) => state.serverMembers)
	);
	const serverMember = serverMembers.filter(
		(member) => member.user_id === user.id
	)[0];
	// console.log("channels - serverMembers", serverMember);
	const userSettingsRef = useRef();
	const [showMenu, setShowMenu] = useState(false);
	const [showUserMenu, setShowUserMenu] = useState(false);

	const openUserMenu = () => {
		if (showUserMenu) return;
		setShowUserMenu(true);
	};

	useEffect(() => {
		if (!showUserMenu) return;

		const closeMenu = (e) => {
			if (userSettingsRef.current) {
				if (!userSettingsRef.current.contains(e.target)) {
					setShowUserMenu(false);
				}
			}
		};

		document.addEventListener("click", closeMenu);

		return () => document.removeEventListener("click", closeMenu);
	}, [showUserMenu]);

	let serverMemberRole;

	let permissions;

	//   console.log(
	//     "SERVER_CHANNELS",
	//     channels.filter((channel) => channel.id === 1)
	//   );
	//   console.log("USER", user);
	const [isLoaded, setIsLoaded] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [showServerMenu, setShowServerMenu] = useState(false);
	const menuRef = useRef();

	// PETER'S SERVER DROP DOWN STUFF
	let isOwner;
	if (isLoaded) {
		isOwner = user.id == server.owner_id;
	}

	const openServerMenu = () => {
		if (showServerMenu) return;
		setShowServerMenu(true);
	};

	useEffect(() => {
		if (!showServerMenu) return;

		const closeServerMenu = (e) => {
			if (!menuRef.current.contains(e.target)) {
				setShowServerMenu(false);
			}
		};

		document.addEventListener("click", closeServerMenu);

		return () => document.removeEventListener("click", closeServerMenu);
	}, [showServerMenu]);

	const menuClassName =
		"server-menu-dropdown" + (showServerMenu ? "" : " hidden");

	//   console.log("show edit", showEdit);

	useEffect(() => {
		dispatch(thunkGetChannels(+serverId)).then(() => setIsLoaded(true));
	}, [dispatch, serverId, channelId]);

	const categories = {};

	if (!channels) return null;

	if (!server) return null;

	if (!serverMember) {
		return null;
	} else {
		serverMemberRole = serverMember.role;
	}

	// console.log("channels, servermemberrole", channels, serverMemberRole);
	if (serverMemberRole === "pending") {
		channels = channels.filter((channel) => channel.is_private === false);
	}

	// console.log("LINE 133 - CHANNELS >>>>>>>>>>>>>>>>", channels);

	if (serverMemberRole === "admin" || serverMemberRole === "owner") {
		// console.log("hit this");
		permissions = true;
	} else {
		permissions = false;
	}

	if (channels.length > 0) {
		for (let i = 0; i < channels.length; i++) {
			const channel = channels[i];

			if (!categories[channel.category]) {
				categories[channel.category] = [channel];
			} else {
				categories[channel.category].push(channel);
			}
		}
	}

	const truncateNames = (names) => {
		if (names.length > 18) {
			return `${names.substring(0, 18)}...`;
		}

		return names;
	};

	const closeMenu = () => setShowUserMenu(false);

	const goLogout = (e) => {
		e.preventDefault();

		closeMenu();
		dispatch(logout());
		history.push("/");
	};

	const userSettingsClass =
		"UserLanding-Sidebar-user-dropdown" + (showUserMenu ? "" : " hidden");

	const categoriesMap = Object.keys(categories).map((category, idx) => (
		<div className="UserLanding-Sidebar-category-container" key={idx}>
			<div className="UserLanding-sidebar-channel-category-container">
				<i className="fa-solid fa-angle-down"></i>
				<span className="UserLanding-sidebar-channel-category-name">
					{truncateNames(category)}
				</span>
				{permissions && (
					<OpenModalButton
						buttonText="Create-Channel"
						onButtonClick={closeMenu}
						modalComponent={
							<CreateChannelForm
								categoryName={category}
								serverId={serverId}
								role={serverMemberRole}
								isLoaded={isLoaded}
							/>
						}
					/>
				)}
			</div>
			<div className="UserLanding-sidebar-channel-list">
				{/* map out channels here */}
				{category &&
					channels.length > 0 &&
					categories[category].map((channel) => (
						// channel.is_private === false && serverMember.role === "member"
						<NavLink
							to={`/channels/${serverId}/${channel.id}`}
							className="UserLanding-sidebar-channel-name"
							key={channel.id}
						>
							<div className="UserLanding-sidebar-channel-name-label">
								<span className="hash">#</span>{" "}
								{channel.name && truncateNames(channel.name)}
							</div>
							{permissions && (
								<div className="UserLanding-sidebar-channel-buttons">
									<i className="fa-solid fa-user-plus"></i>
									{/* <NavLink to={`/channels/${serverId}/${channel.id}/edit`}>
                                        <i className="fa-solid fa-gear" onClick={() => setShowEdit(true)}></i>
                                    </NavLink> */}
									<OpenModalButton
										buttonText="Edit-Channel"
										onButtonClick={closeMenu}
										modalComponent={
											<EditChannelForm
												categoryName={category}
												prevName={channel.name}
												serverId={serverId}
												channelId={channel.id}
												priv={channel.is_private}
											/>
										}
									/>
								</div>
							)}
						</NavLink>
					))}
			</div>
		</div>
	));

	// console.log("CATEGORIES", categories)

	// if (!channels.length || !server) {
	// 	return (
	// 		<div className="UserLanding-sidebar">
	// 			<div className="UserLanding-sidebar-header">
	// 				{/* <p>{server.name}</p> */}
	// 				<i className="fa-solid fa-angle-down big-angle-down"></i>
	// 			</div>
	// 			<div className="UserLanding-sidebar-channel-content">
	// 				<div className="UserLanding-sidebar-channel-user-info">
	// 					<div className="UserLanding-sidebar-channel-user-container">
	// 						<div className="UserLanding-sidebar-channel-user-icons">
	// 							<img
	// 								src={logo}
	// 								className="UserLanding-sidebar-channel-user-icon"
	// 								alt="User profile image"
	// 							/>
	// 						</div>
	// 						<div className="UserLanding-sidebar-channel-user-name">
	// 							{user && user.username}
	// 						</div>
	// 					</div>
	// 					<div className="UserLanding-sidebar-channel-user-actions">
	// 						<i className="fa-solid fa-microphone"></i>
	// 						<i className="fa-solid fa-headphones"></i>
	// 						<i className="fa-solid fa-gear user-gear"></i>
	// 					</div>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	);
	// }

	if (isLoaded && server2) {
		return (
			<div className="UserLanding-sidebar">
				<div className="UserLanding-sidebar-header">
					<p>{server2.name}</p>
					{isOwner && (
						<>
							<div
								className="server-dropdown-button"
								onClick={openServerMenu}
							>
								<i className="fa-solid fa-angle-down big-angle-down"></i>
							</div>
							<div className={menuClassName} ref={menuRef}>
								<div className="dropdown-wrapper">
									<div className="server-dropdown-edit">
										{/* <span>Edit Server</span>
                    <span>
                      <i className="fa-solid fa-pencil"></i>
                    </span> */}
										<OpenModalButton
											buttonText="Edit-Server"
											modalComponent={
												<EditServer server={server2} />
											}
										/>
									</div>
									<div className="server-dropdown-delete">
										{/* <span>Delete Server</span>
                    <span>
                      <i className="fa-solid fa-trash"></i>
                    </span> */}
										<OpenModalButton
											buttonText="Delete-Server"
											modalComponent={
												<DeleteServer
													server={server2}
												/>
											}
										/>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
				<div className="UserLanding-sidebar-channel-content">
					{channels.length > 0 && categoriesMap.length ? (
						categoriesMap
					) : (
						<div className="UserLanding-sidebar-channel-category-container"></div>
					)}

					<div className="UserLanding-sidebar-channel-user-info">
						<div className="UserLanding-sidebar-channel-user-container">
							<div className="UserLanding-sidebar-channel-user-icons">
								<img
									src={user && user.display_pic}
									className="UserLanding-sidebar-channel-user-icon"
									alt="User profile image"
								/>
							</div>
							<div className="UserLanding-sidebar-channel-user-name">
								{user && user.username}
							</div>
						</div>
						<div className="UserLanding-sidebar-channel-user-actions">
							<i className="fa-solid fa-microphone"></i>
							<i className="fa-solid fa-headphones"></i>
							<i
								className="fa-solid fa-gear user-gear"
								onClick={openUserMenu}
							></i>
							<div
								className={userSettingsClass}
								ref={userSettingsRef}
							>
								<div className="dropdown-wrapper">
									<button
										className="UserLanding-sidebar-channel-user-home"
										onClick={() => history.push("/")}
									>
										Home
									</button>
									<button
										className="UserLanding-sidebar-channel-user-logout"
										onClick={goLogout}
									>
										Logout
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	} else return <div>Loading...</div>;
}
