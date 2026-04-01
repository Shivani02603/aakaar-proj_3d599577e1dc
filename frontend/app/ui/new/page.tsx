'use client';

import { useState } from 'react';

interface UIForm {
  name: string;
  description: string;
}

export default function NewUIPage() {
  const [form, setForm] = useState<UIForm>({ name: '', description: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof UIForm, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof UIForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof UIForm, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to create UI');
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/ui';
      }, 1500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Creation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">New UI</h1>
      {success && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">UI created successfully!</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded ${errors.description ? 'border-red-500' : ''}`}
            rows={4}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>
        <div className="flex items-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <a href="/ui" className="text-blue-600 hover:underline">
          ← Back to list
        </a>
      </div>
    </div>
  );
}
=== frontend/app/session mgmt/page.tsx ===
'use client';

import { useEffect, useState } from 'react';

interface SessionMgmt {
  id: string;
  userId: string;
  sessionData: string;
  createdAt: string;
}

export default function SessionMgmtPage() {
  const [sessions, setSessions] = useState<SessionMgmt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
       ass