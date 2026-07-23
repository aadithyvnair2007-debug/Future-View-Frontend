import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'courses' | 'users'

  // Exam Form state
  const [examName, setExamName] = useState('');
  const [examCategory, setExamCategory] = useState('');
  const [examDescription, setExamDescription] = useState('');

  // Course Form state (Add & Edit)
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseExams, setCourseExams] = useState('');

  // Data states
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch initial data from backend
  const fetchData = () => {
    fetch('http://localhost:3010/api/exams')
      .then(res => res.json())
      .then(data => setExams(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching exams:", err));

    fetch('http://localhost:3010/api/courses')
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching courses:", err));

    fetch('http://localhost:3010/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching users:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= EXAM ACTIONS =================
  const handleAddExam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3010/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: examName.toUpperCase(), category: examCategory, description: examDescription })
      });
      if (res.ok) {
        setExamName('');
        setExamCategory('');
        setExamDescription('');
        fetchData();
      } else {
        alert("Failed to add exam");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Delete this entrance exam?')) return;
    try {
      const res = await fetch(`http://localhost:3010/api/exams/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= COURSE ACTIONS (CREATE & UPDATE) =================
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const examArray = courseExams.split(',').map(e => e.trim().toUpperCase()).filter(Boolean);

    const payload = { 
      title: courseTitle, 
      category: courseCategory, 
      duration: courseDuration, 
      exams: examArray 
    };

    try {
      const isEditing = Boolean(editingCourseId);
      const url = isEditing 
        ? `http://localhost:3010/api/courses/${editingCourseId}`
        : 'http://localhost:3010/api/courses';

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        resetCourseForm();
        fetchData();
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'add'} course`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEditCourse = (course) => {
    setEditingCourseId(course._id || course.id);
    setCourseTitle(course.title || course.courseName || '');
    setCourseCategory(course.category || '');
    setCourseDuration(course.duration || '');
    setCourseExams(Array.isArray(course.exams) ? course.exams.join(', ') : (course.exams || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetCourseForm = () => {
    setEditingCourseId(null);
    setCourseTitle('');
    setCourseCategory('');
    setCourseDuration('');
    setCourseExams('');
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      const res = await fetch(`http://localhost:3010/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (editingCourseId === id) resetCourseForm();
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= USER ACTIONS =================
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this registered user?')) return;
    try {
      const res = await fetch(`http://localhost:3010/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Admin Control Panel</h2>

        {/* ================= TABS ================= */}
        <div style={tabContainerStyle}>
          <button 
            type="button"
            style={activeTab === 'exams' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('exams')}
          >
            Manage Entrance Exams ({exams.length})
          </button>
          <button 
            type="button"
            style={activeTab === 'courses' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('courses')}
          >
            Manage Courses ({courses.length})
          </button>
          <button 
            type="button"
            style={activeTab === 'users' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('users')}
          >
            Manage Users ({users.length})
          </button>
        </div>

        {/* ================= TAB 1: EXAMS ================= */}
        {activeTab === 'exams' && (
          <div>
            <div style={formCardStyle}>
              <h3 style={formTitleStyle}>Add New Entrance Exam</h3>
              <form onSubmit={handleAddExam} style={formStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Exam Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CUET, JEE, KEAM" 
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Category</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Engineering, Law, Medical" 
                    value={examCategory}
                    onChange={e => setExamCategory(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Description</label>
                  <textarea 
                    placeholder="Brief description of the entrance exam..." 
                    value={examDescription}
                    onChange={e => setExamDescription(e.target.value)}
                    rows="3"
                    required
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <button type="submit" style={btnPrimaryStyle}>+ Add Entrance Exam</button>
              </form>
            </div>

            <h3 style={sectionHeadingStyle}>Active Entrance Exams</h3>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Exam Name</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.length > 0 ? (
                  exams.map((item) => (
                    <tr key={item._id || item.id} style={trStyle}>
                      <td style={{ ...tdStyle, fontWeight: '700' }}>{item.name}</td>
                      <td style={tdStyle}>{item.category || 'General'}</td>
                      <td style={tdStyle}>{item.description}</td>
                      <td style={tdStyle}>
                        <button type="button" onClick={() => handleDeleteExam(item._id || item.id)} style={btnDeleteStyle}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={emptyTdStyle}>No entrance exams found in database. Add one above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 2: COURSES ================= */}
        {activeTab === 'courses' && (
          <div>
            <div style={formCardStyle}>
              <h3 style={formTitleStyle}>
                {editingCourseId ? '✏️ Edit Course Information' : '+ Add New Course'}
              </h3>
              <form onSubmit={handleSaveCourse} style={formStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Course Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. B.Tech Computer Science" 
                    value={courseTitle}
                    onChange={e => setCourseTitle(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Category</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Engineering & Technology" 
                    value={courseCategory}
                    onChange={e => setCourseCategory(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Duration</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 4 Years" 
                    value={courseDuration}
                    onChange={e => setCourseDuration(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Exams Applicable (Comma Separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. JEE, KEAM" 
                    value={courseExams}
                    onChange={e => setCourseExams(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={editingCourseId ? btnWarningStyle : btnPrimaryStyle}>
                    {editingCourseId ? 'Update Course' : '+ Add Course'}
                  </button>
                  {editingCourseId && (
                    <button type="button" onClick={resetCourseForm} style={btnSecondaryStyle}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <h3 style={sectionHeadingStyle}>Course Directory ({courses.length})</h3>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Course Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Exam Pathway</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <tr key={c._id || c.id} style={trStyle}>
                      <td style={{ ...tdStyle, fontWeight: '600' }}>{c.title || c.courseName || c.name}</td>
                      <td style={tdStyle}>{c.category || 'N/A'}</td>
                      <td style={tdStyle}>{c.duration || 'N/A'}</td>
                      <td style={tdStyle}>{Array.isArray(c.exams) ? c.exams.join(', ') : (c.exams || 'General')}</td>
                      <td style={{ ...tdStyle, display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={() => handleStartEditCourse(c)} style={btnEditStyle}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDeleteCourse(c._id || c.id)} style={btnDeleteStyle}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={emptyTdStyle}>No courses found in database. Add one above!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 3: USERS ================= */}
        {activeTab === 'users' && (
          <div>
            <h3 style={sectionHeadingStyle}>Registered Users ({users.length})</h3>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Age</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id || u.id} style={trStyle}>
                      <td style={{ ...tdStyle, fontWeight: '600' }}>{u.name}</td>
                      <td style={tdStyle}>{u.email}</td>
                      <td style={tdStyle}>{u.age || 'N/A'}</td>
                      <td style={tdStyle}>
                        <span style={u.role === 'admin' ? adminBadgeStyle : userBadgeStyle}>
                          {u.role || 'User'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button type="button" onClick={() => handleDeleteUser(u._id || u.id)} style={btnDeleteStyle}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={emptyTdStyle}>No registered users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

// ================= STYLES =================
const containerStyle = { backgroundColor: '#f1f5f9', minHeight: 'calc(100vh - 65px)', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' };
const cardStyle = { backgroundColor: '#ffffff', maxWidth: '1000px', margin: '0 auto', padding: '35px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' };
const titleStyle = { fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '25px' };

const tabContainerStyle = { display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' };
const tabStyle = { backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
const activeTabStyle = { backgroundColor: '#2563eb', border: '1px solid #2563eb', color: '#ffffff', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' };

const formCardStyle = { backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' };
const formTitleStyle = { fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '18px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '16px' };
const inputGroupStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#475569' };
const inputStyle = { padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a' };

const btnPrimaryStyle = { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginTop: '6px' };
const btnWarningStyle = { backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginTop: '6px' };
const btnSecondaryStyle = { backgroundColor: '#64748b', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', marginTop: '6px' };

const sectionHeadingStyle = { marginTop: '20px', color: '#1e293b', fontSize: '18px', fontWeight: '700', marginBottom: '15px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRowStyle = { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#475569', fontWeight: '700' };
const trStyle = { borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '14px 16px', fontSize: '14px', color: '#1e293b' };
const emptyTdStyle = { textAlign: 'center', padding: '25px', color: '#64748b', fontSize: '14px' };

const btnEditStyle = { backgroundColor: '#0ea5e9', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' };
const btnDeleteStyle = { backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' };

const adminBadgeStyle = { backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' };
const userBadgeStyle = { backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' };