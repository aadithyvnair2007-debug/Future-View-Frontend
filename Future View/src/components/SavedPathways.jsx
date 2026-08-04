import React, { useState, useEffect } from 'react';

const API_BASE = 'https://future-view.onrender.com';

export default function SavedPathways({ currentUser, onOpenAuth }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    apiFetch(`${API_BASE}/api/users/${userId}/bookmarks`)
      .then((res) => res.json())
      .then((data) => {
        setBookmarks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching bookmarks:', err);
        setLoading(false);
      });
  }, [userId]);

  const handleRemoveBookmark = (itemId) => {
    apiFetch(`${API_BASE}/api/users/${userId}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.bookmarks) setBookmarks(data.bookmarks);
      })
      .catch((err) => console.error('Error removing bookmark:', err));
  };

  if (!currentUser) {
    return (
      <div style={containerStyle}>
        <div style={emptyCardStyle}>
          <h2>🔒 Login Required</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            Please log in or register to view and save your favorite degree pathways and entrance exams.
          </p>
          <button style={primaryBtnStyle} onClick={onOpenAuth}>
            Login / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>
          ⭐ Your Saved Pathways
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Quick access to all the courses and entrance exams you've bookmarked.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748b' }}>Loading saved pathways...</div>
      ) : bookmarks.length > 0 ? (
        <div style={gridStyle}>
          {bookmarks.map((item) => (
            <div key={item.itemId} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={typeBadgeStyle}>{item.type || 'Course'}</span>
                <button style={removeBtnStyle} onClick={() => handleRemoveBookmark(item.itemId)}>
                  ✕ Remove
                </button>
              </div>

              <h3 style={{ margin: '12px 0 6px 0', fontSize: '18px', color: '#0f172a' }}>
                {item.title}
              </h3>

              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Category: <strong>{item.category || 'General'}</strong>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div style={emptyCardStyle}>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            You haven't bookmarked any pathways yet. Explore courses or entrance exams and click ⭐ to save them here!
          </p>
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================
const containerStyle = { maxWidth: '1000px', margin: '30px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const typeBadgeStyle = { backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' };
const removeBtnStyle = { backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' };
const emptyCardStyle = { backgroundColor: '#fff', borderRadius: '12px', border: '2px dashed #cbd5e1', padding: '50px 20px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' };
const primaryBtnStyle = { backgroundColor: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' };