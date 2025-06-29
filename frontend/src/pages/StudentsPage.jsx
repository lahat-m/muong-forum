// src/pages/StudentsPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  User, BookOpen, Landmark, GraduationCap, Calendar, Zap, Award,
  Sparkles, X, // Generic icons from LandingPage
  School, // New icon for faculty
  CheckCircle, XCircle, UserPlus, Image // Icons for graduated status, "No Students Found" link, and placeholder
} from "lucide-react";
import api from "../api";
import NavBar from "../components/NavBar";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/students");
      setStudents(response.data);
      console.log("Fetched students:", response.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load student data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const toggleStudentExpand = (studentId) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  const defaultProfilePhoto = "https://placehold.co/100x100/A855F7/FFFFFF?text=Student"; // Purple placeholder

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      {/* Background Elements */}
      <img
        className="fixed top-0 left-0 w-full h-full object-cover animate-fade z-[-2]"
        src="/bg.gif"
        alt="Background Animation"
      />
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-black/70 to-blue-900/80 animate-gradient-x"></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 backdrop-blur-sm animate-float-slow"
              style={{
                width: `${10 + Math.random() * 25}px`,
                height: `${10 + Math.random() * 25}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${5 + Math.random() * 10}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation Bar */}
      <NavBar />

      {/* Main Content Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 relative">
            <h1 className="text-5xl font-black text-white mb-4 relative z-10">
              <span className="relative inline-block before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-500 before:to-pink-500 before:blur-lg before:opacity-70 before:-z-10">
                Our Brilliant Minds
              </span>
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto relative z-10 text-lg">
              Explore the profiles of students who are part of our community.
            </p>
            <div className="absolute -top-10 right-1/4 animate-float-slow text-purple-400 opacity-70">
              <Sparkles size={24} />
            </div>
            <div className="absolute -bottom-6 left-1/3 animate-float-delay text-pink-400 opacity-70">
              <Sparkles size={16} />
            </div>
          </div>

          {/* Loading, Error, or No Students Found States */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin"></div>
                <div className="w-16 h-16 border-l-4 border-r-4 border-transparent border-b-4 border-pink-500 rounded-full animate-spin absolute top-0 left-0" style={{ animationDirection: "reverse", animationDuration: "1s" }}></div>
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                  <User size={14} />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="relative overflow-hidden py-16 bg-red-900 bg-opacity-20 backdrop-blur-md rounded-3xl text-center p-8">
              <h3 className="text-2xl font-bold text-red-300 mb-4">Error Loading Data</h3>
              <p className="text-red-100 max-w-md mx-auto mb-8">{error}</p>
            </div>
          ) : students.length === 0 ? (
            <div className="relative overflow-hidden py-16 bg-white bg-opacity-5 backdrop-blur-md rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-gradient-x"></div>
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-8">
                <div className="relative mb-8">
                  <User className="h-24 w-24 text-gray-400" />
                  <div className="absolute -right-2 -bottom-2 p-2 bg-gray-800 rounded-full animate-bounce">
                    <X className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Students Found</h3>
                <p className="text-gray-300 max-w-md mx-auto mb-8">
                  It looks like there are no student profiles to display yet.
                </p>
                <Link
                  to="/auth"
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Register or Login (Admin)
                </Link>
              </div>
              <div className="absolute top-6 left-10 w-20 h-20 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
            </div>
          ) : (
            // Students Grid Display
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`group relative rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] ${
                    expandedStudentId === student.id
                      ? "col-span-full md:col-span-2 lg:col-span-3 z-20"
                      : ""
                  }`}
                >
                  {/* Card Background with Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/60 to-gray-900/90 z-10"></div>
                  <div className={`absolute inset-0 bg-gradient-to-r from-purple-700/20 to-pink-700/20 z-0 transition-opacity duration-300 ${expandedStudentId === student.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleStudentExpand(student.id)}
                    className="absolute top-4 right-4 z-30 p-2 bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 hover:bg-white/40 opacity-0 group-hover:opacity-100"
                  >
                    {expandedStudentId === student.id ? (
                      <X className="h-4 w-4 text-white" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-white" />
                    )}
                  </button>

                  {/* Student Content Overlay */}
                  <div className="relative z-20 flex flex-col justify-end p-6 min-h-[250px]">
                    {/* Profile Photo */}
                    <div className="absolute top-6 left-6 z-30">
                      {student.profilePhoto ? (
                        <img
                          src={student.profilePhoto}
                          alt={`${student.name}'s profile`}
                          className="w-20 h-20 rounded-full object-cover border-2 border-purple-400 shadow-lg"
                          onError={(e) => {
                            e.currentTarget.src = defaultProfilePhoto; // Fallback on error
                            e.currentTarget.onerror = null; // Prevent infinite loop
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center border-2 border-purple-400 shadow-lg">
                          <Image className="h-10 w-10 text-gray-400" />
                        </div>
                      )}
                    </div>


                    <div className="flex items-center mb-3 mt-24"> {/* Added mt-24 to push content below image */}
                      <User className="h-5 w-5 mr-2 text-purple-400" />
                      <h3 className="text-2xl font-bold text-white leading-tight">
                        {student.name}
                      </h3>
                    </div>

                    <p className="text-gray-300 text-sm mb-2 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-pink-400" />
                      Course: {student.course}
                    </p>
                    <p className="text-gray-300 text-sm mb-2 flex items-center">
                      <School className="h-4 w-4 mr-2 text-green-400" />
                      Faculty: {student.faculty}
                    </p>

                    <p className="text-gray-300 text-sm mb-4 flex items-center">
                      {student.graduated ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-lime-400" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2 text-red-400" />
                      )}
                      Graduated: {student.graduated ? "Yes" : "No"}
                    </p>

                    {student.skills && student.skills.length > 0 ? (
                      <div className="mt-2">
                        <h4 className="font-semibold text-base text-white mb-1 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-yellow-400" />
                          Skills:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.map((skill, skillIndex) => (
                            <span
                              key={skill.id || skillIndex}
                              className="px-3 py-1 bg-gray-700 rounded-full text-xs font-medium text-gray-100 flex items-center"
                            >
                              <Zap className="h-3 w-3 mr-1 text-cyan-400" />
                              {skill.name} ({skill.yearsOfExperience} yrs)
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                        <p className="text-gray-300 text-sm mt-2 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-gray-500" />
                          Skills: No skills listed
                        </p>
                    )}

                    {/* Collapsible details for expanded view (now only enrollment year) */}
                    {expandedStudentId === student.id && (
                      <div className="mt-4 space-y-2 text-gray-200">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                          <span>Enrollment Year: {student.enrollmentYear}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentsPage;