import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowLeft, Bookmark, User, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

type CourseAggregatedResponse = {
  course: {
    _id: string;
    courseCode: string;
    courseName: string;
    description: string;
    instructorName: string;
    department: string;
    level: number;
    semester: string;
    updatedAt: string;
  };
  recentMaterials: Array<{
    _id: string;
    title: string;
    fileSize: string;
    createdAt: string;
    user?: { username: string };
  }>;
  recentListings: Array<{
    _id: string;
    title: string;
    description: string;
    price: number;
    images?: string[];
    user?: { username: string };
  }>;
};

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<CourseAggregatedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchCourseDetails = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/course/${id}/details`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Course not found');
          }
          throw new Error('Failed to load course details');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    void fetchCourseDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="h-8 w-8 mx-auto border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading course specifics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={24} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p className="text-gray-500 mb-6">{error || 'Course not available'}</p>
        <Link to="/courses">
          <Button className="bg-black text-white hover:bg-gray-800">Browse all courses</Button>
        </Link>
      </div>
    );
  }

  const { course, recentMaterials, recentListings } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link to="/courses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6">
          <ArrowLeft size={16} />
          Back to courses
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{course.courseCode} – {course.courseName}</h1>
            </div>
            <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500 mt-4">
              {course.department && (
                <Badge variant="secondary" className="rounded-md bg-gray-100 text-gray-600 border-none">
                  {course.department}
                </Badge>
              )}
              {course.level && <span>Level {course.level}</span>}
              <span className="hidden md:inline">•</span>
              <span>{course.semester || 'All Semesters'}</span>
              <span className="hidden md:inline">•</span>
              <span className="font-medium text-gray-900">Code: {course.courseCode}</span>
              <span className="hidden md:inline">•</span>
              <span>Instructor: {course.instructorName || 'TBA'}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed max-w-4xl mb-8">
          {course.description || "No specific description available for this course. Please contact the instructor for more details or check standard faculty handbook pages."}
        </p>

        <div className="flex gap-3">
          <Link to={`/materials`}>
             <Button variant="outline" className="rounded-md h-10 px-6 font-medium">Find More Materials</Button>
          </Link>
          <Button variant="outline" size="icon" className="rounded-md h-10 w-10"><Share2 size={18} /></Button>
          <Button variant="outline" size="icon" className="rounded-md h-10 w-10"><Bookmark size={18} /></Button>
          <div className="flex-grow"></div>
          <span className="text-xs text-gray-400 self-center">Updated: {formatDisplayDate(course.updatedAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
        {/* Materials Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText size={20} className="text-blue-500" />
              Latest Course Materials
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{recentMaterials.length} results</span>
          </div>
          <div className="space-y-4">
            {recentMaterials.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed text-gray-400 text-sm">
                No materials uploaded for this course yet.<br/><br/>
                <Link to="/upload" className="text-black font-bold hover:underline">Upload notes to earn points!</Link>
              </div>
            ) : (
              recentMaterials.map((item) => (
                <Card key={item._id} className="border-gray-100 hover:border-gray-300 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm mb-1 line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
                          <span>{formatDisplayDate(item.createdAt)}</span> • 
                          <span>{item.fileSize || 'Unknown size'}</span> • 
                          <User size={10} /> <span>{item.user?.username || 'Anonymous'}</span>
                        </p>
                      </div>
                    </div>
                    <Link to={`/materials?search=${course.courseCode}`}>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-black font-bold h-8 text-xs">
                        View
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
            
            {recentMaterials.length > 0 && (
              <Link to={`/materials?search=${course.courseCode}`}>
                <Button variant="outline" className="w-full h-12 rounded-md font-bold text-gray-500 hover:text-black mt-2">
                  Browse all materials for {course.courseCode}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Marketplace Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-green-500">🛒</span>
              Active Marketplace Listings
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{recentListings.length} items</span>
          </div>
          <div className="space-y-4">
            {recentListings.length === 0 ? (
               <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed text-gray-400 text-sm">
                No items currently listed for this course.<br/><br/>
                <Link to="/create-listing" className="text-black font-bold hover:underline">List an item for sale</Link>
             </div>
            ) : (
              recentListings.map((item) => (
                <Card key={item._id} className="border-gray-100 hover:border-gray-300 transition-colors">
                  <CardContent className="p-4 flex gap-4">
                    <div className="h-24 w-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col justify-between py-1 overflow-hidden">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-sm line-clamp-1 truncate pr-2">{item.title}</h3>
                          <span className="font-bold text-sm whitespace-nowrap">${Number(item.price).toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {item.description || 'No description provided.'}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-auto">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 border bg-gray-50 px-2 py-0.5 rounded-full">
                           <User size={10} /> <span>{item.user?.username || 'Student User'}</span>
                        </div>
                        <Link to={`/marketplace/${item._id}`}>
                          <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold px-3">
                            View item
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {recentListings.length > 0 && (
               <Link to={`/marketplace?search=${course.courseCode}`}>
                 <Button variant="outline" className="w-full h-12 rounded-md font-bold text-gray-500 hover:text-black mt-2">
                   View all listings for {course.courseCode}
                 </Button>
               </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
