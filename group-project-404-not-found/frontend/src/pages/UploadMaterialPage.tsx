import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

type Course = {
  _id: string;
  courseCode: string;
  courseName: string;
  department?: string;
};

const SEMESTERS = ['2026 Semester 1', '2026 Semester 2', '2025 Semester 2', 'Summer School'];
const DEPARTMENTS = ['Computer Science', 'Mathematics', 'Engineering', 'Business', 'Arts', 'English', 'Other'];
const FILE_TYPES = ['PDF', 'DOCX', 'PPT', 'Video', 'Image', 'Other'];

export default function UploadMaterialPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [downloadCost, setDownloadCost] = useState('500');

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val !== '') {
      let num = parseInt(val, 10);
      if (isNaN(num)) num = 0;
      if (num < 0) num = 0;
      if (num > 10000) num = 10000;
      val = num.toString();
    }
    setDownloadCost(val);
  };
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load course list from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/course`)
      .then(r => r.ok ? r.json() : [])
      .then((data: Course[]) => setCourses(data))
      .catch(() => {});
  }, []);

  const filteredCourses = courses.filter(c =>
    courseSearch.trim() === '' ||
    c.courseCode.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.courseName.toLowerCase().includes(courseSearch.toLowerCase())
  ).slice(0, 6);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !title.trim() || !selectedCourse) return;

    setIsUploading(true);
    setErrorMessage('');

    try {
      // Must use FormData for multipart/form-data (file upload)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('courseCode', selectedCourse.courseCode);
      formData.append('year', year);
      if (semester) formData.append('semester', semester);
      if (department) formData.append('targetDepartment', department);
      if (description.trim()) formData.append('description', description.trim());
      formData.append('downloadCost', downloadCost);

      const response = await fetch(`${API_BASE_URL}/material`, {
        method: 'POST',
        credentials: 'include',
        // No Content-Type header — browser sets multipart boundary automatically
        body: formData,
      });

      if (response.status === 401) { navigate('/auth'); return; }

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setErrorMessage(data?.error ?? 'Unable to upload your material.');
        return;
      }

      setUploadSuccess(true);
      setTimeout(() => navigate('/profile'), 1200);
    } catch {
      setErrorMessage('Unable to connect to the server.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Upload Material</h1>
        <p className="text-gray-500">Share your course materials and earn points when your upload is approved.</p>
      </div>

      <div className="space-y-8">
        {errorMessage && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {/* File Drop Zone */}
        <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden">
          <CardContent className="p-12 text-center">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            {!file ? (
              <div className="space-y-4">
                <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto text-gray-400">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-lg font-bold">Drag and drop your file here, or click to browse</p>
                  <p className="text-sm text-gray-400 mt-1">Supports PDF, DOCX, PPT, images, videos. Max 50MB.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <div className="h-16 w-16 bg-black text-white rounded-xl flex items-center justify-center">
                  <FileText size={32} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold truncate max-w-[300px]">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • {file.name.split('.').pop()?.toUpperCase()}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Material Details */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Material Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Material Name <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="e.g., Advanced Algorithms - Lecture Notes"
                className="h-11 border-gray-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Course search — dynamic from backend */}
            <div className="space-y-2 relative">
              <Label htmlFor="course-search">Course <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="course-search"
                  placeholder="Search by course code or title (e.g., COMP261)"
                  className="h-11 border-gray-200"
                  value={selectedCourse ? `${selectedCourse.courseCode} - ${selectedCourse.courseName}` : courseSearch}
                  onChange={(e) => {
                    setCourseSearch(e.target.value);
                    setSelectedCourse(null);
                    setShowCourseSuggestions(true);
                  }}
                  onFocus={() => setShowCourseSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCourseSuggestions(false), 200)}
                />
              </div>
              <p className="text-xs text-gray-400">Please search and select the related course from the dropdown.</p>
              {showCourseSuggestions && filteredCourses.length > 0 && !selectedCourse && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {filteredCourses.map(c => (
                    <button
                      key={c._id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onClick={() => {
                        setSelectedCourse(c);
                        setCourseSearch('');
                        setShowCourseSuggestions(false);
                        if (c.department) setDepartment(c.department);
                      }}
                    >
                      <p className="font-bold text-sm">{c.courseCode} - {c.courseName}</p>
                      {c.department && <p className="text-xs text-gray-400">{c.department}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year">Year <span className="text-red-500">*</span></Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2026"
                  className="h-11 border-gray-200"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>

              {/* Download Cost */}
              <div className="space-y-2">
                <Label htmlFor="cost">Download Cost (pts) <span className="text-red-500">*</span></Label>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  max="10000"
                  placeholder="500"
                  className="h-11 border-gray-200"
                  value={downloadCost}
                  onChange={handleCostChange}
                />
              </div>
            </div>

            {/* Semester tags */}
            <div className="space-y-2">
              <Label>Year / Semester</Label>
              <div className="flex flex-wrap gap-2">
                {SEMESTERS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSemester(prev => prev === s ? '' : s)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${semester === s ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-black'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Department tags */}
            <div className="space-y-2">
              <Label>Department</Label>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepartment(prev => prev === d ? '' : d)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${department === d ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-black'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe what's included in this material..."
                className="min-h-[100px] border-gray-200 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg text-blue-700 text-xs leading-relaxed">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>
                By uploading, you confirm that this material does not violate copyright and you have the rights to share it.
                Your upload will be reviewed before going live. You'll earn pts once approved.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 pt-4">
          <Button
            onClick={() => void handleUpload()}
            disabled={!file || !title.trim() || !selectedCourse || !year || isUploading || uploadSuccess}
            className="flex-grow h-12 bg-black text-white hover:bg-gray-800 font-bold text-base relative overflow-hidden"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </div>
            ) : uploadSuccess ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} />
                Submitted for Review!
              </div>
            ) : (
              'Upload Material'
            )}
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} className="h-12 px-8 font-bold text-base">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
