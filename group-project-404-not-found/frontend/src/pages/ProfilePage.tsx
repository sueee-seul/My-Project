import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, ShoppingBag, FileText, Download, Trash2, Plus, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const DEFAULT_AVATARS = [
  `${API_BASE_URL}/images/Asset 2.png`,
  `${API_BASE_URL}/images/Asset 3.png`,
  `${API_BASE_URL}/images/Asset 4.png`,
  `${API_BASE_URL}/images/Asset 6.png`,
  `${API_BASE_URL}/images/Asset 7.png`,
];

function getRandomAvatar(email?: string) {
  if (!email) return DEFAULT_AVATARS[0];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index];
}

type UserProfile = {
  _id: string;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  bio?: string;
  upi?: string;
  avatarUrl?: string;
  creditBalance?: number;
  createdAt?: string;
};

type UserMaterial = {
  _id: string;
  title: string;
  courseCode: string;
  year?: number;
  description?: string;
  fileType?: string;
  fileSize?: string;
  status?: string;
  downloadCost?: number;
  createdAt?: string;
};

type UserListing = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category?: string;
  condition?: string;
  images?: string[];
  status?: string;
  createdAt?: string;
};

type CreditLog = {
  _id: string;
  amount: number;
  reason: string;
  createdAt: string;
};

function formatDisplayDate(value?: string) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value);
}

