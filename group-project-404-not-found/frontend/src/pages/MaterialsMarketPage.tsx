import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

type Material = {
  _id: string;
  title: string;
  courseCode: string;
  description?: string;
  fileType?: string;
  fileSize?: string;
  createdAt?: string;
  year?: number;
  downloadCost?: number;
  status?: string;
};

type CreditLog = {
  _id: string;
  amount: number;
  reason: string;
  createdAt: string;
};

function formatDate(value?: string) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-NZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MaterialsMarketPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [creditLogs, setCreditLogs] = useState<CreditLog[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState('');

  // Load user's credit balance
  useEffect(() => {
    fetch(`${API_BASE_URL}/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setUserBalance(data.creditBalance ?? 0);
        }
      })
      .catch(() => {});

    // Load recent credit history
    fetch(`${API_BASE_URL}/credit/history?limit=5`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : { items: [] })
      .then(data => setCreditLogs(data.items ?? []))
      .catch(() => {});
  }, []);

  // Load materials from API
  const loadMaterials = async (search = '', p = 1) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      params.set('page', p.toString());
      params.set('limit', '8');
      const response = await fetch(`${API_BASE_URL}/material?${params}`);
      if (!response.ok) throw new Error('Failed to load materials.');
      const data = await response.json();
      // Backend returns { items, total, page, limit }
      setMaterials(data.items ?? data);
      setTotal(data.total ?? (data.items ?? data).length);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load materials.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadMaterials('', 1); }, []);

  const handleSearch = () => {
    setPage(1);
    void loadMaterials(searchQuery, 1);
  };

  const handleDownload = async (material: Material) => {
    setDownloadingId(material._id);
    setDownloadError('');
    try {
      const response = await fetch(`${API_BASE_URL}/material/${material._id}/download`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status === 401) {
        navigate('/auth');
        return;
      }

      if (response.status === 402) {
        const data = await response.json();
        setDownloadError(`Insufficient credits. You need ${data.required} pts but have ${data.available} pts.`);
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setDownloadError(data.error ?? 'Download failed.');
        return;
      }

      const { fileUrl } = await response.json();

      // Update local balance
      const cost = material.downloadCost ?? 500;
      setUserBalance(prev => prev !== null ? prev - cost : null);

      // Trigger actual file download
      if (fileUrl) {
        window.open(fileUrl, '_blank');
      }

      // Refresh credit logs
      fetch(`${API_BASE_URL}/credit/history?limit=5`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : { items: [] })
        .then(data => setCreditLogs(data.items ?? []))
        .catch(() => {});

    } catch {
      setDownloadError('Unable to connect to the server.');
    } finally {
      setDownloadingId(null);
    }
  };

  const totalPages = Math.ceil(total / 8) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search by course code or material title..."
              className="pl-12 h-14 border-gray-200 shadow-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            className="h-14 px-10 bg-black text-white hover:bg-gray-800 text-lg font-medium"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      {downloadError ? (
        <div className="mb-6 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {downloadError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Materials List */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Materials</h2>
            <span className="text-sm text-gray-400">
              {isLoading ? 'Loading...' : `Showing ${total} result${total === 1 ? '' : 's'}`}
            </span>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
              Loading materials...
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((item) => (
                <Card key={item._id} className="border-gray-100 hover:border-gray-300 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-lg overflow-hidden border flex-shrink-0 bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-xs">
                        {(item.fileType ?? 'FILE').slice(0, 4).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-base mb-1">{item.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          <Badge variant="outline" className="rounded-md h-6 px-2 font-bold">{item.courseCode}</Badge>
                          {item.year ? <span>{item.year}</span> : null}
                          {item.fileSize && <span>{item.fileSize}</span>}
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        {item.description ? (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Real downloadCost from backend */}
                      <span className="font-bold text-sm whitespace-nowrap">
                        {item.downloadCost ?? 500} pts
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-black"
                        disabled={downloadingId === item._id}
                        onClick={() => void handleDownload(item)}
                        title="Download (costs pts)"
                      >
                        {downloadingId === item._id ? (
                          <div className="h-4 w-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                        ) : (
                          <Download size={24} />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {materials.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
                  <p className="text-gray-400">No materials match your current search.</p>
                </div>
              ) : null}

              {!isLoading && totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button variant="outline" disabled={page === 1} onClick={() => { setPage(p => p - 1); void loadMaterials(searchQuery, page - 1); }}>Prev</Button>
                  <span className="flex items-center px-4 font-medium text-sm">{page} / {totalPages}</span>
                  <Button variant="outline" disabled={page === totalPages} onClick={() => { setPage(p => p + 1); void loadMaterials(searchQuery, page + 1); }}>Next</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel — Real credit balance & history */}
        <div className="lg:col-span-1">
          <Card className="border-gray-100 shadow-sm sticky top-24">
            <CardContent className="p-8">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Points Balance</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-4xl font-bold">
                  {userBalance !== null ? userBalance.toLocaleString() : '—'} pts
                </span>
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Wallet size={24} className="text-gray-600" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                {userBalance !== null ? 'Available balance' : 'Log in to see your balance'}
              </p>

              {creditLogs.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-bold">Recent Transactions</h4>
                  {creditLogs.map((log) => (
                    <div key={log._id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate max-w-[140px]">{log.reason}</span>
                      <span className={log.amount >= 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                        {log.amount >= 0 ? '+' : ''}{log.amount} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 text-sm text-gray-600">
                <p>Each download costs the pts listed next to the material.</p>
                <p>Upload study resources to earn pts when your upload is approved.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
