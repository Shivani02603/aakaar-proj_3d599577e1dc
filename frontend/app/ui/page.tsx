'use client';

import { useEffect, useState } from 'react';

interface UI {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function UIPage() {
  const [uis, setUis] = useState<UI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUis() {
      try {
        setLoading(true);
        const res = await fetch('/api/ui');
        if (!res.ok) throw new Error('Failed to fetch UIs');
        const data: UI[] = await res.json();
        setUis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchUis();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this UI?')) return;
    try {
      const res = await fetch(`/api/ui/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setUis(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete error');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">UIs</h1>
      <div className="mb-4">
        <a href="/ui/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          New UI
        </a>
      </div>
      {uis.length === 0 ? (
        <p className="text-gray-500">No UIs found.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Created At</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {uis.map(item => (
              <tr key={item.id} className="border-t">
                <td className="border p-2">{item.id}</td>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.description}</td>
                <td className="border p-2">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="border p-2 flex space-x-2">
                  <a
                    href={`/ui/${item.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}