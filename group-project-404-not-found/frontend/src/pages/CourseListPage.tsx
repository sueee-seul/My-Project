import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

type Course = {
  _id: string;
  courseCode: string;
  courseName: string;
  instructorName?: string;
  department?: string;
  level?: number;
  semester?: string;
  vacation?: string;
  status?: string;
  seatsLeft?: number;
  schedule?: string;
  prerequisites?: string;
};

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [level, setLevel] = useState('');
  const [semester, setSemester] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Use broader categories that will match the new JSON data (e.g. "Science", "Arts", "Business")
  const DEPARTMENTS = [
    'Computer Science', 
    'Business', 
    'Engineering', 
    'Science', 
    'Arts', 
    'Law', 
    'Education', 
    'Medical', 
    'Fine Arts'
  ];

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (department) params.append('department', department);
      if (level && level !== 'All levels') params.append('level', level);
      if (semester) params.append('semester', semester);

      const response = await fetch(`${API_BASE_URL}/course?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load courses');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    void loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department, level, semester]); // re-run automatically when filters change

  const handleSearch = () => {
    setPage(1);
    void loadCourses();
  };

  const totalPages = Math.ceil(courses.length / 6) || 1;
  const paginatedCourses = courses.slice((page - 1) * 6, page * 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Find your course</h1>
        <p className="text-gray-500 mb-8">Search courses by code, title, instructor or department to discover linked materials and marketplace listings.</p>
        
        <div className="flex gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              placeholder="Search by course code, title, or instructor..." 
              className="pl-12 h-14 border-gray-200 shadow-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="h-14 px-10 bg-black text-white hover:bg-gray-800 text-lg font-medium">Search</Button>
        </div>

        <div className="flex flex-wrap gap-8 items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Level:</span>
            <div className="flex gap-2">
              {['All levels', '100', '200', '300', '700'].map((lev) => (
                <Button 
                  key={lev} 
                  variant={level === lev || (lev === 'All levels' && !level) ? 'default' : 'outline'} 
                  size="sm" 
                  className={`rounded-md h-8 px-3 ${level === lev || (lev === 'All levels' && !level) ? 'bg-black text-white' : ''}`}
                  onClick={() => setLevel(lev === 'All levels' ? '' : lev)}
                >
                  {lev}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Semester:</span>
            <select 
              className="border rounded-md h-8 px-2 bg-white outline-none"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="">Any</option>
              <option value="Sem1">Semester 1</option>
              <option value="Sem2">Semester 2</option>
              <option value="Summer">Summer School</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6 items-center">
          <span className="text-sm font-medium mr-2">Departments:</span>
          <Button 
            variant={department === '' ? 'default' : 'outline'} 
            size="sm" 
            className="rounded-md h-8 px-4"
            onClick={() => setDepartment('')}
          >
            All
          </Button>
          {DEPARTMENTS.map((dept) => (
            <Button 
              key={dept} 
              variant={department === dept ? 'default' : 'outline'} 
              size="sm" 
              className="rounded-md h-8 px-4"
              onClick={() => setDepartment(dept)}
            >
              {dept}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold">
          {isLoading ? 'Loading courses...' : `${courses.length} courses found`}
        </h2>
      </div>

      {!isLoading && courses.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-400">No courses match your criteria.</p>
        </div>
      )}

      {isLoading && courses.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
           <div className="h-8 w-8 mx-auto border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {paginatedCourses.map((course) => (
          <Card key={course._id} className="overflow-hidden border-gray-100 hover:border-gray-300 hover:shadow-md transition-all flex flex-col">
            <CardContent className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{course.courseCode}</h3>
                  <h4 className="text-lg font-bold leading-tight line-clamp-2 h-14">{course.courseName}</h4>
                </div>
                {/* Visual placeholder for course 'cover' or department */}
                <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                  {course.department?.slice(0, 3).toUpperCase() || 'CRS'}
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Instructor:</span> <span className="line-clamp-1">{course.instructorName || 'TBA'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Schedule:</span> <span className="line-clamp-1">{course.schedule || 'TBA'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Prerequisites:</span> <span className="line-clamp-1">{course.prerequisites || 'None'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-auto">
                <Badge variant={course.status === 'Available' ? 'secondary' : 'outline'} className={`rounded-md ${course.status === 'Available' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                  {course.status || 'Unknown'}
                </Badge>
                <span className="text-xs text-gray-400 font-medium">
                  {course.seatsLeft !== null && course.seatsLeft !== undefined ? `Seats: ${course.seatsLeft}` : ''}
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-0">
              <Link to={`/course/${course._id}`} className="w-full">
                <Button variant="ghost" className="w-full h-12 rounded-none border-t font-bold hover:bg-gray-50">
                  View details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <span className="flex items-center px-4 font-medium text-sm">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
