import React, { useState, useEffect } from 'react';

export default function CourseCompare() {
  const [allCourses, setAllCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  const [selectedIds, setSelectedIds] = useState(['', '', '']);
  const [comparedCourses, setComparedCourses] = useState([null, null, null]);

  useEffect(() => {
    fetch('http://localhost:3010/api/courses')
      .then((res) => res.json())
      .then((data) => {
        const courseList = Array.isArray(data) ? data : [];
        setAllCourses(courseList);

        // Extract unique categories dynamically from database
        const uniqueCategories = Array.from(
          new Set(
            courseList
              .map((c) => c.category || c.courseCategory || c.stream || c.type)
              .filter(Boolean)
          )
        );
        setCategories(uniqueCategories);
      })
      .catch((err) => console.error('Error fetching courses for comparison:', err));
  }, []);

  // Filter courses based on selected category
  const filteredCourses = selectedCategory === 'ALL'
    ? allCourses
    : allCourses.filter((c) => {
        const cat = c.category || c.courseCategory || c.stream || c.type;
        return cat?.toLowerCase() === selectedCategory.toLowerCase();
      });

  // Reset selections if user changes category
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedIds(['', '', '']);
  };

  // Update compared course objects whenever dropdown selections change
  useEffect(() => {
    const updated = selectedIds.map((id) => {
      if (!id) return null;
      return allCourses.find((c) => (c._id || c.id) === id) || null;
    });
    setComparedCourses(updated);
  }, [selectedIds, allCourses]);

  const handleSelectChange = (index, value) => {
    const updated = [...selectedIds];
    updated[index] = value;
    setSelectedIds(updated);
  };

  const handleClear = (index) => {
    const updated = [...selectedIds];
    updated[index] = '';
    setSelectedIds(updated);
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>
          ⚖️ Side-by-Side Course Comparison
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Filter by category first, then select up to 3 courses to compare side-by-side.
        </p>
      </div>

      {/* CATEGORY FILTER BAR */}
      <div style={categoryFilterContainerStyle}>
        <label style={categoryLabelStyle}>🏷️ Filter Courses by Category:</label>
        <select
          style={categorySelectStyle}
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="ALL">All Categories ({allCourses.length} Courses)</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Comparison Grid Table */}
      <div style={gridStyle}>
        {[0, 1, 2].map((slotIndex) => {
          const course = comparedCourses[slotIndex];

          return (
            <div key={slotIndex} style={columnCardStyle}>
              {/* Header Dropdown */}
              <div style={selectHeaderStyle}>
                <label style={labelStyle}>Option {slotIndex + 1}</label>
                <select
                  style={selectStyle}
                  value={selectedIds[slotIndex]}
                  onChange={(e) => handleSelectChange(slotIndex, e.target.value)}
                >
                  <option value="">-- Select Course --</option>
                  {filteredCourses.map((c) => {
                    const id = c._id || c.id;
                    const isSelectedElsewhere = selectedIds.includes(id) && selectedIds[slotIndex] !== id;
                    return (
                      <option key={id} value={id} disabled={isSelectedElsewhere}>
                        {c.title || c.courseName || c.name}
                      </option>
                    );
                  })}
                </select>
                {selectedIds[slotIndex] && (
                  <button style={clearBtnStyle} onClick={() => handleClear(slotIndex)}>
                    Remove
                  </button>
                )}
              </div>

              {/* Course Detail Slot */}
              {course ? (
                <div style={detailsContainerStyle}>
                  <div style={detailBoxStyle}>
                    <span style={detailTitleStyle}>Course Title</span>
                    <h3 style={{ margin: '4px 0 0 0', color: '#4f46e5', fontSize: '18px' }}>
                      {course.title || course.courseName || course.name}
                    </h3>
                  </div>

                  <div style={detailBoxStyle}>
                    <span style={detailTitleStyle}>Category / Domain</span>
                    <p style={detailTextStyle}>
                      <span style={badgeStyle}>
                        {course.category || course.courseCategory || course.stream || course.type || 'General'}
                      </span>
                    </p>
                  </div>

                  <div style={detailBoxStyle}>
                    <span style={detailTitleStyle}>Duration</span>
                    <p style={detailTextStyle}>⏱️ {course.duration || 'N/A'}</p>
                  </div>

                  <div style={detailBoxStyle}>
                    <span style={detailTitleStyle}>Applicable Exams</span>
                    <p style={detailTextStyle}>
                      📝 {Array.isArray(course.exams) ? course.exams.join(', ') : course.exams || 'N/A'}
                    </p>
                  </div>

                  <div style={detailBoxStyle}>
                    <span style={detailTitleStyle}>Career & Potential Profiles</span>
                    <p style={detailTextStyle}>
                      💼{' '}
                      {Array.isArray(course.jobRoles)
                        ? course.jobRoles.join(', ')
                        : Array.isArray(course.potentialProfiles)
                        ? course.potentialProfiles.join(', ')
                        : course.potentialProfiles || 'N/A'}
                    </p>
                  </div>

                  <div style={detailBoxStyle}>
                    <span style={detailTitleStyle}>Description</span>
                    <p style={{ ...detailTextStyle, fontSize: '13px', lineHeight: '1.5', color: '#475569' }}>
                      {course.description || 'No description available.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={placeholderStyle}>
                  <p style={{ color: '#94a3b8', fontWeight: '500' }}>Select a course to compare</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================= STYLES =================
const containerStyle = { maxWidth: '1100px', margin: '30px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' };
const categoryFilterContainerStyle = { backgroundColor: '#f1f5f9', padding: '16px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '25px', border: '1px solid #cbd5e1' };
const categoryLabelStyle = { fontWeight: '700', color: '#1e293b', fontSize: '15px' };
const categorySelectStyle = { padding: '10px 16px', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '14px', fontWeight: '600', backgroundColor: '#fff', color: '#0f172a', cursor: 'pointer', outline: 'none' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' };
const columnCardStyle = { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const selectHeaderStyle = { marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' };
const selectStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc' };
const clearBtnStyle = { marginTop: '8px', backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: 0 };
const detailsContainerStyle = { display: 'flex', flexDirection: 'column', gap: '16px' };
const detailBoxStyle = { backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' };
const detailTitleStyle = { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' };
const detailTextStyle = { margin: '4px 0 0 0', fontSize: '14px', fontWeight: '600', color: '#1e293b' };
const badgeStyle = { backgroundColor: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' };
const placeholderStyle = { flex: 1, minHeight: '250px', border: '2px dashed #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' };