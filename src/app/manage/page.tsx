'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  name?: string | null;
  email: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'waiter' });
  const [loading, setLoading] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    const res = await fetch('/api/admin/update-role');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add or update a user
  const handleAddOrUpdate = async () => {
    if (!newUser.email || !newUser.role) return alert("Email and role are required");

    setLoading(true);
    const res = await fetch('/api/admin/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    setLoading(false);

    if (res.ok) {
      const user = await res.json();
      setUsers(prev => {
        const exists = prev.find(u => u.id === user.id);
        if (exists) return prev.map(u => u.id === user.id ? user : u);
        return [...prev, user];
      });
      setNewUser({ name: '', email: '', role: 'waiter' });
    } else {
      alert('Failed to add/update user');
    }
  };

  // Update role for existing users
  const handleRoleChange = async (userId: string, role: string) => {
    const res = await fetch('/api/admin/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });

    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } else {
      alert('Failed to update role');
    }
  };

  const handleDelete = async (userId: string) => {
    const res = await fetch('/api/admin/update-role', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    } else {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hire New User */}
      <div className="p-4 border rounded-md shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Hire New User</h2>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="border px-2 py-1 rounded-md flex-1"
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="border px-2 py-1 rounded-md flex-1"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="border-gray-700 px-2 py-1 rounded-md bg-gray-700"
          >
            <option value="waiter">Waiter</option>
            <option value="chef">Chef</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleAddOrUpdate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md"
            disabled={loading}
          >
            {loading ? "Processing..." : "Add / Update"}
          </button>
        </div>
      </div>

      {/* Existing Users */}
      <div className="p-4 border rounded-md shadow-sm space-y-2">
        <h2 className="text-xl font-semibold">Existing Users</h2>
        {users.length === 0 && <p className="text-gray-500">No users found.</p>}
        {users.map(user => (
          <div
            key={user.id}
            className="flex items-center justify-between p-2 border rounded-md"
          >
            <div>
              <p className="font-medium">{user.name || 'No Name'}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
            <div>
              <button
              onClick={() => handleDelete(user.id)}
              className="  text-red-600 hover:text-red-800 cursor-pointer px-4 py-1 rounded-md"
            >
              X
            </button>
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
              className="border-gray-700 px-2 py-1 rounded-md bg-gray-700"
            >
              <option value="user">User</option>
              <option value="waiter">Waiter</option>
              <option value="chef">Chef</option>
              <option value="admin">Admin</option>
            </select>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
