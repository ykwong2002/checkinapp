import React, { useEffect, useState } from 'react';

function AdminPanel() {
  const [attendees, setAttendees] = useState([]);
  const [error, setError] = useState(null);

  const fetchAttendees = async () => {
    try {
      const res = await fetch('/api/attendees');
      const data = await res.json();
      setAttendees(data);
    } catch (err) {
      setError('Failed to fetch attendees');
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...attendees];
    updated[index][field] = value;
    setAttendees(updated);
  };

  const handleUpdate = async (attendee) => {
    try {
      const res = await fetch(`/api/attendees/${attendee.queue_number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: attendee.name,
          queue_number: attendee.queue_number,
          key_ready: attendee.key_ready,
          key_collected: attendee.key_collected,
        }),
      });
      if (!res.ok) throw new Error('Update failed');
      fetchAttendees();
    } catch (err) {
      setError('Failed to update attendee');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Panel</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Queue Number</th>
              <th className="px-4 py-2 border-b">Key Ready</th>
              <th className="px-4 py-2 border-b">Key Collected</th>
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((a, idx) => (
              <tr key={a.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b">
                  <input
                    className="border rounded px-2 py-1 w-32"
                    value={a.name}
                    onChange={e => handleChange(idx, 'name', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2 border-b">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-20"
                    value={a.queue_number}
                    onChange={e => handleChange(idx, 'queue_number', Number(e.target.value))}
                  />
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <input
                    type="checkbox"
                    checked={!!a.key_ready}
                    onChange={e => handleChange(idx, 'key_ready', e.target.checked ? 1 : 0)}
                  />
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <input
                    type="checkbox"
                    checked={!!a.key_collected}
                    onChange={e => handleChange(idx, 'key_collected', e.target.checked ? 1 : 0)}
                  />
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => handleUpdate(a)}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel; 