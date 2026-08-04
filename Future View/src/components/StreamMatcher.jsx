import React, { useState, useEffect } from 'react';

const API_BASE = 'https://future-view.onrender.com';

export default function StreamMatcher() {
  const [selectedStream, setSelectedCategory] = useState('PCM');
  const [allCourses, setAllCourses] = useState([]);
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define High School Stream Configurations
  const streams = [
    {
      id: 'PCM',
      name: 'Science (PCM)',
      icon: '⚙️',
      desc: 'Physics, Chemistry, Mathematics',
      keywords: ['engineering', 'architecture', 'technology', 'cs', 'it', 'math', 'jee', 'keam']
    },
    {
      id: 'PCB',
      name: 'Science (PCB)',
      icon: '🧬',
      desc: 'Physics, Chemistry, Biology',
      keywords: ['medical', 'pharmacy', 'neet', 'nursing', 'ayush', 'bds', 'mbbs', 'biotech', 'allied']
    },
    {
      id: 'PCMB',
      name: 'Science (PCMB)',
      icon: '🔬',
      desc: 'Physics, Chemistry, Math & Biology',
      keywords: ['engineering', 'medical', 'pharmacy', 'biotech', 'jee', 'neet', 'keam']
    },
    {
      id: 'COMMERCE',
      name: 'Commerce',
      icon: '📊',
      desc: 'Accountancy, Business Studies, Economics',
      keywords: ['commerce', 'management', 'finance', 'bcom', 'bba', 'ca', 'clat', 'legal']
    },
    {
      id: 'ARTS',
      name: 'Humanities / Arts',
      icon: '🎨',
      desc: 'History, Sociology, Political Science, Literature',
      keywords: ['arts', 'humanities', 'design', 'law', 'journalism', 'clat', 'ba', 'social']
    }
  ];

  useEffect(() => {
    setLoading(true);
    Promise.all([
  apiFetch(`${API_BASE}/api/courses`).then((r) => r.json()),
  apiFetch(`${API_BASE}/api/exams`).then((r) => r.json())

    ])
      .then(([coursesData, examsData]) => {
        setAllCourses(Array.isArray(coursesData) ? coursesData : []);
        setAllExams(Array.isArray(examsData) ? examsData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading stream matcher data:', err);
        setLoading(false);
      });
  }, []);

  const activeStreamObj = streams.find((s) => s.id === selectedStream) || streams[0];

  // Filter courses based on active stream keywords
  const eligibleCourses = allCourses.filter((course) => {
    const text = [
      course.title,
      course.courseName,
      course.category,
      course.stream,
      course.description,
      Array.isArray(course.exams) ? course.exams.join(' ') : course.exams
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return activeStreamObj.keywords.some((kw) => text.includes(kw));
  });

  // Filter entrance exams matching active stream keywords
  const eligibleExams = allExams.filter((exam) => {
    const text = [exam.name, exam.examName, exam.category, exam.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return activeStreamObj.keywords.some((kw) => text.includes(kw));
  });

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>
          🎓 High School Stream & Course Matcher
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Select your Class 12 (+2) subject stream to unlock tailored degree options, career tracks, and entrance exams.
        </p>
      </div>

      {/* STREAM SELECTION CARDS */}
      <div style={streamGridStyle}>
        {streams.map((s) => {
          const isSelected = selectedStream === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setSelectedCategory(s.id)}
              style={isSelected ? activeStreamCardStyle : streamCardStyle}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: isSelected ? '#4f46e5' : '#1e293b' }}>
                {s.name}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>{s.desc}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading eligibility match...
        </div>
      ) : (
        <div style={resultsGridStyle}>
          {/* LEFT PANEL: ELIGIBLE COURSES */}
          <div style={sectionCardStyle}>
            <h3 style={sectionHeaderStyle}>
              📚 Eligible Degree Courses ({eligibleCourses.length})
            </h3>
            {eligibleCourses.length > 0 ? (
              <div style={listContainerStyle}>
                {eligibleCourses.map((c) => (
                  <div key={c._id || c.id} style={itemBoxStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '16px' }}>
                        {c.title || c.courseName || c.name}
                      </h4>
                      <span style={durationBadgeStyle}>⏱️ {c.duration || '3-4 Years'}</span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569' }}>
                      {c.description || 'Comprehensive degree track tailored for this domain.'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={tagStyle}>
                        Category: {c.category || c.courseCategory || 'General'}
                      </span>
                      {c.exams && (
                        <span style={examTagStyle}>
                          Exams: {Array.isArray(c.exams) ? c.exams.join(', ') : c.exams}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={emptyTextStyle}>No matching courses found for this stream.</p>
            )}
          </div>

          {/* RIGHT PANEL: RELEVANT ENTRANCE EXAMS */}
          <div style={sectionCardStyle}>
            <h3 style={sectionHeaderStyle}>
              📝 Applicable Entrance Exams ({eligibleExams.length})
            </h3>
            {eligibleExams.length > 0 ? (
              <div style={listContainerStyle}>
                {eligibleExams.map((e) => (
                  <div key={e._id || e.id} style={itemBoxStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#4f46e5', fontSize: '18px' }}>{e.name}</h4>
                      <span style={categoryBadgeStyle}>{e.category || 'General'}</span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                      {e.description || 'National/State level entrance examination.'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={emptyTextStyle}>No specific entrance exams listed for this stream.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================
const containerStyle = { maxWidth: '1100px', margin: '30px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' };
const streamGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' };
const streamCardStyle = { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease' };
const activeStreamCardStyle = { ...streamCardStyle, borderColor: '#4f46e5', backgroundColor: '#eef2ff', boxShadow: '0 0 0 2px #4f46e5' };
const resultsGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' };
const sectionCardStyle = { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' };
const sectionHeaderStyle = { margin: '0 0 15px 0', fontSize: '18px', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' };
const listContainerStyle = { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '5px' };
const itemBoxStyle = { backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #f1f5f9' };
const durationBadgeStyle = { backgroundColor: '#e2e8f0', color: '#334155', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '4px' };
const tagStyle = { backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px' };
const examTagStyle = { backgroundColor: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px' };
const categoryBadgeStyle = { backgroundColor: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '4px' };
const emptyTextStyle = { color: '#94a3b8', textAlign: 'center', padding: '30px 0' };