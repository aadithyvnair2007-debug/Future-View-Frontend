import React, { useEffect, useState } from "react";
import axios from "axios";

const View = () => {
  // Navigation/Screen state: "intro" | "exams" | "courses"
  const [screen, setScreen] = useState("intro");
  const [introMessage, setIntroMessage] = useState("Loading welcome configuration...");
  const [selectedExam, setSelectedExam] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Array defining individual accurate descriptions for each card
  const examOptions = [
    {
      id: "JEE",
      name: "JEE",
      label: "J",
      description: "Explore premier engineering, technology, and architecture programs at IITs, NITs, and central institutions."
    },
    {
      id: "KEAM",
      name: "KEAM",
      label: "K",
      description: "Explore professional degree engineering, architecture, and medical allied streams across colleges in Kerala."
    },
    {
      id: "NEET",
      name: "NEET",
      label: "N",
      description: "Explore national medical (MBBS), dental (BDS), AYUSH, and veterinary science pathways across India."
    }
  ];

  // 2. Fetch the intro welcome data from your backend route
  useEffect(() => {
    axios
      .get("http://localhost:3010/api/welcome")
      .then((res) => {
        setIntroMessage(res.data);
      })
      .catch((err) => {
        console.log("Intro Fetch Error:", err);
        setIntroMessage("Welcome to the Academic Pathway Finder.");
      });
  }, []);

  // 3. Fetch and filter courses based on user exam target array values
  const handleExamSelect = (examName) => {
    setSelectedExam(examName);
    setLoading(true);
    setScreen("courses");

    axios
      .get("http://localhost:3010/api/courses")
      .then((res) => {
        const filtered = res.data.filter((course) =>
          course.exams && course.exams.map(e => e.toUpperCase()).includes(examName.toUpperCase())
        );
        setCourses(filtered);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error loading courses:", err);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-6">

      {/* SCREEN 1: INTRO WELCOME BANNER DISPLAY */}
      {screen === "intro" && (
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-2xl transform transition hover:scale-105 duration-300">
          
          {/* Dynamic Title from Backend */}
          <h1 className="text-4xl font-extrabold text-indigo-900 mb-6 tracking-tight">
            {typeof introMessage === 'object' ? introMessage.title : "Academic Pathway Finder"}
          </h1>
          
          {/* Dynamic Description from Backend */}
          <p className="text-gray-600 text-lg leading-relaxed mb-6 border-l-4 border-indigo-500 pl-4 text-left italic">
            "{typeof introMessage === 'object' ? introMessage.description : introMessage}"
          </p>

          {/* Dynamic Benefits List from Backend */}
          {typeof introMessage === 'object' && introMessage.benefits && (
            <div className="text-left mb-8 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-indigo-950 mb-2 text-sm uppercase tracking-wide">Why Use Future View?</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-gray-700 text-sm">
                {introMessage.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Action Button */}
          <button
            onClick={() => setScreen("exams")}
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg transition duration-200 group"
          >
            Explore More
            <span className="ml-3 transform group-hover:translate-x-2 transition duration-200 text-2xl">➔</span>
          </button>
        </div>
      )}

      {/* SCREEN 2: ENTRANCE EXAM SELECTION PATH */}
      {screen === "exams" && (
        <div className="w-full max-w-4xl text-center">
          <button 
            onClick={() => setScreen("intro")}
            className="text-indigo-600 font-semibold mb-6 flex items-center hover:underline mx-auto"
          >
            ← Back to Intro
          </button>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Select Your Entrance Exam</h2>
          <p className="text-gray-500 mb-8">Choose an option below to filter matching professional degree programs</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {examOptions.map((exam) => (
              <div
                key={exam.id}
                onClick={() => handleExamSelect(exam.name)}
                className="bg-white p-8 rounded-xl shadow-md border-2 border-transparent hover:border-indigo-500 cursor-pointer transform hover:-translate-y-2 transition duration-300 text-center"
              >
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">
                  {exam.label}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{exam.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{exam.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 3: FILTERED COURSE FEEDBACK */}
      {screen === "courses" && (
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => setScreen("exams")}
              className="text-indigo-600 font-semibold flex items-center hover:underline"
            >
              ← Choose a Different Exam
            </button>
            <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full font-bold text-sm tracking-wide shadow-sm">
              SELECTED: {selectedExam}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 font-medium text-xl">Processing...</div>
          ) : courses.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow text-center">
              <p className="text-gray-500 text-lg">No courses found matching the data payload tags for {selectedExam}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div key={course._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{course.courseName}</h3>
                    <div className="flex gap-2 mb-3">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded font-semibold">{course.stream}</span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded font-semibold">{course.duration}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{course.description}</p>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <span className="text-xs efont-bold text-gray-400 block mb-1.5 uppercase tracking-wider">Potential Profiles</span>
                    <div className="flex flex-wrap gap-1.5">
                      {course.jobRoles && course.jobRoles.map((role, idx) => (
                        <span key={idx} className="bg-gray-50 text-gray-600 text-xs px-2 py-0.5 rounded border border-gray-200">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default View;