import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const FriendsPage = () => {
  const { user } = useAuth();

  // State management
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("friends"); // friends, requests, sent, search
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState(null);

  // Fetch friends data
  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/friends", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data.received || []);
        setSentRequests(data.sent || []);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  // Search users
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  // Send friend request
  const sendFriendRequest = async (userId) => {
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        // Update search results to show request sent
        setSearchResults((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, requestSent: true } : user
          )
        );
        fetchFriendRequests();
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (userId) => {
    try {
      const response = await fetch("/api/friends/accept", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        fetchFriends();
        fetchFriendRequests();
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  // Decline friend request
  const declineFriendRequest = async (userId) => {
    try {
      const response = await fetch("/api/friends/decline", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        fetchFriendRequests();
      }
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  // Cancel sent request
  const cancelSentRequest = async (userId) => {
    try {
      const response = await fetch("/api/friends/cancel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        fetchFriendRequests();
      }
    } catch (error) {
      console.error("Error canceling friend request:", error);
    }
  };

  // Remove friend
  const removeFriend = async (userId) => {
    try {
      const response = await fetch(`/api/friends/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        fetchFriends();
        setShowDeleteModal(false);
        setFriendToDelete(null);
      }
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (activeTab === "search") {
        searchUsers();
      }
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery, activeTab]);

  const TabButton = ({ tabKey, children, count = null }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabKey
          ? "bg-indigo-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {children}
      {count !== null && count > 0 && (
        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  const UserCard = ({ user, actions }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div
          className={`w-3 h-3 rounded-full mr-3 ${
            user.isOnline ? "bg-green-400" : "bg-gray-400"
          }`}
        ></div>
        <div>
          <h3 className="font-medium text-gray-900">{user.username}</h3>
          <p className="text-sm text-gray-500">
            Rating: {user.rating || "Unrated"}
          </p>
          {user.lastSeen && (
            <p className="text-xs text-gray-400">
              Last seen: {new Date(user.lastSeen).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex space-x-2">{actions}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pl-64">
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Friends Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your friends, requests, and find new players
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <TabButton tabKey="friends">My Friends ({friends.length})</TabButton>
          <TabButton tabKey="requests" count={friendRequests.length}>
            Friend Requests
          </TabButton>
          <TabButton tabKey="sent">
            Sent Requests ({sentRequests.length})
          </TabButton>
          <TabButton tabKey="search">Find Friends</TabButton>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {/* My Friends Tab */}
          {activeTab === "friends" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Friends</h2>
                <div className="text-sm text-gray-500">
                  {friends.filter((f) => f.isOnline).length} online,{" "}
                  {friends.length} total
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No friends yet. Start by searching for players!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <UserCard
                      key={friend.id}
                      user={friend}
                      actions={
                        <>
                          <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                            Challenge
                          </button>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                            Message
                          </button>
                          <button
                            onClick={() => {
                              setFriendToDelete(friend);
                              setShowDeleteModal(true);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Remove
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Friend Requests Tab */}
          {activeTab === "requests" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>

              {friendRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending friend requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <UserCard
                      key={request.id}
                      user={request}
                      actions={
                        <>
                          <button
                            onClick={() => acceptFriendRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => declineFriendRequest(request.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Decline
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sent Requests Tab */}
          {activeTab === "sent" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Sent Requests</h2>

              {sentRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending sent requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <UserCard
                      key={request.id}
                      user={request}
                      actions={
                        <button
                          onClick={() => cancelSentRequest(request.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel Request
                        </button>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Find Friends Tab */}
          {activeTab === "search" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Find Friends</h2>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {searchResults.length === 0 && searchQuery ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No users found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      actions={
                        user.isFriend ? (
                          <span className="text-green-600 text-sm font-medium">
                            Already Friends
                          </span>
                        ) : user.requestSent ? (
                          <span className="text-gray-600 text-sm font-medium">
                            Request Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Add Friend
                          </button>
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Remove Friend</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove{" "}
                <strong>{friendToDelete?.username}</strong> from your friends
                list?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => removeFriend(friendToDelete?.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
