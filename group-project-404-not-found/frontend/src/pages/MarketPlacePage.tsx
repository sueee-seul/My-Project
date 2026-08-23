import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// These MUST match the values stored in the backend DAO
const CATEGORIES = ['Books', 'Electronics', 'Stationery', 'Notes', 'Other'];
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Swap'];

type Listing = {
  _id: string;
  sellerId?: number;
  title: string;
  description?: string;
  price: number;
  category?: string;
  condition?: string;
  courseCode?: string;
  images?: string[];
  createdAt?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MarketPlacePage() {
  const [urlParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(urlParams.get('search') ?? '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);

  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadListings = useCallback(async (params?: {
    search?: string;
    category?: string;
    condition?: string;
    min?: string;
    max?: string;
    page?: number;
  }) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const query = new URLSearchParams();
      const search = params?.search ?? searchQuery;
      const cat = params?.category ?? selectedCategory;
      const cond = params?.condition ?? selectedCondition;
      const min = params?.min ?? minPrice;
      const max = params?.max ?? maxPrice;
      const p = params?.page ?? page;

      if (search.trim()) query.set('search', search.trim());
      if (cat) query.set('category', cat);
      if (cond) query.set('condition', cond);
      if (min) query.set('minPrice', min);
      if (max) query.set('maxPrice', max);
      query.set('page', p.toString());
      query.set('limit', '8');

      const response = await fetch(`${API_BASE_URL}/marketplace?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load marketplace listings.');
      }

      const data = await response.json();
      // Backend returns { items, total, page, limit }
      setListings(Array.isArray(data) ? data : (data.items ?? []));
      setTotal(Array.isArray(data) ? data.length : (data.total ?? 0));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load marketplace listings.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedCondition, minPrice, maxPrice]);

  // Initial load (respects ?search= URL param from course page)
  useEffect(() => {
    void loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch whenever filter chips change
  useEffect(() => {
    setPage(1);
    void loadListings({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedCondition]);

  const handleSearch = () => {
    setPage(1);
    void loadListings({ page: 1 });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    void loadListings({ search: '', category: '', condition: '', min: '', max: '', page: 1 });
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedCondition || minPrice || maxPrice;
  const totalPages = Math.ceil(total / 8) || 1;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src="https://picsum.photos/seed/marketplace-hero/1920/1080?blur=2"
          alt="Marketplace Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl font-bold mb-4">Market Place</h1>
          <p className="text-xl opacity-90">Browse real listings created by students in the app</p>
          <Link to="/create-listing">
            <Button className="mt-8 h-12 px-10 bg-black text-white hover:bg-gray-800 rounded-md font-bold">Create a listing</Button>
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {errorMessage ? (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* ── Sidebar Filters ── */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Filters</h3>
                {hasActiveFilters && (
                  <button
                    className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
                    onClick={handleClearFilters}
                  >
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold">Search</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Keyword..."
                    className="pl-9 h-10 border-gray-200 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                  className="w-full h-9 bg-black text-white hover:bg-gray-800 text-sm font-medium"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold">Category</h4>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(prev => prev === cat ? '' : cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {cat === 'Books' ? 'Textbooks / Books' : cat === 'Notes' ? 'Physical Notes' : cat}
                      {selectedCategory === cat && <X size={12} className="float-right mt-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold">Condition</h4>
                <div className="space-y-2">
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond}
                      onClick={() => setSelectedCondition(prev => prev === cond ? '' : cond)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCondition === cond ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {cond === 'Like New' ? 'New / Like New' : cond === 'Good' ? 'Good - used' : cond === 'Fair' ? 'Fair - heavily used' : cond}
                      {selectedCondition === cond && <X size={12} className="float-right mt-1" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold">Price Range (NZD)</h4>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    min="0"
                    className="h-9 border-gray-200 text-sm"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-gray-400 text-sm">–</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    min="0"
                    className="h-9 border-gray-200 text-sm"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full h-9 text-sm font-medium"
                  onClick={handleSearch}
                >
                  Apply Price
                </Button>
              </div>
            </div>
          </aside>

          {/* ── Listings Grid ── */}
          <main className="flex-grow">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-medium text-gray-500">
                {isLoading ? 'Loading listings...' : `${total} item${total === 1 ? '' : 's'} found`}
              </h2>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchQuery && (
                  <Badge variant="secondary" className="pr-1 cursor-pointer" onClick={() => { setSearchQuery(''); void loadListings({ search: '' }); }}>
                    "{searchQuery}" <X size={10} className="ml-1" />
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="secondary" className="pr-1 cursor-pointer" onClick={() => setSelectedCategory('')}>
                    {selectedCategory} <X size={10} className="ml-1" />
                  </Badge>
                )}
                {selectedCondition && (
                  <Badge variant="secondary" className="pr-1 cursor-pointer" onClick={() => setSelectedCondition('')}>
                    {selectedCondition} <X size={10} className="ml-1" />
                  </Badge>
                )}
                {(minPrice || maxPrice) && (
                  <Badge variant="secondary" className="pr-1 cursor-pointer" onClick={() => { setMinPrice(''); setMaxPrice(''); void loadListings({ min: '', max: '' }); }}>
                    ${minPrice || '0'} – ${maxPrice || '∞'} <X size={10} className="ml-1" />
                  </Badge>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
                <div className="h-8 w-8 mx-auto border-4 border-gray-200 border-t-black rounded-full animate-spin mb-3" />
                <p className="text-gray-500">Loading marketplace listings...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.map((item, index) => (
                  <Link key={item._id} to={`/marketplace/${item._id}`} className="group">
                    <Card className="border-none shadow-none bg-transparent">
                      <CardContent className="p-0">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                          <img
                            src={item.images?.[0] || `https://picsum.photos/seed/marketplace-${item._id}/400/300`}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          {index === 0 && (
                            <Badge className="absolute top-3 left-3 bg-black text-white border-none rounded-sm text-[10px] uppercase font-bold px-2 py-0.5">Latest</Badge>
                          )}
                          {item.condition && (
                            <Badge className="absolute top-3 right-3 bg-white text-gray-700 border border-gray-200 rounded-sm text-[10px] font-bold px-2 py-0.5">
                              {item.condition}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-sm mb-1 line-clamp-2 group-hover:underline">{item.title}</h3>
                        <p className="font-bold text-lg mb-1">{formatCurrency(item.price)}</p>
                        <div className="flex items-center gap-2 flex-wrap text-[10px] text-gray-500">
                          {item.category ? <span className="bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span> : null}
                          {item.courseCode ? <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">{item.courseCode}</span> : null}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {!isLoading && listings.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed mt-8">
                <p className="text-gray-400">No marketplace listings match your current filters.</p>
                {hasActiveFilters && (
                  <button onClick={handleClearFilters} className="mt-3 text-sm font-bold text-black hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : null}

            {!isLoading && totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <Button variant="outline" disabled={page === 1} onClick={() => { setPage(p => p - 1); void loadListings({ page: page - 1 }); }}>Prev</Button>
                <span className="flex items-center px-4 font-medium text-sm">{page} / {totalPages}</span>
                <Button variant="outline" disabled={page === totalPages} onClick={() => { setPage(p => p + 1); void loadListings({ page: page + 1 }); }}>Next</Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
