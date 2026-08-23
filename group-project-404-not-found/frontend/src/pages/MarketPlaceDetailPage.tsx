import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Mail, Phone, Copy } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

type Listing = {
  _id: string;
  title: string;
  price: number;
  category?: string;
  condition?: string;
  location?: string;
  description?: string;
  images?: string[];
  contactMethods?: {
    whatsapp?: string;
    wechat?: string;
    email?: string;
    phone?: string;
  };
  courseCode?: string;
  status?: string;
};

type SimilarItem = {
  _id: string;
  title: string;
  price: number;
  condition?: string;
  images?: string[];
};

export default function MarketPlaceDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [similarListings, setSimilarListings] = useState<SimilarItem[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const [detailRes, similarRes] = await Promise.all([
          fetch(`${API_BASE_URL}/marketplace/${id}`),
          fetch(`${API_BASE_URL}/marketplace/${id}/similar`),
        ]);

        if (detailRes.status === 404) { setNotFound(true); return; }
        if (!detailRes.ok) throw new Error('Failed to load listing.');

        const [detail, similar] = await Promise.all([detailRes.json(), similarRes.ok ? similarRes.json() : []]);
        setListing(detail);
        setSimilarListings(similar);
        setCurrentImage(0);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  const handleCopy = (key: string, value: string) => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
          Loading listing...
        </div>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/marketplace" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8">
          <ArrowLeft size={16} />
          Back to marketplace
        </Link>
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-400 text-lg">Listing not found.</p>
        </div>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : ['https://picsum.photos/seed/placeholder/800/600'];
  const contacts = listing.contactMethods ?? {};

  const contactRows = [
    { key: 'whatsapp', label: 'WhatsApp', value: contacts.whatsapp, icon: <MessageCircle size={20} />, color: 'text-green-500' },
    { key: 'wechat',   label: 'WeChat',   value: contacts.wechat,   icon: <MessageCircle size={20} />, color: 'text-blue-500' },
    { key: 'email',    label: 'Email',    value: contacts.email,    icon: <Mail size={20} />,           color: 'text-gray-400' },
    { key: 'phone',    label: 'Phone',    value: contacts.phone,    icon: <Phone size={20} />,          color: 'text-gray-400' },
  ].filter(row => row.value);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/marketplace" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8">
        <ArrowLeft size={16} />
        Back to marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 group">
            <img
              src={images[currentImage]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${currentImage === i ? 'border-black' : 'border-transparent opacity-60'}`}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Listing Info */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex flex-wrap gap-3 items-center text-sm text-gray-500">
              {listing.category && <Badge variant="secondary">{listing.category}</Badge>}
              {listing.condition && <span>Condition: {listing.condition}</span>}
              {listing.location && <><span>•</span><span>📍 {listing.location}</span></>}
              {listing.courseCode && <><span>•</span><span>Course: {listing.courseCode}</span></>}
            </div>
          </div>

          <div>
            <p className="text-3xl font-bold mb-1">
              ${listing.price.toFixed(2)}
            </p>
          </div>

          {listing.description && (
            <div className="space-y-4">
              <h3 className="font-bold">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {contactRows.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold">Contact Seller</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactRows.map((row) => (
                  <div key={row.key} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={row.color}>{row.icon}</div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium">{row.label}</p>
                        <p className="text-sm font-medium truncate max-w-[150px]">{row.value}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[10px] font-bold"
                      onClick={() => handleCopy(row.key, row.value!)}
                    >
                      {copiedKey === row.key ? '✓ Copied' : <Copy size={14} />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Listings */}
      {similarListings.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Similar Listings</h2>
            <span className="text-sm text-gray-400">Showing {similarListings.length} items</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarListings.map((item) => (
              <Link key={item._id} to={`/marketplace/${item._id}`} className="group">
                <Card className="border-gray-100 hover:border-gray-300 transition-all">
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-gray-100">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                      )}
                    </div>
                    <h3 className="font-bold text-sm mb-1 line-clamp-1 group-hover:underline">{item.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">${item.price.toFixed(2)}</span>
                      {item.condition && <span className="text-[10px] text-gray-400">• {item.condition}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
