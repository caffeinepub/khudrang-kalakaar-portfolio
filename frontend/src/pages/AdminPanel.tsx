import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LogOut,
  Upload,
  Trash2,
  Edit3,
  Plus,
  Image,
  Type,
  Share2,
  Loader2,
  Shield,
  X,
} from 'lucide-react';
import {
  useGetAllArtworks,
  useUploadArtwork,
  useEditArtwork,
  useDeleteArtwork,
  useUploadLogo,
  useUploadCoverImage,
  useUploadArtistPortrait,
  useUpdateTextContent,
  useUpdateMediaContacts,
  useTextContent,
  useMediaContacts,
} from '../hooks/useQueries';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArtworkFormData {
  title: string;
  description: string;
  imageFile: File | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileToUint8Array(file: File): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) =>
      resolve(new Uint8Array(e.target?.result as ArrayBuffer) as Uint8Array<ArrayBuffer>);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ArtworkCard({
  artwork,
  onEdit,
  onDelete,
  isDeleting,
}: {
  artwork: any;
  onEdit: (artwork: any) => void;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}) {
  const imageUrl = React.useMemo(() => {
    if (!artwork.image || artwork.image.length === 0) return null;
    const blob = new Blob([new Uint8Array(artwork.image)], {
      type: artwork.imageFormat || 'image/jpeg',
    });
    return URL.createObjectURL(blob);
  }, [artwork.image, artwork.imageFormat]);

  return (
    <div className="bg-white border border-warm-border rounded-xl overflow-hidden shadow-sm hover:shadow-warm transition-shadow">
      {imageUrl ? (
        <img src={imageUrl} alt={artwork.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-cream flex items-center justify-center">
          <Image className="w-8 h-8 text-charcoal/30" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-charcoal text-sm truncate">{artwork.title}</h3>
        <p className="text-charcoal/60 text-xs mt-1 line-clamp-2">{artwork.description}</p>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(artwork)}
            className="flex-1 text-charcoal border-warm-border hover:bg-cream"
          >
            <Edit3 className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(artwork.id)}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const navigate = useNavigate();
  const { clear, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  // Auth guard state
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verify admin on mount
  useEffect(() => {
    if (isInitializing || actorFetching || !actor) return;

    if (!identity) {
      navigate({ to: '/admin-login' });
      return;
    }

    const verify = async () => {
      try {
        const adminStatus = await actor.isCallerAdmin();
        if (adminStatus) {
          setIsAdmin(true);
          setAuthChecked(true);
        } else {
          toast.error('Access denied. Admin privileges required.');
          navigate({ to: '/admin-login' });
        }
      } catch {
        toast.error('Failed to verify admin status.');
        navigate({ to: '/admin-login' });
      }
    };

    verify();
  }, [identity, actor, actorFetching, isInitializing]);

  const handleLogout = async () => {
    await clear();
    navigate({ to: '/' });
  };

  // ── Data hooks ──────────────────────────────────────────────────
  const { data: artworks = [], isLoading: artworksLoading } = useGetAllArtworks();
  const { data: textContent, isLoading: textLoading } = useTextContent();
  const { data: mediaContacts, isLoading: contactsLoading } = useMediaContacts();

  // ── Mutation hooks ──────────────────────────────────────────────
  const uploadArtwork = useUploadArtwork();
  const editArtwork = useEditArtwork();
  const deleteArtwork = useDeleteArtwork();
  const uploadLogo = useUploadLogo();
  const uploadCoverImage = useUploadCoverImage();
  const uploadArtistPortrait = useUploadArtistPortrait();
  const updateTextContent = useUpdateTextContent();
  const updateMediaContacts = useUpdateMediaContacts();

  // ── Artwork form state ──────────────────────────────────────────
  const [artworkForm, setArtworkForm] = useState<ArtworkFormData>({
    title: '',
    description: '',
    imageFile: null,
  });
  const [editingArtwork, setEditingArtwork] = useState<any | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

  // ── Text content state ──────────────────────────────────────────
  const [artistName, setArtistName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');

  // ── Media contacts state ────────────────────────────────────────
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');

  // ── Image upload progress ───────────────────────────────────────
  const [logoProgress, setLogoProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [portraitProgress, setPortraitProgress] = useState(0);

  // Populate text content form
  useEffect(() => {
    if (textContent) {
      setArtistName(textContent.artistName);
      setTagline(textContent.tagline);
      setBio(textContent.bio);
    }
  }, [textContent]);

  // Populate media contacts form
  useEffect(() => {
    if (mediaContacts) {
      setWhatsapp(mediaContacts.whatsappNumber);
      setInstagram(mediaContacts.instagramProfile);
    }
  }, [mediaContacts]);

  // ── Artwork handlers ────────────────────────────────────────────

  const handleArtworkImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArtworkForm((prev) => ({ ...prev, imageFile: file }));
    const url = URL.createObjectURL(file);
    setArtworkPreview(url);
  };

  const handleStartEdit = (artwork: any) => {
    setEditingArtwork(artwork);
    setArtworkForm({ title: artwork.title, description: artwork.description, imageFile: null });
    setArtworkPreview(null);
  };

  const handleCancelEdit = () => {
    setEditingArtwork(null);
    setArtworkForm({ title: '', description: '', imageFile: null });
    setArtworkPreview(null);
  };

  const handleSaveArtwork = async () => {
    if (!artworkForm.title.trim()) {
      toast.error('Please enter a title for the artwork.');
      return;
    }

    try {
      if (editingArtwork) {
        let imageBytes = new Uint8Array(0) as Uint8Array<ArrayBuffer>;
        let format: string | null = null;
        let fileName: string | null = null;
        if (artworkForm.imageFile) {
          imageBytes = await fileToUint8Array(artworkForm.imageFile);
          format = artworkForm.imageFile.type || null;
          fileName = artworkForm.imageFile.name || null;
        }
        await editArtwork.mutateAsync({
          id: editingArtwork.id,
          title: artworkForm.title,
          description: artworkForm.description,
          imageBytes,
          format,
          fileName,
        });
        toast.success('Artwork updated successfully!');
        handleCancelEdit();
      } else {
        if (!artworkForm.imageFile) {
          toast.error('Please select an image for the artwork.');
          return;
        }
        const imageBytes = await fileToUint8Array(artworkForm.imageFile);
        await uploadArtwork.mutateAsync({
          title: artworkForm.title,
          description: artworkForm.description,
          imageBytes,
          format: artworkForm.imageFile.type || null,
          fileName: artworkForm.imageFile.name || null,
        });
        toast.success('Artwork uploaded successfully!');
        setArtworkForm({ title: '', description: '', imageFile: null });
        setArtworkPreview(null);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save artwork.');
    }
  };

  const handleDeleteArtwork = async (id: bigint) => {
    try {
      await deleteArtwork.mutateAsync(id);
      toast.success('Artwork deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete artwork.');
    }
  };

  // ── Image upload handlers ───────────────────────────────────────

  const handleImageUpload = async (
    file: File,
    mutate: (params: { bytes: Uint8Array<ArrayBuffer>; onProgress?: (pct: number) => void }) => Promise<void>,
    setProgress: (p: number) => void,
    label: string
  ) => {
    try {
      const bytes = await fileToUint8Array(file);
      await mutate({
        bytes,
        onProgress: (pct) => setProgress(pct),
      });
      setProgress(0);
      toast.success(`${label} uploaded successfully!`);
    } catch (err: any) {
      setProgress(0);
      toast.error(err?.message || `Failed to upload ${label}.`);
    }
  };

  // ── Text content handler ────────────────────────────────────────

  const handleSaveTextContent = async () => {
    try {
      await updateTextContent.mutateAsync({ artistName, tagline, bio });
      toast.success('Text content saved successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save text content.');
    }
  };

  // ── Media contacts handler ──────────────────────────────────────

  const handleSaveMediaContacts = async () => {
    try {
      await updateMediaContacts.mutateAsync({
        whatsappNumber: whatsapp,
        instagramProfile: instagram,
      });
      toast.success('Social media links saved successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save social media links.');
    }
  };

  // ── Loading / auth guard ────────────────────────────────────────

  if (isInitializing || actorFetching || (!authChecked && identity)) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-terracotta mx-auto mb-4" />
          <p className="text-charcoal/70 font-medium">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-warm-border shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-terracotta flex items-center justify-center">
              <Shield className="w-5 h-5 text-cream" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-charcoal">Admin Panel</h1>
              <p className="text-xs text-charcoal/50">Portfolio Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm text-charcoal/60 hover:text-terracotta transition-colors hidden sm:block"
            >
              View Site
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-warm-border text-charcoal hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="gallery" className="space-y-6">
          <TabsList className="bg-white border border-warm-border rounded-xl p-1 shadow-sm">
            <TabsTrigger
              value="gallery"
              className="data-[state=active]:bg-terracotta data-[state=active]:text-cream text-charcoal rounded-lg font-medium"
            >
              <Image className="w-4 h-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger
              value="site-images"
              className="data-[state=active]:bg-terracotta data-[state=active]:text-cream text-charcoal rounded-lg font-medium"
            >
              <Upload className="w-4 h-4 mr-2" />
              Site Images
            </TabsTrigger>
            <TabsTrigger
              value="text-content"
              className="data-[state=active]:bg-terracotta data-[state=active]:text-cream text-charcoal rounded-lg font-medium"
            >
              <Type className="w-4 h-4 mr-2" />
              Text Content
            </TabsTrigger>
            <TabsTrigger
              value="social-links"
              className="data-[state=active]:bg-terracotta data-[state=active]:text-cream text-charcoal rounded-lg font-medium"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Social Links
            </TabsTrigger>
          </TabsList>

          {/* ── Gallery Tab ── */}
          <TabsContent value="gallery" className="space-y-6">
            {/* Add / Edit Form */}
            <div className="bg-white border border-warm-border rounded-2xl p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-charcoal mb-5">
                {editingArtwork ? 'Edit Artwork' : 'Add New Artwork'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="artwork-title" className="text-charcoal font-medium text-sm">
                      Title *
                    </Label>
                    <Input
                      id="artwork-title"
                      value={artworkForm.title}
                      onChange={(e) =>
                        setArtworkForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Artwork title"
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal/40 focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="artwork-description"
                      className="text-charcoal font-medium text-sm"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="artwork-description"
                      value={artworkForm.description}
                      onChange={(e) =>
                        setArtworkForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Describe this artwork…"
                      rows={4}
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal/40 focus:border-terracotta resize-none"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-charcoal font-medium text-sm">
                    {editingArtwork ? 'Replace Image (optional)' : 'Image *'}
                  </Label>
                  <label className="mt-1 flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-warm-border rounded-xl cursor-pointer hover:border-terracotta hover:bg-terracotta/5 transition-colors">
                    {artworkPreview ? (
                      <img
                        src={artworkPreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="w-8 h-8 text-charcoal/30 mx-auto mb-2" />
                        <p className="text-sm text-charcoal/50">Click to upload image</p>
                        <p className="text-xs text-charcoal/30 mt-1">PNG, JPG, WEBP</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleArtworkImageChange}
                    />
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button
                  onClick={handleSaveArtwork}
                  disabled={uploadArtwork.isPending || editArtwork.isPending}
                  className="bg-terracotta hover:bg-terracotta/90 text-cream font-semibold"
                >
                  {uploadArtwork.isPending || editArtwork.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {editingArtwork ? 'Update Artwork' : 'Add Artwork'}
                    </>
                  )}
                </Button>
                {editingArtwork && (
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="border-warm-border text-charcoal hover:bg-cream"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Artwork Grid */}
            <div>
              <h2 className="font-display text-lg font-bold text-charcoal mb-4">
                Artworks ({artworks.length})
              </h2>
              {artworksLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-56 rounded-xl" />
                  ))}
                </div>
              ) : artworks.length === 0 ? (
                <div className="text-center py-16 bg-white border border-warm-border rounded-2xl">
                  <Image className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
                  <p className="text-charcoal/50 font-medium">No artworks yet</p>
                  <p className="text-charcoal/30 text-sm mt-1">Add your first artwork above</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artworks.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id.toString()}
                      artwork={artwork}
                      onEdit={handleStartEdit}
                      onDelete={handleDeleteArtwork}
                      isDeleting={deleteArtwork.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Site Images Tab ── */}
          <TabsContent value="site-images" className="space-y-5">
            {[
              {
                label: 'Logo',
                description: 'Site logo displayed in navigation and footer',
                progress: logoProgress,
                isPending: uploadLogo.isPending,
                onUpload: (file: File) =>
                  handleImageUpload(
                    file,
                    (params) => uploadLogo.mutateAsync(params),
                    setLogoProgress,
                    'Logo'
                  ),
              },
              {
                label: 'Cover / Hero Image',
                description: 'Full-screen background image for the hero section',
                progress: coverProgress,
                isPending: uploadCoverImage.isPending,
                onUpload: (file: File) =>
                  handleImageUpload(
                    file,
                    (params) => uploadCoverImage.mutateAsync(params),
                    setCoverProgress,
                    'Cover image'
                  ),
              },
              {
                label: 'Artist Portrait',
                description: 'Portrait photo displayed in the About section',
                progress: portraitProgress,
                isPending: uploadArtistPortrait.isPending,
                onUpload: (file: File) =>
                  handleImageUpload(
                    file,
                    (params) => uploadArtistPortrait.mutateAsync(params),
                    setPortraitProgress,
                    'Artist portrait'
                  ),
              },
            ].map(({ label, description, progress, isPending, onUpload }) => (
              <div
                key={label}
                className="bg-white border border-warm-border rounded-2xl p-6 shadow-sm"
              >
                <h3 className="font-display text-base font-bold text-charcoal">{label}</h3>
                <p className="text-charcoal/60 text-sm mt-1 mb-4">{description}</p>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <div className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading {progress > 0 ? `${Math.round(progress)}%` : '…'}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload {label}
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isPending}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onUpload(file);
                    }}
                  />
                </label>
                {progress > 0 && (
                  <div className="mt-3 w-full bg-cream rounded-full h-2">
                    <div
                      className="bg-terracotta h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* ── Text Content Tab ── */}
          <TabsContent value="text-content">
            <div className="bg-white border border-warm-border rounded-2xl p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-charcoal mb-5">
                Text Content
              </h2>
              {textLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-28 w-full rounded-lg" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="artist-name" className="text-charcoal font-medium text-sm">
                      Artist Name
                    </Label>
                    <Input
                      id="artist-name"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      placeholder="Your name"
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal/40 focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline" className="text-charcoal font-medium text-sm">
                      Tagline
                    </Label>
                    <Input
                      id="tagline"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Your tagline or motto"
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal/40 focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio" className="text-charcoal font-medium text-sm">
                      Bio / About
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write your bio here…"
                      rows={6}
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal/40 focus:border-terracotta resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleSaveTextContent}
                    disabled={updateTextContent.isPending}
                    className="bg-terracotta hover:bg-terracotta/90 text-cream font-semibold"
                  >
                    {updateTextContent.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      'Save Text Content'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Social Links Tab ── */}
          <TabsContent value="social-links">
            <div className="bg-white border border-warm-border rounded-2xl p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-charcoal mb-5">
                Social Media Links
              </h2>
              {contactsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="whatsapp" className="text-charcoal font-medium text-sm">
                      WhatsApp Number
                    </Label>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal/40 focus:border-terracotta"
                    />
                    <p className="text-xs text-charcoal/50 mt-1">
                      Include country code, e.g. +91 98765 43210
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="instagram" className="text-charcoal font-medium text-sm">
                      Instagram Profile URL
                    </Label>
                    <Input
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal/40 focus:border-terracotta"
                    />
                  </div>
                  <Button
                    onClick={handleSaveMediaContacts}
                    disabled={updateMediaContacts.isPending}
                    className="bg-terracotta hover:bg-terracotta/90 text-cream font-semibold"
                  >
                    {updateMediaContacts.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      'Save Social Links'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
