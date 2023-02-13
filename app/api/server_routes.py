from flask import Flask, Blueprint, request
from flask_login import login_required, current_user
from app.models import db, Server, ServerMember, Channel
from app.forms import ServerForm


#  url_prefix="/api/servers
server_routes = Blueprint("servers", __name__)

# /api/servers/:servers/channel

# GET ALL SERVERS
@server_routes.route("/")
@login_required
def servers():
    servers = Server.query.all()
    return {"servers": [server.to_dict() for server in servers]}, 200

# GET SERVERS BY USER ID
@server_routes.route('/user')
@login_required
# def users_servers():
#      # get list of all the server memberships to the current user
#     user_memberships = current_user.server_memberships
#     if (len(user_memberships) > 0):
#         # looping through user_memberships to get that membership.server
#         servers = [membership.server for membership in user_memberships]
#         return {"servers": [server.to_dict() for server in servers]}, 200
#     else:
#         return {"errors": ["User has no servers"]}
def users_servers():
     # get list of all the server memberships to the current user
    user_memberships = current_user.server_memberships
    # print("Current User Memberships,", current_user.to_dict())
    # getting servers that the user owns
    user_owned_servers = Server.query.filter(Server.owner_id == current_user.id).all()
    # converting each server to dictionary
    user_servers = [server.to_dict() for server in user_owned_servers]
    # print('USER SERVERS', user_servers)
    # print("HELLO,", [membership.server.to_dict() for membership in user_memberships])
    # set and empty list
    servers = []
    # if the user owns server/s, then push to the servers list
    if (len(user_servers)):
        servers += user_servers
    # print("CONCAT", servers)
    # if the user is a member of any server, then also push to servers list
    if (len(user_memberships)):
        servers += [membership.server.to_dict() for membership in user_memberships]
    # print("CONCAT 2", servers)
    # if there are user servers, then return their servers
    if (len(servers)):
        # looping through user_memberships to get that membership.server
        # servers = [membership.server for membership in user_memberships]
        return {"servers": servers}, 200
    else:
        return {"errors": ["User has no servers"]}

# CREATE SERVER
@server_routes.route("/", methods=['POST'])
@login_required
def create_server():
    userId = int(current_user.id)
    form = ServerForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    if form.validate_on_submit():
        server = Server(
            name = form.data["name"],
            owner_id = int(current_user.id),
            icon_url = form.data["icon_url"],
            description = form.data["description"]
        )
        channel = Channel(
            name = "general",
            server_id = server.id,
            category = "Main",
            is_private = False
        )
        member = ServerMember(
            user_id = userId,
            server_id = server.id,
            nickname = current_user.username,
            role = "Owner"
        )
        db.session.add(server)
        db.session.add(channel)
        db.session.add(member)
        db.session.commit()
        return {"server": server.to_dict()}, 201
    return {"errors": ["Could not complete request"]}

# UPDATE SERVER
@server_routes.route("/<int:id>", methods=['PUT'])
@login_required
def update_server(id):
    form = ServerForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    server = Server.query.get(id)
    userId = int(current_user.id)
    if (userId != server.owner_id):
        return {"errors": ["Unauthorized"]}, 400
    if server:
        server.name = form.data["name"]
        server.icon_url = form.data["icon_url"]
        server.description = form.data["description"]

        db.session.commit()
        return {"server": server.to_dict()}


# DELETE SERVER
@server_routes.route("<int:id>", methods=['DELETE'])
@login_required
def delete_server(id):
    server = Server.query.get(id)
    userId = int(current_user.id)
    if (userId != server.owner_id):
        return {"errors": ["Unauthorized"]}, 400
    if server:
        db.session.delete(server)
        db.session.commit()
    return {"Response": ["Successfully deleted server."]}

# @server_routes.route("/<int:id>")
# @login_required
# def server(id):
#     data = Server.query.get(id)
#     return data.to_dict()
