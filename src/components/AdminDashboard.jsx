import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Course Form States
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseExams, setCourseExams] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseProfiles, setCourseProfiles] = useState('');

  // Modal State for Editing
  const [editingCourse, setEditingCourse] = useState(null);

  // Exam Form States
  const [examName, setExamName] = useState('');
  const [examCategory, setExamCategory] = useState('');
  const [examDesc, setExamDesc] = useState('');

  // Fetch Data on Mount
  useEffect(() => {
    fetchCourses();
    fetchExams();
    fetchUsers();
  }, []);

  const fetchCourses = () => {
    fetch('http://localhost:3010/api/courses')
      .then((res) => res.json())
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error fetching courses:', err));
  };

  const fetchExams = () => {
    fetch('http://localhost:3010/api/exams')
      .then((res) => res.json())
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error fetching exams:', err));
  };

  const fetchUsers = () => {
    // Corrected Endpoint URL to match server.js
    fetch('http://localhost:3010/api/admin/users')
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error fetching users:', err));
  };

  // Open Edit Modal
  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setCourseTitle(course.title || course.courseName || course.name || '');
    setCourseCategory(course.category || course.courseCategory || course.stream || course.type || '');
    setCourseDuration(course.duration || '');
    setCourseExams(Array.isArray(course.exams) ? course.exams.join(', ') : course.exams || '');
    setCourseDesc(course.description || '');
    setCourseProfiles(
      Array.isArray(course.jobRoles)
        ? course.jobRoles.join(', ')
        : Array.isArray(course.potentialProfiles)
        ? course.potentialProfiles.join(', ')
        : course.potentialProfiles || ''
    );
  };

  const handleCloseModal = () => {
    setEditingCourse(null);
    resetCourseForm();
  };

  const resetCourseForm = () => {
    setCourseTitle('');
    setCourseCategory('');
    setCourseDuration('');
    setCourseExams('');
    setCourseDesc('');
    setCourseProfiles('');
  };

  // Save or Update Course
  const handleCourseSubmit = (e) => {
    e.preventDefault();
    const coursePayload = {
      title: courseTitle,
      category: courseCategory,
      duration: courseDuration,
      exams: courseExams.split(',').map((item) => item.trim()).filter(Boolean),
      description: courseDesc,
      potentialProfiles: courseProfiles.split(',').map((item) => item.trim()).filter(Boolean),
    };

    const isEdit = !!editingCourse && editingCourse !== 'new';
    const url = isEdit
      ? `http://localhost:3010/api/courses/${editingCourse._id || editingCourse.id}`
      : 'http://localhost:3010/api/courses';

    fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coursePayload),
    })
      .then((res) => res.json())
      .then(() => {
        fetchCourses();
        handleCloseModal();
      })
      .catch((err) => console.error('Error saving course:', err));
  };

  // Delete Course
  const handleDeleteCourse = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      fetch(`http://localhost:3010/api/courses/${id}`, { method: 'DELETE' })
        .then(() => fetchCourses())
        .catch((err) => console.error('Error deleting course:', err));
    }
  };

  // Add Exam (With Category)
  const handleExamSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:3010/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: examName.toUpperCase().trim(),
        category: examCategory.trim(),
        description: examDesc,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchExams();
        setExamName('');
        setExamCategory('');
        setExamDesc('');
      })
      .catch((err) => console.error('Error adding exam:', err));
  };

  // Delete Exam
  const handleDeleteExam = (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      fetch(`http://localhost:3010/api/exams/${id}`, { method: 'DELETE' })
        .then(() => fetchExams())
        .catch((err) => console.error('Error deleting exam:', err));
    }
  };

  // Delete User
  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      fetch(`http://localhost:3010/api/admin/users/${id}`, { method: 'DELETE' })
        .then(() => fetchUsers())
        .catch((err) => console.error('Error deleting user:', err));
    }
  };

  // Live Filtered Courses
  const filteredCourses = courses.filter((c) => {
    const term = searchTerm.toLowerCase();
    const title = (c.title || c.courseName || c.name || '').toLowerCase();
    const category = (c.category || c.courseCategory || c.stream || c.type || '').toLowerCase();
    const examsStr = Array.isArray(c.exams) ? c.exams.join(' ').toLowerCase() : (c.exams || '').toLowerCase();

    return title.includes(term) || category.includes(term) || examsStr.includes(term);
  });

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '20px' }}>Admin Control Panel</h1>

      {/* Navigation Tabs */}
      <div style={tabRowStyle}>
        <button
          style={activeTab === 'courses' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('courses')}
        >
          Manage Courses ({courses.length})
        </button>
        <button
          style={activeTab === 'exams' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('exams')}
        >
          Manage Entrance Exams ({exams.length})
        </button>
        <button
          style={activeTab === 'users' ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab('users')}
        >
          Manage Users ({users.length})
        </button>
      </div>

      {/* ================= COURSES TAB ================= */}
      {activeTab === 'courses' && (
        <div>
          {/* Controls Header: Search & Add Button */}
          <div style={controlsHeaderStyle}>
            <input
              type="text"
              placeholder="🔍 Search courses by title, category, or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInputStyle}
            />
            <button style={primaryBtnStyle} onClick={() => setEditingCourse('new')}>
              + Add New Course
            </button>
          </div>

          {/* Courses Table */}
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={thStyle}>Course Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Exams Applicable</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr key={c._id || c.id} style={trStyle}>
                    <td style={{ ...tdStyle, fontWeight: '600' }}>{c.title || c.courseName || c.name}</td>
                    <td style={tdStyle}>{c.category || c.courseCategory || c.stream || c.type || 'N/A'}</td>
                    <td style={tdStyle}>{c.duration || 'N/A'}</td>
                    <td style={tdStyle}>
                      {Array.isArray(c.exams) ? c.exams.join(', ') : c.exams || 'N/A'}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button style={editBtnStyle} onClick={() => handleOpenEditModal(c)}>
                        Edit
                      </button>
                      <button style={deleteBtnStyle} onClick={() => handleDeleteCourse(c._id || c.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= EXAMS TAB ================= */}
      {activeTab === 'exams' && (
        <div>
          <form onSubmit={handleExamSubmit} style={cardFormStyle}>
            <h3 style={{ marginTop: 0 }}>Add New Entrance Exam</h3>
            
            <div style={formGroupStyle}>
              <label style={labelStyle}>Exam Acronym (e.g., CLAT, NEET, JEE)</label>
              <input
                style={inputStyle}
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Category (e.g., Legal Studies, Engineering, Medical)</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. Legal Studies, Engineering, Allied Health"
                value={examCategory}
                onChange={(e) => setExamCategory(e.target.value)}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={textareaStyle}
                value={examDesc}
                onChange={(e) => setExamDesc(e.target.value)}
                required
              />
            </div>

            <button style={primaryBtnStyle} type="submit">
              Add Exam
            </button>
          </form>

          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={thStyle}>Exam Name</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Description</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e._id || e.id} style={trStyle}>
                    <td style={{ ...tdStyle, fontWeight: '700' }}>{e.name}</td>
                    <td style={tdStyle}>{e.category || 'General'}</td>
                    <td style={tdStyle}>{e.description}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button style={deleteBtnStyle} onClick={() => handleDeleteExam(e._id || e.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= USERS TAB ================= */}
      {activeTab === 'users' && (
        <div>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Age</th>
                  <th style={thStyle}>Role</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id || u.id} style={trStyle}>
                      <td style={{ ...tdStyle, fontWeight: '600' }}>{u.name || u.username || 'User'}</td>
                      <td style={tdStyle}>{u.email || 'N/A'}</td>
                      <td style={tdStyle}>{u.age || 'N/A'}</td>
                      <td style={tdStyle}>
                        <span style={u.role === 'admin' ? adminBadgeStyle : userBadgeStyle}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <button style={deleteBtnStyle} onClick={() => handleDeleteUser(u._id || u.id)}>
                          Delete User
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No registered users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= EDIT / CREATE MODAL ================= */}
      {editingCourse && (
        <div style={modalBackdropStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>
              {editingCourse === 'new' ? '✨ Add New Course' : '✏️ Edit Course'}
            </h3>
            <form onSubmit={handleCourseSubmit}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Course Title</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Category</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Duration</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={courseDuration}
                  onChange={(e) => setCourseDuration(e.target.value)}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Exams Applicable (Comma Separated)</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={courseExams}
                  onChange={(e) => setCourseExams(e.target.value)}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={textareaStyle}
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Potential Profiles (Comma Separated)</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={courseProfiles}
                  onChange={(e) => setCourseProfiles(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" style={cancelBtnStyle} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" style={primaryBtnStyle}>
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================
const containerStyle = { padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' };
const tabRowStyle = { display: 'flex', gap: '10px', marginBottom: '25px' };
const tabStyle = { padding: '10px 20px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569' };
const activeTabStyle = { ...tabStyle, backgroundColor: '#4f46e5', color: '#fff', borderColor: '#4f46e5' };
const controlsHeaderStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '15px' };
const searchInputStyle = { flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' };
const primaryBtnStyle = { backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' };
const cancelBtnStyle = { backgroundColor: '#94a3b8', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' };
const tableWrapperStyle = { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' };
const tableHeaderStyle = { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' };
const thStyle = { padding: '14px 18px', color: '#475569', fontWeight: '700' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '14px 18px', color: '#334155' };
const editBtnStyle = { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' };
const deleteBtnStyle = { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' };
const cardFormStyle = { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' };
const formGroupStyle = { marginBottom: '15px' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' };
const textareaStyle = { ...inputStyle, minHeight: '80px', resize: 'vertical' };
const modalBackdropStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: '#fff', width: '100%', maxWidth: '600px', borderRadius: '16px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' };
const adminBadgeStyle = { backgroundColor: '#fef3c7', color: '#d97706', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '4px' };
const userBadgeStyle = { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '4px' };