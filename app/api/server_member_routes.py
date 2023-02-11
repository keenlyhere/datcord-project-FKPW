from flask import Blueprint, request
from flask_login import login_required, current_user
from .server_routes import server_routes
from app.models import db, Server, ServerMember

#  url_prefix="/api/sms

server_member_routes = Blueprint("server_members", __name__)

@server_routes.route("/<int:server_id>/members")
@login_required
def all_server_members(server_id):
    server = Server.query.get(server_id)
    print("SERVER PRINT ------->",server)
    if (server):
        members = [member.to_dict() for member in server.server_members]
        if (len(members) > 0):
            return {'server_members': members}
        else:
            return {"server_members": 'No current members in this server'}
    else:
        return {"errors": ["Server does not exist"]}


@server_routes.route("/<int:server_id>/members", methods=['POST'])
@login_required
def add_server_member(server_id):
    userId = int(current_user.id)
    server = Server.query.get(server_id)
    if (server):
        memberIds = [member.user_id for member in server.server_members]
        if userId in memberIds:
            return {"errors": ["This user is already in the server"]}
        else:
            new_user = ServerMember(
                user_id=userId,
                server_id=server_id,
                nickname = current_user.username,
                role = "member"
                )
            db.session.add(new_user)
            db.session.commit()
            return {'server_member': new_user.to_dict()}
    else:
        return {"errors": ["Server does not exist"]}



@server_routes.route("/<int:server_id>/membership/<int:member_id>", methods=['PUT'])
@login_required
def edit_server_member(server_id, member_id):
    nickname = request.json['nickname']
    role = request.json['role']
    userId = int(current_user.id)
    server = Server.query.get(server_id)
    membership = ServerMember.query.get(member_id)
    if (membership == None):
        return {"errors": ["Membership does not exist"]}
    if (server):
        if membership not in server.server_members:
            return {"errors": ["This membership doesn't belong to this server"]}
        if userId != server.owner_id and userId != membership.user_id:
            return {"errors": ["User doesn't have the required permissions"]}
        else:
            membership.nickname = nickname
            membership.role = role
            db.session.commit()
            return {"server_member": membership.to_dict()}
    else:
        return {"errors": ["Server does not exist"]}


@server_routes.route("/<int:server_id>/membership/<int:member_id>", methods=['DELETE'])
@login_required
def delete_server_member(server_id, member_id):
    userId = int(current_user.id)
    server = Server.query.get(server_id)
    print("PRIIIIIINT ------->", server)
    membership = ServerMember.query.get(member_id)
    if (membership == None):
        return {"errors": ["Membership does not exist"]}
    if (server):
        if membership not in server.server_members:
            return {"errors": ["This membership doesn't belong to this server"]}
        if userId != server.owner_id and userId != membership.user_id:
            return {"errors": ["User doesn't have the required permissions"]}
        else:
            db.session.delete(membership)
            db.session.commit()
            return {"server_member": "successfully deleted"}
    else:
        return {"errors": ["Server does not exist"]}