function statusBadge(status?: string) {
  if (status === 'live') return <Badge className="rounded-md bg-green-50 text-green-700 border border-green-200">Live</Badge>;
  if (status === 'sold') return <Badge className="rounded-md bg-gray-100 text-gray-600 border border-gray-300">Sold Out</Badge>;
  if (status === 'pending') return <Badge className="rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200">Pending</Badge>;
  if (status === 'rejected') return <Badge className="rounded-md bg-red-50 text-red-600 border border-red-200">Rejected</Badge>;
  if (status === 'draft') return <Badge variant="secondary" className="rounded-md">Draft</Badge>;
  return null;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [uploads, setUploads] = useState<UserMaterial[]>([]);
  const [listings, setListings] = useState<UserListing[]>([]);
  const [creditLogs, setCreditLogs] = useState<CreditLog[]>([]);
  const [showCreditHistory, setShowCreditHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);

  // Edit states
  const [editingListing, setEditingListing] = useState<UserListing | null>(null);
  const [editListingData, setEditListingData] = useState({ title: '', price: 0, description: '', condition: '' });
  const [editingMaterial, setEditingMaterial] = useState<UserMaterial | null>(null);
  const [editMaterialData, setEditMaterialData] = useState({ title: '', description: '', downloadCost: 0 });

  const handleMarkAsSold = async (listingId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/me/marketplace/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'sold' })
      });
      if (response.ok) {
        setListings(prev => prev.map(item => item._id === listingId ? { ...item, status: 'sold' } : item));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateListing = async () => {
    if (!editingListing) return;
    try {
      const res = await fetch(`${API_BASE_URL}/me/marketplace/${editingListing._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editListingData)
      });
      if (res.ok) {
        setListings(prev => prev.map(i => i._id === editingListing._id ? { ...i, ...editListingData } : i));
        setEditingListing(null);
      }
    } catch(e) { console.error(e); }
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial) return;
    try {
      const res = await fetch(`${API_BASE_URL}/me/material/${editingMaterial._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editMaterialData)
      });
      if (res.ok) {
        setUploads(prev => prev.map(i => i._id === editingMaterial._id ? { ...i, ...editMaterialData } : i));
        setEditingMaterial(null);
      }
    } catch(e) { console.error(e); }
  };

  // Material pagination
  const [matPage, setMatPage] = useState(1);
  const [matTotal, setMatTotal] = useState(0);
  const MAT_LIMIT = 10;

  // Listing pagination
  const [listPage, setListPage] = useState(1);
  const [listTotal, setListTotal] = useState(0);
  const LIST_LIMIT = 10;

  const loadMaterials = async (page: number) => {
    const res = await fetch(`${API_BASE_URL}/me/material?page=${page}&limit=${MAT_LIMIT}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load materials');
    const data = await res.json();
    setUploads(data.items);
    setMatTotal(data.total);
  };

  const loadListings = async (page: number) => {
    const res = await fetch(`${API_BASE_URL}/me/marketplace?page=${page}&limit=${LIST_LIMIT}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load listings');
    const data = await res.json();
    setListings(data.items);
    setListTotal(data.total);
  };

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [profileResponse, materialsResponse, listingsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/me`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/me/material?page=1&limit=${MAT_LIMIT}`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/me/marketplace?page=1&limit=${LIST_LIMIT}`, { credentials: 'include' }),
        ]);

        if (profileResponse.status === 401) {
          setUser(null);
          return;
        }

        if (!profileResponse.ok || !materialsResponse.ok || !listingsResponse.ok) {
          throw new Error('Failed to load your profile data.');
        }

        const [profileData, materialsData, listingsData] = await Promise.all([
          profileResponse.json(),
          materialsResponse.json(),
          listingsResponse.json(),
        ]);

        setUser(profileData);
        // Backend now returns { items, total, page, limit }
        setUploads(materialsData.items ?? materialsData);
        setMatTotal(materialsData.total ?? materialsData.length);
        setListings(listingsData.items ?? listingsData);
        setListTotal(listingsData.total ?? listingsData.length);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load your profile data.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfileData();
  }, []);

  const loadCreditHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/credit/history`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCreditLogs(data.items ?? []);
      setShowCreditHistory(true);
    } catch {
      setErrorMessage('Failed to load credit history.');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!window.confirm('Delete this material from your profile?')) return;
    setDeletingMaterialId(materialId);
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/me/material/${materialId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.status === 401) { navigate('/auth'); return; }
      if (!response.ok) throw new Error('Failed to delete the material.');
      setUploads((prev) => prev.filter((item) => item._id !== materialId));
      setMatTotal((t) => t - 1);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete the material.');
    } finally {
      setDeletingMaterialId(null);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm('Delete this listing from your profile?')) return;
    setDeletingListingId(listingId);
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/me/marketplace/${listingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.status === 401) { navigate('/auth'); return; }
      if (!response.ok) throw new Error('Failed to delete the listing.');
      setListings((prev) => prev.filter((item) => item._id !== listingId));
      setListTotal((t) => t - 1);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete the listing.');
    } finally {
      setDeletingListingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-gray-100">
          <CardContent className="p-10 text-center space-y-4">
            <h1 className="text-2xl font-bold">Please log in to view your profile</h1>
            <p className="text-sm text-gray-500">
              Your uploads, listings, and account settings will appear here after you sign in.
            </p>
            <Link to="/auth" className="inline-block">
              <Button className="bg-black text-white hover:bg-gray-800">Go to login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() || user.username || user.email;
  const initials = `${user.firstname?.[0] ?? ''}${user.lastname?.[0] ?? ''}`.trim() || user.email[0]?.toUpperCase() || 'U';
  const matTotalPages = Math.ceil(matTotal / MAT_LIMIT);
  const listTotalPages = Math.ceil(listTotal / LIST_LIMIT);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {errorMessage ? (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ── Left sidebar ── */}
        <div className="lg:col-span-1">
          <Card className="border-gray-100 shadow-sm sticky top-24">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md mb-4">
                  <AvatarImage src={user.avatarUrl || getRandomAvatar(user.email)} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{fullName}</h2>
                {user.upi && <p className="text-sm text-gray-400 mb-1">UPI: {user.upi}</p>}
                <p className="text-sm text-gray-400 mb-4">{user.email}</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {user.bio?.trim() || 'Add a bio to introduce yourself to other students.'}
                </p>
                {user.createdAt && (
                  <p className="text-xs text-gray-400 mb-4">
                    Member since {new Date(user.createdAt).getFullYear()}
                  </p>
                )}
                <Link to="/profile/edit" className="w-full">
                  <Button variant="outline" className="w-full h-10 rounded-md font-bold text-sm">
                    <Edit2 size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>

              <div className="space-y-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <ShoppingBag size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Points Balance</p>
                      {/* Real creditBalance from backend */}
                      <p className="text-lg font-bold">{(user.creditBalance ?? 0).toLocaleString()} pts</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold"
                    onClick={() => void loadCreditHistory()}
                  >
                    <History size={14} className="mr-1" />
                    History
                  </Button>
                </div>

                {/* Credit History panel */}
                {showCreditHistory && (
                  <div className="space-y-3 mt-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase">Recent Transactions</h4>
                    {creditLogs.length === 0 ? (
                      <p className="text-xs text-gray-400">No transactions yet.</p>
                    ) : (
                      creditLogs.slice(0, 5).map((log) => (
                        <div key={log._id} className="flex justify-between text-xs">
                          <span className="text-gray-600 truncate max-w-[150px]">{log.reason}</span>
                          <span className={log.amount >= 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                            {log.amount >= 0 ? '+' : ''}{log.amount} pts
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right content ── */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="uploads" className="w-full">
            <div className="flex justify-between items-center mb-8">
              <TabsList className="bg-transparent border-b rounded-none h-auto p-0 gap-8">
                <TabsTrigger value="uploads" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-0 pb-4 font-bold text-base">
                  Materials ({matTotal})
                </TabsTrigger>
                <TabsTrigger value="listings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-0 pb-4 font-bold text-base">
                  Marketplace Items ({listTotal})
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/upload" className="w-full sm:w-auto">
                  <Button className="w-full bg-black text-white hover:bg-gray-800 font-bold shadow-md">
                    <Plus size={16} className="mr-2" />
                    Upload Material
                  </Button>
                </Link>
                <Link to="/create-listing" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full font-bold shadow-sm">
                    <ShoppingBag size={16} className="mr-2" />
                    Market Place
                  </Button>
                </Link>
              </div>
            </div>

            {/* Materials Tab */}
            <TabsContent value="uploads" className="mt-0 space-y-4">
              {uploads.map((item) => (
                <Card key={item._id} className="border-gray-100 hover:border-gray-300 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <FileText size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base">{item.title}</h3>
                          {statusBadge(item.status)}
                        </div>
                        <p className="text-xs text-gray-400">
                          {item.courseCode} • {item.fileType?.toUpperCase() ?? 'FILE'}
                          {item.fileSize && ` • ${item.fileSize}`}
                          {' '}• Uploaded {formatDisplayDate(item.createdAt)}
                        </p>
                        {item.downloadCost && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.downloadCost} pts to download</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium text-gray-500 hover:text-black"
                        onClick={() => {
                          setEditingMaterial(item);
                          setEditMaterialData({ title: item.title, description: item.description || '', downloadCost: item.downloadCost || 0 });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => void handleDeleteMaterial(item._id)}
                        disabled={deletingMaterialId === item._id}
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {uploads.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
                  <p className="text-gray-400">You haven't uploaded any materials yet.</p>
                </div>
              )}

              {/* Pagination */}
              {matTotalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={matPage === 1} onClick={() => { setMatPage(p => p - 1); void loadMaterials(matPage - 1); }}>Prev</Button>
                  <span className="text-sm px-3 py-1">{matPage} / {matTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={matPage === matTotalPages} onClick={() => { setMatPage(p => p + 1); void loadMaterials(matPage + 1); }}>Next</Button>
                </div>
              )}
            </TabsContent>

            {/* Marketplace Tab */}
            <TabsContent value="listings" className="mt-0 space-y-4">
              {listings.map((item) => (
                <Card key={item._id} className="border-gray-100 hover:border-gray-300 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-20 rounded-lg bg-gray-100 overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base">{item.title}</h3>
                          {statusBadge(item.status)}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold text-sm">{formatCurrency(item.price)}</span>
                          {item.category && <span className="text-xs text-gray-400">{item.category}</span>}
                          {item.condition && <span className="text-xs text-gray-400">{item.condition}</span>}
                          <span className="text-xs text-gray-400">Listed {formatDisplayDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/marketplace/${item._id}`}>
                        <Button variant="ghost" size="sm" className="text-sm font-medium">View</Button>
                      </Link>
                      {item.status !== 'sold' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm font-medium text-gray-500 hover:text-black"
                          onClick={() => void handleMarkAsSold(item._id)}
                        >
                          Mark Sold
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium text-gray-500 hover:text-black"
                        onClick={() => {
                          setEditingListing(item);
                          setEditListingData({ title: item.title, price: item.price, description: item.description || '', condition: item.condition || '' });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => void handleDeleteListing(item._id)}
                        disabled={deletingListingId === item._id}
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {listings.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
                  <p className="text-gray-400">You haven't created any listings yet.</p>
                </div>
              )}

              {/* Pagination */}
              {listTotalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={listPage === 1} onClick={() => { setListPage(p => p - 1); void loadListings(listPage - 1); }}>Prev</Button>
                  <span className="text-sm px-3 py-1">{listPage} / {listTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={listPage === listTotalPages} onClick={() => { setListPage(p => p + 1); void loadListings(listPage + 1); }}>Next</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* Dialogs */}
      <Dialog open={!!editingListing} onOpenChange={(open) => !open && setEditingListing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Listing</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editListingData.title} onChange={(e) => setEditListingData(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Price (NZD)</Label>
              <Input 
                type="number" 
                min="0"
                step="0.01"
                value={editListingData.price} 
                onChange={(e) => {
                  let val = parseFloat(e.target.value);
                  if (isNaN(val)) val = 0;
                  if (val < 0) val = 0;
                  setEditListingData(p => ({ ...p, price: val }));
                }} 
              />
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Input value={editListingData.condition} onChange={(e) => setEditListingData(p => ({ ...p, condition: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editListingData.description} onChange={(e) => setEditListingData(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingListing(null)}>Cancel</Button>
            <Button onClick={() => void handleUpdateListing()} className="bg-black text-white hover:bg-gray-800">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMaterial} onOpenChange={(open) => !open && setEditingMaterial(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Material</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editMaterialData.title} onChange={(e) => setEditMaterialData(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Download Cost (pts)</Label>
              <Input 
                type="number" 
                min="0"
                max="10000"
                step="1"
                value={editMaterialData.downloadCost} 
                onChange={(e) => {
                  let val = parseInt(e.target.value, 10);
                  if (isNaN(val)) val = 0;
                  if (val < 0) val = 0;
                  if (val > 10000) val = 10000;
                  setEditMaterialData(p => ({ ...p, downloadCost: val }));
                }} 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editMaterialData.description} onChange={(e) => setEditMaterialData(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMaterial(null)}>Cancel</Button>
            <Button onClick={() => void handleUpdateMaterial()} className="bg-black text-white hover:bg-gray-800">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
