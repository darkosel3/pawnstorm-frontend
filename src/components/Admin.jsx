import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const AdminPanel = () => {
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState("users"); // users, games, friends, stats
  const [loading, setLoading] = useState(false);

  // Users management
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    rating: 1200,
    role: "user",
    status: "active",
  });

  // Games management
  const [games, setGames] = useState([]);
  const [gameFilters, setGameFilters] = useState({
    status: "all",
    gameType: "all",
    dateFrom: "",
    dateTo: "",
  });

  // Friends management
  const [friendRequests, setFriendRequests] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGames: 0,
    completedGames: 0,
    pendingRequests: 0,
  });

  // Fetch data functions
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (gameFilters.status !== "all")
        queryParams.append("status", gameFilters.status);
      if (gameFilters.gameType !== "all")
        queryParams.append("type", gameFilters.gameType);
      if (gameFilters.dateFrom)
        queryParams.append("from", gameFilters.dateFrom);
      if (gameFilters.dateTo) queryParams.append("to", gameFilters.dateTo);

      const response = await fetch(`/api/admin/games?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch("/api/admin/friend-requests", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // User CRUD operations
  const handleSaveUser = async () => {
    const url = editingUser
      ? `/api/admin/users/${editingUser.id}`
      : "/api/admin/users";
    const method = editingUser ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        fetchUsers();
        setShowUserModal(false);
        setEditingUser(null);
        setUserForm({
          username: "",
          email: "",
          rating: 1200,
          role: "user",
          status: "active",
        });
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleBanUser = async (userId, action) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
    }
  };

  // Game management
  const handleDeleteGame = async (gameId) => {
    if (!window.confirm("Are you sure you want to delete this game?")) return;

    try {
      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  // Friend request management
  const handleFriendRequest = async (requestId, action) => {
    try {
      const response = await fetch(
        `/api/admin/friend-requests/${requestId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        fetchFriendRequests();
      }
    } catch (error) {
      console.error(`Error ${action} friend request:`, error);
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "games") fetchGames();
    if (activeTab === "friends") fetchFriendRequests();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "games") {
      fetchGames();
    }
  }, [gameFilters]);

  const TabButton = ({ tabKey, children, icon }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabKey
          ? "bg-indigo-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      <span className="mr-2">{icon}</span>
      {children}
    </button>
  );
  //
  // if (!user?.isAdmin) {
  //     return (
  //         <div className="min-h-screen bg-gray-50 pl-64 flex items-center justify-center">
  //             <div className="text-center">
  //                 <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
  //                 <p className="text-gray-600">You don't have admin privileges to access this page.</p>
  //             </div>
  //         </div>
  //     );
  // }

  return (
    <div className="min-h-screen bg-gray-50 pl-64">
      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">
            Manage users, games, and system settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.totalUsers}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.activeUsers}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalGames}
            </div>
            <div className="text-sm text-gray-600">Total Games</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {stats.completedGames}
            </div>
            <div className="text-sm text-gray-600">Completed Games</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingRequests}
            </div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <TabButton tabKey="users" icon="👥">
            Users
          </TabButton>
          <TabButton tabKey="games" icon="♟️">
            Games
          </TabButton>
          <TabButton tabKey="friends" icon="🤝">
            Friend Requests
          </TabButton>
          <TabButton tabKey="stats" icon="📊">
            Statistics
          </TabButton>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Users Management */}
          {activeTab === "users" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Users Management</h2>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setUserForm({
                      username: "",
                      email: "",
                      rating: 1200,
                      role: "user",
                      status: "active",
                    });
                    setShowUserModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                  Add New User
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Username</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Rating</th>
                        <th className="px-4 py-2 text-left">Role</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Joined</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t">
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <div
                                className={`w-2 h-2 rounded-full mr-2 ${
                                  user.isOnline ? "bg-green-400" : "bg-gray-400"
                                }`}
                              ></div>
                              {user.username}
                            </div>
                          </td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">{user.rating}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                user.role === "admin"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setUserForm({
                                    username: user.username,
                                    email: user.email,
                                    rating: user.rating,
                                    admin_type: user.admin_type,
                                    status: user.status,
                                  });
                                  setShowUserModal(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                              >
                                Edit
                              </button>
                              {user.status === "active" ? (
                                <button
                                  onClick={() => handleBanUser(user.id, "ban")}
                                  className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
                                >
                                  Ban
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleBanUser(user.id, "unban")
                                  }
                                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                >
                                  Unban
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Games Management */}
          {activeTab === "games" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Games Management</h2>

                {/* Filters */}
                <div className="flex space-x-4">
                  <select
                    value={gameFilters.status}
                    onChange={(e) =>
                      setGameFilters({ ...gameFilters, status: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="abandoned">Abandoned</option>
                  </select>

                  <input
                    type="date"
                    value={gameFilters.dateFrom}
                    onChange={(e) =>
                      setGameFilters({
                        ...gameFilters,
                        dateFrom: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  />

                  <input
                    type="date"
                    value={gameFilters.dateTo}
                    onChange={(e) =>
                      setGameFilters({ ...gameFilters, dateTo: e.target.value })
                    }
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Game ID</th>
                        <th className="px-4 py-2 text-left">Players</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Duration</th>
                        <th className="px-4 py-2 text-left">Created</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.map((game) => (
                        <tr key={game.id} className="border-t">
                          <td className="px-4 py-2">#{game.id}</td>
                          <td className="px-4 py-2">
                            <div>
                              <div>{game.white_player} (White)</div>
                              <div>{game.black_player} (Black)</div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                game.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : game.status === "active"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {game.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {game.duration || "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            {new Date(game.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  window.open(`/game/${game.id}`, "_blank")
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteGame(game.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Friend Requests Management */}
          {activeTab === "friends" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Friend Requests Management
              </h2>

              {friendRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending friend requests
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">From</th>
                        <th className="px-4 py-2 text-left">To</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {friendRequests.map((request) => (
                        <tr key={request.id} className="border-t">
                          <td className="px-4 py-2">{request.from_user}</td>
                          <td className="px-4 py-2">{request.to_user}</td>
                          <td className="px-4 py-2">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleFriendRequest(request.id, "approve")
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleFriendRequest(request.id, "reject")
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Statistics */}
          {activeTab === "stats" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">System Statistics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">User Activity</h3>
                  <div className="text-sm text-gray-600">
                    <div>Online: {stats.activeUsers}</div>
                    <div>Total: {stats.totalUsers}</div>
                    <div>
                      Retention:{" "}
                      {((stats.activeUsers / stats.totalUsers) * 100).toFixed(
                        1
                      )}
                      %
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Game Activity</h3>
                  <div className="text-sm text-gray-600">
                    <div>Total Games: {stats.totalGames}</div>
                    <div>Completed: {stats.completedGames}</div>
                    <div>
                      Completion Rate:{" "}
                      {(
                        (stats.completedGames / stats.totalGames) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Social Activity</h3>
                  <div className="text-sm text-gray-600">
                    <div>Pending Requests: {stats.pendingRequests}</div>
                    <div>
                      Avg Friends/User:{" "}
                      {stats.totalUsers > 0
                        ? (stats.totalUsers * 2.5).toFixed(1)
                        : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingUser ? "Edit User" : "Add New User"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm({ ...userForm, username: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <input
                  type="number"
                  value={userForm.rating}
                  onChange={(e) =>
                    setUserForm({
                      ...userForm,
                      rating: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={userForm.status}
                  onChange={(e) =>
                    setUserForm({ ...userForm, status: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
              >
                {editingUser ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
