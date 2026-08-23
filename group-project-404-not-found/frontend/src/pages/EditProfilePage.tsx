import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Camera, Check, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const DEFAULT_AVATARS = [
  `${API_BASE_URL}/images/Asset 2.png`,
  `${API_BASE_URL}/images/Asset 3.png`,
  `${API_BASE_URL}/images/Asset 4.png`,
  `${API_BASE_URL}/images/Asset 6.png`,
  `${API_BASE_URL}/images/Asset 7.png`,
];

type EditableProfile = {
  id: number;
  username: string;
  email: string;
  firstname?: string;
  lastname?: string;
  avatarUrl?: string;
  bio?: string;
  upi?: string;
  phone?: string;

  notifPrefs?: { email: boolean; push: boolean; sms: boolean };
};

export default function EditProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<EditableProfile | null>(null);

  // Profile fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [upi, setUpi] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: false, sms: false });

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/me`, { credentials: 'include' });
        if (response.status === 401) { navigate('/auth'); return; }
        if (!response.ok) throw new Error('Unable to load your profile.');

        const data: EditableProfile = await response.json();
        setProfile(data);
        setFirstName(data.firstname ?? '');
        setLastName(data.lastname ?? '');
        setBio(data.bio ?? '');
        setPhone(data.phone ?? '');
        setUpi(data.upi ?? '');
        setAvatarUrl(data.avatarUrl ?? '');

        setNotifPrefs(data.notifPrefs ?? { email: true, push: false, sms: false });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load your profile.');
      } finally {
        setIsLoading(false);
      }
    };
    void loadProfile();
  }, [navigate]);

  // ── Profile save ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!upi.trim() || !phone.trim()) {
      setErrorMessage('UPI and Phone Number are required fields.');
      return;
    }
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: firstName.trim() || undefined,
          lastname: lastName.trim() || undefined,
          bio: bio.trim(),
          phone: phone.trim() || null,
          upi: upi.trim() || null,
          avatarUrl: avatarUrl || undefined,
          notifPrefs,
        }),
      });

      if (response.status === 401) { navigate('/auth'); return; }
      const data = await response.json().catch(() => null);
      if (!response.ok) { setErrorMessage(data?.error ?? 'Unable to save your profile.'); return; }

      window.dispatchEvent(new CustomEvent('profile-updated', { detail: data }));
      setSuccessMessage('Profile saved successfully!');
      setTimeout(() => { setSuccessMessage(''); navigate('/profile'); }, 1500);
    } catch {
      setErrorMessage('Unable to save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Password change ──────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPwError('');
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwError('All password fields are required.'); return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError('New passwords do not match.'); return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.'); return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/me/password`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.status === 401) { setPwError('Current password is incorrect.'); return; }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setPwError(d.error ?? 'Failed to change password.'); return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setPwError('Unable to connect to the server.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
          Loading your profile...
        </div>
      </div>
    );
  }

  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.trim() || profile?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-500 hover:text-black">
          <ArrowLeft size={16} />
          Back to profile
        </Link>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <div className="w-20" />
      </div>

      <div className="space-y-8">
        {errorMessage && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div>
        )}

        {/* Avatar Selection */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold">Profile Picture</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {DEFAULT_AVATARS.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`relative rounded-full overflow-hidden h-20 w-20 border-4 transition-all ${avatarUrl === url ? 'border-black scale-110' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Check className="text-white" size={24} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">Select an avatar from the default collection. If none is selected, one will be automatically generated based on your email.</p>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstname">First Name</Label>
                <Input id="firstname" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-11 border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input id="lastname" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-11 border-gray-200" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="upi">UPI / Student ID <span className="text-red-500">*</span></Label>
                <Input id="upi" placeholder="e.g. u1234567" value={upi} onChange={(e) => setUpi(e.target.value)} className="h-11 border-gray-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                <Input id="phone" placeholder="+64 21 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 border-gray-200" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell other students about yourself, your courses, or items you're looking for."
                className="min-h-[120px] border-gray-200 resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs text-gray-400 text-right">{bio.length} / 200 characters</p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold">Notification Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(['email', 'push', 'sms'] as const).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{key} notifications</span>
                <input
                  type="checkbox"
                  checked={notifPrefs[key]}
                  onChange={(e) => setNotifPrefs(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold">Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {pwError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{pwError}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="current-pw">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="h-11 border-gray-200 pr-10"
                />
                <button type="button" onClick={() => setShowCurrentPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="h-11 border-gray-200 pr-10"
                />
                <button type="button" onClick={() => setShowNewPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="h-11 border-gray-200"
              />
              {confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
            <Button
              variant="outline"
              className="h-11 font-bold"
              onClick={() => void handleChangePassword()}
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Save / Cancel */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="flex-grow h-12 bg-black text-white hover:bg-gray-800 font-bold text-base"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/profile')} className="h-12 px-8 font-bold text-base">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
