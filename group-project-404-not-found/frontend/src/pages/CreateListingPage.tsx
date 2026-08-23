import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, CheckCircle2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const MAX_IMAGES = 6;

type Course = {
  _id: string;
  courseCode: string;
  courseName: string;
  department?: string;
};

export default function CreateListingPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image files selected for upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // Preview URLs for the selected images (object URLs, freed on unmount)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  // Course search — dynamic from backend
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [wechat, setWechat] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  // Fetch user profile to auto-fill email
  useEffect(() => {
    fetch(`${API_BASE_URL}/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(profile => {
        if (profile?.email) setContactEmail(profile.email);
      })
      .catch(() => {});
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load all courses from backend for the autocomplete dropdown
  useEffect(() => {
    fetch(`${API_BASE_URL}/course`)
      .then(r => r.ok ? r.json() : [])
      .then((data: Course[]) => setAllCourses(data))
      .catch(() => {});
  }, []);

  const filteredCourses = allCourses.filter(c =>
    courseSearch.trim() === '' ||
    c.courseCode.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.courseName.toLowerCase().includes(courseSearch.toLowerCase())
  ).slice(0, 6);

  // ── Image selection ──────────────────────────────────────────────────────────
  const handleImageFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    const remaining = MAX_IMAGES - imageFiles.length;
    const toAdd = files.slice(0, remaining);

    // Create preview URLs
    const previews = toAdd.map((f) => URL.createObjectURL(f));

    setImageFiles((prev) => [...prev, ...toAdd]);
    setImagePreviews((prev) => [...prev, ...previews]);

    // Reset file input so the same file can be selected again if removed
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const isCategoryValid = category === 'Other' ? !!customCategory.trim() : !!category;
    if (!title.trim() || !isCategoryValid || !price || !condition) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Must use FormData for multipart/form-data (image uploads)
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('price', price);
      formData.append('category', category === 'Other' ? customCategory.trim() : category);
      formData.append('condition', condition);
      if (selectedCourse) formData.append('courseCode', selectedCourse.courseCode);
      if (location.trim()) formData.append('location', location.trim());
      if (description.trim()) formData.append('description', description.trim());
      formData.append('status', 'live'); // publish immediately as live

      // Append each image file under the 'images' key
      imageFiles.forEach((file) => formData.append('images', file));

      // contactMethods as a JSON string (backend parses it)
      const contactMethods: Record<string, string> = {};
      if (whatsapp.trim()) contactMethods.whatsapp = whatsapp.trim();
      if (wechat.trim()) contactMethods.wechat = wechat.trim();
      if (contactEmail.trim()) contactMethods.email = contactEmail.trim();
      if (contactPhone.trim()) contactMethods.phone = contactPhone.trim();
      formData.append('contactMethods', JSON.stringify(contactMethods));

      const response = await fetch(`${API_BASE_URL}/marketplace`, {
        method: 'POST',
        credentials: 'include',
        // No Content-Type header — browser sets multipart boundary automatically
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) { navigate('/auth'); return; }
      if (!response.ok) {
        setErrorMessage(data?.error ?? 'Unable to publish your listing.');
        return;
      }

      // Free all object URLs
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));

      setSubmitSuccess(true);
      setTimeout(() => navigate('/profile'), 1200);
    } catch {
      setErrorMessage('Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Create Listing</h1>
        <p className="text-gray-500">List your second-hand items for other students to discover. High-quality photos help items sell faster.</p>
      </div>

      <div className="space-y-8">
        {errorMessage && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        {/* Photos */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Photos ({imageFiles.length}/{MAX_IMAGES})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                  <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {imageFiles.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all bg-gray-50/50"
                >
                  <Camera size={22} className="mb-1" />
                  <Plus size={14} />
                  <span className="text-[9px] font-bold uppercase mt-1">Add Photo</span>
                </button>
              )}
            </div>

            {/* Hidden file input — accepts jpg/png/gif, allows multiple */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              multiple
              className="hidden"
              onChange={handleImageFilesChange}
            />

            <p className="text-xs text-gray-400 mt-4">
              Add up to {MAX_IMAGES} photos (jpg, png, gif). First photo will be shown as the cover.
            </p>
          </CardContent>
        </Card>

        {/* Item Details */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Listing Title <span className="text-red-500">*</span></Label>
              <Input id="title" placeholder="e.g., Calculus: Early Transcendentals - 3rd Edition" className="h-11 border-gray-200" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 border-gray-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Books">Textbooks / Books</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Stationery">Stationery</SelectItem>
                    <SelectItem value="Notes">Physical Notes</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {category === 'Other' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-category">Specify Category <span className="text-red-500">*</span></Label>
                  <Input id="custom-category" placeholder="e.g., Furniture" className="h-11 border-gray-200" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="price">Price (NZD) <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                  <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" className="h-11 border-gray-200 pl-8" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition <span className="text-red-500">*</span></Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="h-11 border-gray-200">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Like New">New / Like New</SelectItem>
                    <SelectItem value="Good">Good - used</SelectItem>
                    <SelectItem value="Fair">Fair - heavily used</SelectItem>
                    <SelectItem value="Swap">Accept swap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="course-search">Related Course (Optional)</Label>
                <Input
                  id="course-search"
                  placeholder="Search by code or title (e.g., COMPSCI732)"
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
                <p className="text-xs text-gray-400">Please search and select the related course from the dropdown, if any.</p>
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
                        }}
                      >
                        <p className="font-bold text-sm">{c.courseCode} - {c.courseName}</p>
                        {c.department && <p className="text-xs text-gray-400">{c.department}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Pickup Location (Optional)</Label>
              <Input id="location" placeholder="e.g., Near Science Building, UoA City Campus" className="h-11 border-gray-200" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the item's condition, any highlighting, or specific pickup details..."
                className="min-h-[150px] border-gray-200 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Methods */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Contact Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-gray-400">Add at least one way for buyers to reach you.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" placeholder="+64 21 000 0000" className="h-11 border-gray-200" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wechat">WeChat ID</Label>
                <Input id="wechat" placeholder="Your WeChat ID" className="h-11 border-gray-200" value={wechat} onChange={(e) => setWechat(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email <span className="text-red-500">*</span></Label>
                <Input id="contact-email" type="email" readOnly className="h-11 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input id="contact-phone" placeholder="+64 9 000 0000" className="h-11 border-gray-200" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 pt-4">
          <Button
            onClick={() => void handleSubmit()}
            disabled={!title.trim() || !category || (category === 'Other' && !customCategory.trim()) || !price || !condition || (!whatsapp.trim() && !wechat.trim() && !contactEmail.trim() && !contactPhone.trim()) || isSubmitting || submitSuccess}
            className="flex-grow h-12 bg-black text-white hover:bg-gray-800 font-bold text-base"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </div>
            ) : submitSuccess ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} />
                Published!
              </div>
            ) : (
              'Publish Listing'
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
