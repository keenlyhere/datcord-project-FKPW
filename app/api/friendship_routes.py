from flask import Blueprint, request
from flask_login import login_required, current_user
from .server_routes import server_routes
from app.models import db, Server, ServerMember, Friendship, User

# api/friends
friendship_routes = Blueprint("friendships", __name__)


# GET SERVER MEMBERS
# @friendship_routes.route("/<int:id>")
@friendship_routes.route("/")
@login_required
def all_friends():
    userId = int(current_user.id)

# THIS VERSION GETS THE DISPLAY PICS AND NICKNAMES
    user = User.query.get(current_user.id)
    friends1 = user.friendships
    friends2 = user.friendships2
    # friends2 = list(set(friends1 + friends2))
    friends = friends1 + friends2


#THIS VERSION GETS THE FRIENDSHIPS BOTH WAYS, 
# BUT DOESN'T GET DISPLAY PIC AND PASSWORD,
# AND ALSO BREAKS THE SHARED CHANNELS DIV
    # friends1 = Friendship.query.filter(Friendship.friend_id == userId).all()
    # friends2 = Friendship.query.filter(Friendship.user_id == userId).all()
    # friends = friends1 + friends2


    print("FRIENDSSS IN GET ROUTE --------->", friends)


    return {"friendships": [fr.to_dict() for fr in friends]}


# CREATE FRIENDSHIP
# @friendship_routes.route("/")
@friendship_routes.route("/", methods=["POST"])
@login_required
def add_friend():
    userId = int(current_user.id)
    newFriendId = request.json["memberId"]
    newFriend = User.query.get(newFriendId)
    newFriendship = Friendship (
        user_id = userId,
        friend_id = newFriendId,
        role = "pending"
    )
    # newFriendship2 = Friendship (
    #     user_id = userId,
    #     friend_id = newFriendId,
    #     role = "pending"
    # )
    db.session.add(newFriendship)
    # db.session.add(newFriendship2)
    db.session.commit()
    return {'friendship': newFriend.to_dict()}


# EDIT FRIENDSHIP
# @friendship_routes.route("/<int:id>")
@friendship_routes.route("/<int:id>", methods=["PUT"])
@login_required
def edit_friendship(id):
    userId = int(current_user.id)
    role = request.json["role"]
    friendship = Friendship.query.filter(Friendship.friend_id == userId, Friendship.user_id == id).all()
    friendship.role = role
    db.session.commit()
    return {'friendship': friendship.to_dict()}


# Delete FRIENDSHIP
# @friendship_routes.route("/<int:id>")
@friendship_routes.route("/<int:id>", methods=["DELETE"])
@login_required
def delete_friendship(id):
    userId = int(current_user.id)
    print("HITTING THE ROUTE --------->", id)

    friendship = Friendship.query.filter(Friendship.friend_id == id, Friendship.user_id == userId).all()
    friendship2 = Friendship.query.filter(Friendship.user_id == id, Friendship.user_id == id).all()
    # print("FRIENDSHIP IN ROUTE --------->", friendship)
    # print("FFRIENDSHIP IN ROUTE --------->", friendship2)
    if len(friendship):
        friendshipId = friendship[0].id
        temp = friendshipId
        db.session.delete(friendship[0])
        db.session.commit()
        return {'friendship': temp}
    if len(friendship2):
        friendshipId = friendship2[0].id
        temp = friendshipId
        db.session.delete(friendship2[0])
        db.session.commit()
        return {'friendship': temp}





# # EDIT SERVER MEMBER
# @server_routes.route("/<int:server_id>/membership/<int:member_id>", methods=['PUT'])
# @login_required
# def edit_server_member(server_id, member_id):
#     print("PRIIIIIIIINT", request.json)
#     nickname = request.json["serverMember"]['nickname']
#     role = request.json["serverMember"]['role']
#     userId = int(current_user.id)
#     server = Server.query.get(server_id)
#     membership = ServerMember.query.get(member_id)
#     if (membership == None):
#         return {"errors": ["Membership does not exist"]}, 404

#     if ( not server):
#         return {"errors": ["Server does not exist"]}, 404

#     if membership not in server.server_members:
#         return {"errors": ["This membership doesn't belong to this server"]}, 403

#     # if userId != server.owner_id and userId != membership.user_id:
#     #     return {"errors": ["User doesn't have the required permissions"]}, 403

#     else:
#         membership.nickname = nickname
#         membership.role = role
#         db.session.commit()
#         return {"server_member": membership.to_dict()}


# # DELETE MEMBER
# @server_routes.route("/<int:server_id>/membership/<int:member_id>", methods=['DELETE'])
# @login_required
# def delete_server_member(server_id, member_id):
#     userId = int(current_user.id)
#     server = Server.query.get(server_id)
#     membership = ServerMember.query.get(member_id)
#     permission = request.json['permission']
#     if (membership == None):
#         return {"errors": ["Membership does not exist"]}, 404
#     if (not server):
#         return {"errors": ["Server does not exist"]}, 404
#     if membership not in server.server_members:
#         return {"errors": ["This membership doesn't belong to this server"]}, 403
#     if permission == False:
#         return {"errors": ["User doesn't have the required permissions"]}, 403
#     else:
#         db.session.delete(membership)
#         db.session.commit()
#         return {"server_member": member_id}
