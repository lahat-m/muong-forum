// src/components/StudentForm.jsx
import React, { useState, useRef } from 'react';
import api from '../api'; // Your Axios instance
import { Camera, Save, XCircle } from 'lucide-react'; // Icons

const StudentForm = ({ student = null, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    userId: student?.userId || '',
    name: student?.name || '',
    registrationNumber: student?.registrationNumber || '',
    course: student?.course || '',
    faculty: student?.faculty || '',
    graduated: student?.graduated || false,
    enrollmentYear: student?.enrollmentYear || '',
    profilePhotoUrl: student?.profilePhoto || '', // Store URL for display
    skills: student?.skills || [], // Array of {id?, name, yearsOfExperience}
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentError, setCurrentError] = useState(null);
  const fileInputRef = useRef(null); // Ref for file input

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      setFormData(prev => ({
        ...prev,
        profilePhotoUrl: URL.createObjectURL(file) // Show local preview
      }));
    } else {
      setProfilePhotoFile(null);
      // If the file input is cleared, revert profilePhotoUrl to original or null
      setFormData(prev => ({
        ...prev,
        profilePhotoUrl: student?.profilePhoto || null // Use null to indicate removal if it was originally there
      }));
    }
  };

  const handleSkillChange = (index, field, value) => {
    const newSkills = [...formData.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', yearsOfExperience: 0 }] // Default years to 0
    }));
  };

  const removeSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCurrentError(null);
    setLoading(true);

    const data = new FormData();

    // Append non-file fields with explicit type conversions for FormData
    for (const key in formData) {
      if (key === 'profilePhotoUrl') {
        // This is for local preview. The actual file or explicit null will be appended below.
        continue;
      }
      if (key === 'skills') {
        data.append(key, JSON.stringify(formData[key])); // Stringify array of objects
      } else if (key === 'graduated') {
        data.append(key, String(formData[key])); // Convert boolean to "true" or "false" string
      } else if (key === 'userId' || key === 'enrollmentYear') {
        // Ensure numbers are converted to strings. Backend will parse them.
        data.append(key, String(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    }

    // Handle profile photo file or explicit removal
    if (profilePhotoFile) {
      data.append('profilePhoto', profilePhotoFile);
    } else if (formData.profilePhotoUrl === null && student?.profilePhoto) {
      // If user explicitly cleared the photo (profilePhotoUrl is null) and there was an old photo,
      // send a special signal to backend to remove it. 'null' string is often used for this.
      data.append('profilePhoto', 'null');
    } else if (student && student.profilePhoto && !formData.profilePhotoUrl) {
      // If editing an existing student, and no new file selected, but the profilePhotoUrl became empty,
      // it means they removed the image. Send 'null' string to backend to clear it.
      // This is a redundant check if the above `formData.profilePhotoUrl === null` handles it.
      // Keeping it clear for now.
      data.append('profilePhoto', 'null');
    }


    try {
      let response;
      if (student) {
        // Update existing student
        response = await api.patch(`/students/${student.id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`
          }
        });
      } else {
        // Create new student
        response = await api.post('/students', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`
          }
        });
      }
      onSuccess(response.data);
    } catch (err) {
      console.error("Form submission error:", err);
      setCurrentError(err.response?.data?.message || 'An unexpected error occurred.');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-2xl mx-auto my-10 border border-purple-600">
      <h2 className="text-3xl font-bold mb-6 text-center text-white gradient-text">
        {student ? 'Edit Student Profile' : 'Create New Student'}
      </h2>
      {currentError && (
        <div className="bg-red-900 text-red-200 p-3 rounded mb-4 text-center">
          {currentError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center gap-4">
          <label htmlFor="profilePhotoInput" className="relative cursor-pointer">
            <div className="w-28 h-28 rounded-full border-4 border-purple-500 overflow-hidden flex items-center justify-center bg-gray-700 hover:opacity-80 transition-opacity">
              {formData.profilePhotoUrl ? (
                <img
                  src={formData.profilePhotoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              id="profilePhotoInput"
              name="profilePhoto"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {/* Show remove button only if there's a photo */}
            {formData.profilePhotoUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfilePhotoFile(null);
                  setFormData(prev => ({ ...prev, profilePhotoUrl: null })); // Set to null for explicit removal
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                title="Remove photo"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </label>
          <span className="text-gray-400 text-sm">Click to {formData.profilePhotoUrl ? 'change' : 'upload'} profile photo</span>
        </div>

        {/* Basic Student Details */}
        {!student && ( // userId only for creation
          <div>
            <label htmlFor="userId" className="block text-gray-300 text-sm font-bold mb-2">User ID:</label>
            <input
              type="number"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
        )}
        <div>
          <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">Full Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="registrationNumber" className="block text-gray-300 text-sm font-bold mb-2">Registration Number:</label>
          <input
            type="text"
            id="registrationNumber"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="course" className="block text-gray-300 text-sm font-bold mb-2">Course Name:</label>
          <input
            type="text"
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="faculty" className="block text-gray-300 text-sm font-bold mb-2">Faculty:</label>
          <input
            type="text"
            id="faculty"
            name="faculty"
            value={formData.faculty}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="graduated"
            name="graduated"
            checked={formData.graduated}
            onChange={handleChange}
            className="form-checkbox h-5 w-5 text-purple-600 rounded"
          />
          <label htmlFor="graduated" className="text-gray-300 text-sm font-bold">Graduated</label>
        </div>
        <div>
          <label htmlFor="enrollmentYear" className="block text-gray-300 text-sm font-bold mb-2">Enrollment Year:</label>
          <input
            type="number"
            id="enrollmentYear"
            name="enrollmentYear"
            value={formData.enrollmentYear}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>

        {/* Skills Section */}
        <div className="border border-gray-600 p-4 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Skills</h3>
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-end gap-3 mb-4 bg-gray-700 p-3 rounded-lg">
              <div className="flex-1">
                <label htmlFor={`skill-name-${index}`} className="block text-gray-400 text-xs font-bold mb-1">Skill Name:</label>
                <input
                  type="text"
                  id={`skill-name-${index}`}
                  value={skill.name}
                  onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`skill-years-${index}`} className="block text-gray-400 text-xs font-bold mb-1">Years of Experience:</label>
                <input
                  type="number"
                  id={`skill-years-${index}`}
                  value={skill.yearsOfExperience}
                  onChange={(e) => handleSkillChange(index, 'yearsOfExperience', parseInt(e.target.value) || 0)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-800 border-gray-600 text-white"
                  required
                  min="0"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors self-end"
                title="Remove skill"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSkill}
            className="w-full mt-4 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            Add Skill
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Save className="mr-2" />
          )}
          {student ? 'Save Changes' : 'Create Student'}
        </button>
      </form>
    </div>
  );
};

export default StudentForm;