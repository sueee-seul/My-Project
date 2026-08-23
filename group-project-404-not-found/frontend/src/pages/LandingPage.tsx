import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ShoppingBag, ArrowRight, Star, Download, Upload, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage({ currentUser }: { currentUser?: { id: number; email: string } | null }) {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section id="about" className="relative py-20 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                About us
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
                UoA SWAP is a website focused on building an efficient and user-friendly platform for seamless exchanges. On this platform, you can enjoy a smooth and engaging experience while discovering valuable resources and opportunities. We are committed to delivering an intuitive interface, reliable performance, and a convenient way to connect and share within the community.
              </p>
              <div className="flex gap-4">
                <Link to="/profile">
                  <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 rounded-md">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/uoa-campus/1200/900" 
                  alt="UoA Campus" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <Star fill="currentColor" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-xl">4.9/5</p>
                    <p className="text-sm text-gray-500">Student Satisfaction</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Material Section */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4">Material</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-white flex items-center justify-center p-8">
                    <img src="https://picsum.photos/seed/books/400/400" alt="Download" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Download materials</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Access a wide range of study materials, past exams, and notes uploaded by top-performing students.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-white flex items-center justify-center p-8">
                    <img src="https://picsum.photos/seed/notes/400/400" alt="Cheat Sheet" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Cheat Sheet</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Get concise and verified cheat sheets tailored to your specific courses to boost your exam prep.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-white flex items-center justify-center p-8">
                    <img src="https://picsum.photos/seed/upload/400/400" alt="Upload" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Upload materials</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Share your own notes and materials to earn points, which you can use to download premium content.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-12">Course</h2>
              <div className="space-y-10">
                <div>
                  <h3 className="text-lg font-bold mb-2">Find Your Courses</h3>
                  <p className="text-gray-500 text-sm">Easily search for courses by code, department, or instructor to discover dedicated material and listings.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Discover Prerequisites</h3>
                  <p className="text-gray-500 text-sm">Check course requirements and connect with students who have previously taken the class.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Course Specific Listings</h3>
                  <p className="text-gray-500 text-sm">Everything is organized by course. From textbooks to cheat sheets, find exactly what you need for your semester.</p>
                </div>
              </div>
              <div className="flex gap-4 mt-12">
                <Link to="/courses">
                  <Button className="bg-black text-white hover:bg-gray-800">Browse Courses</Button>
                </Link>
                <Link to="/materials">
                  <Button variant="secondary">Find Materials</Button>
                </Link>
              </div>
            </div>
            <div className="aspect-square rounded-3xl overflow-hidden bg-blue-50 flex items-center justify-center p-12">
              <img src="https://picsum.photos/seed/education/800/800" alt="Education" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

      {/* Market Place Section */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12">Market Place</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/marketplace?category=Notes" className="block group">
              <Card className="border-none shadow-none bg-transparent cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-6 relative">
                    <img src="https://picsum.photos/seed/notes-market/800/450" alt="Trade Notes" className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:underline">Trade Course Notes</h3>
                  <p className="text-gray-500 text-sm">Buy and sell comprehensive handwritten or digital notes directly with your peers.</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/marketplace?category=Books" className="block group">
              <Card className="border-none shadow-none bg-transparent cursor-pointer">
                <CardContent className="p-0">
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-6 relative">
                    <img src="https://picsum.photos/seed/books-market/800/450" alt="Buy Books" className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:underline">Buy Second-Hand Course Books</h3>
                  <p className="text-gray-500 text-sm">Save money by purchasing pre-loved textbooks, lab equipment, and stationery from senior students.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12">What Students Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border bg-white shadow-sm">
              <CardContent className="p-8">
                <p className="text-lg mb-8 italic">"This platform saved my life during midterms. I found the exact cheat sheet I needed for Compsci 101."</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="https://picsum.photos/seed/user-1/100/100" alt="User" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Sarah</p>
                    <p className="text-xs text-gray-500">2nd Year IT</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border bg-white shadow-sm">
              <CardContent className="p-8">
                <p className="text-lg mb-8 italic">"Selling my old textbooks was incredibly easy. The integration with course codes makes finding buyers a breeze."</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="https://picsum.photos/seed/user-2/100/100" alt="User" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">James</p>
                    <p className="text-xs text-gray-500">3rd Year Business</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border bg-white shadow-sm">
              <CardContent className="p-8">
                <p className="text-lg mb-8 italic">"I love the points system! Uploading my old notes lets me download new materials without spending money."</p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                    <img src="https://picsum.photos/seed/user-3/100/100" alt="User" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Emily</p>
                    <p className="text-xs text-gray-500">1st Year Engineering</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <h2 className="text-4xl font-bold">Ready to start swapping?</h2>
          <div className="flex gap-4 flex-wrap">
            {currentUser ? (
              <Link to="/profile">
                <Button className="bg-black text-white hover:bg-gray-800 px-8">Go to Profile</Button>
              </Link>
            ) : (
              <Link to="/auth?mode=signup">
                <Button className="bg-black text-white hover:bg-gray-800 px-8">Sign Up Now</Button>
              </Link>
            )}
            <Link to="/marketplace">
              <Button variant="secondary" className="px-8">Browse Marketplace</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
