import { useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
	actionResetChannelMessages,
	thunkReadAllChannelMessages,
} from "../../store/channelMessages";
import { thunkEditServerMember } from "../../store/serverMembers";
import "./NickNameEdit.css";

const NickNameEdit = ({
	member,
	onChange,
	serverId,
	endEditNickName,
	channelId,
}) => {
	let dispatch = useDispatch();
	let params = useParams();
	const [errors, setErrors] = useState([]);
	let [nickName, setnickName] = useState(member.nickname);

	const changeNickname = (e) => {
		e.preventDefault();
		member.nickname = nickName;

        // .then(() =>	dispatch(thunkReadAllChannelMessages(serverId, channelId)))
		dispatch(thunkEditServerMember(serverId, member.id, member))
			.catch(async (res) => {
				const data = await res.json();
				if (data && data.errors) setErrors(data.errors);
			});
		onChange(false);
		endEditNickName();
	};

	const cacnelChange = (e) => {
		e.preventDefault();
		endEditNickName();
	};

	return (
		<div className="edit-nickname-div">
			<form onSubmit={changeNickname} className="edit-nickname-form">
				<input
					value={nickName}
					onChange={(e) => setnickName(e.target.value)}
					className="nickname-input"
				/>
			</form>
			<div>
				<button
					type="submit"
					className="save-nickName-button"
					onClick={cacnelChange}
				>
					Cancel
				</button>
				<button
					type="submit"
					className="save-nickName-button"
					onClick={changeNickname}
				>
					Save
				</button>
			</div>
		</div>
	);
};

export default NickNameEdit;
