import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActor } from '../hooks/useActor';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  LogOut,
  Upload,
  Trash2,
  Edit3,
  Image,
  Share2,
  Loader2,
  Shield,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  useGetAllArtworks,
  useUploadArtwork,
  useEditArtwork,
  useDeleteArtwork,
  useUploadLogo,
  useUploadCoverImage,
  useUploadArtistPortrait,
  useUpdateMediaContacts,
  useMediaContacts,
} from '../hooks/useQueries';
import { isAdminSessionValid, clearAdminSession, getAdminCredentials } from '../lib/adminAuth';

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

function isUnauthorizedError(err: unknown): boolean {
  const msg = (err as any)?.message || String(err);
  return msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('only admins');
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
          <Image className="w-8 h-8 text-charcoal-light" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-charcoal text-sm truncate">{artwork.title}</h3>
        <p className="text-charcoal-medium text-xs mt-1 line-clamp-2">{artwork.description}</p>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(artwork)}
            className="flex-1 text-charcoal border-warm-border hover:bg-cream hover:text-terracotta"
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

function ImageUploadCard({
  title,
  description,
  progress,
  onUpload,
  isPending,
}: {
  title: string;
  description: string;
  progress: number;
  onUpload: (file: File) => void;
  isPending: boolean;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="bg-white border border-warm-border rounded-2xl p-6 shadow-sm">
      <h3 className="font-display text-base font-bold text-charcoal mb-1">{title}</h3>
      <p className="text-charcoal-medium text-sm mb-4">{description}</p>
      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-warm-border rounded-xl cursor-pointer hover:border-terracotta hover:bg-terracotta/5 transition-colors">
        {isPending ? (
          <div className="text-center p-4">
            <Loader2 className="w-8 h-8 text-terracotta mx-auto mb-2 animate-spin" />
            <p className="text-sm text-charcoal-medium font-medium">
              Uploading… {progress > 0 ? `${progress}%` : ''}
            </p>
          </div>
        ) : (
          <div className="text-center p-4">
            <Upload className="w-8 h-8 text-charcoal-light mx-auto mb-2" />
            <p className="text-sm text-charcoal-medium font-medium">Click to upload</p>
            <p className="text-xs text-charcoal-light mt-1">PNG, JPG, WEBP</p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={isPending}
        />
      </label>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const navigate = useNavigate();
  const { actor, isFetching: actorFetching } = useActor();

  // Auth guard — check local session
  const [authChecked, setAuthChecked] = useState(false);

  // Backend auth state — tracks whether loginWithPassword has been called
  const [backendAuthReady, setBackendAuthReady] = useState(false);
  const [backendAuthError, setBackendAuthError] = useState<string | null>(null);
  const backendAuthAttempted = useRef(false);

  useEffect(() => {
    if (!isAdminSessionValid()) {
      navigate({ to: '/admin-login' });
    } else {
      setAuthChecked(true);
    }
  }, []);

  // Once the actor is ready, call loginWithPassword to authenticate with the backend
  useEffect(() => {
    if (!actor || actorFetching || !authChecked || backendAuthAttempted.current) return;

    backendAuthAttempted.current = true;
    const { username, password } = getAdminCredentials();

    actor
      .loginWithPassword(username, password)
      .then(() => {
        setBackendAuthReady(true);
        setBackendAuthError(null);
      })
      .catch((err: unknown) => {
        const msg = (err as any)?.message || String(err);
        setBackendAuthError(`Backend authentication failed: ${msg}`);
        setBackendAuthReady(false);
      });
  }, [actor, actorFetching, authChecked]);

  /**
   * Re-authenticates with the backend if a mutation fails with an Unauthorized error.
   * Returns true if re-auth succeeded.
   */
  const reAuthIfNeeded = async (err: unknown): Promise<boolean> => {
    if (!isUnauthorizedError(err) || !actor) return false;
    try {
      const { username, password } = getAdminCredentials();
      await actor.loginWithPassword(username, password);
      setBackendAuthReady(true);
      return true;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    if (actor) {
      actor.logout().catch(() => {/* ignore */});
    }
    clearAdminSession();
    navigate({ to: '/admin-login' });
  };

  // ── Data hooks ──────────────────────────────────────────────────
  const { data: artworks = [], isLoading: artworksLoading } = useGetAllArtworks();
  const { data: mediaContacts, isLoading: contactsLoading } = useMediaContacts();

  // ── Mutation hooks ──────────────────────────────────────────────
  const uploadArtwork = useUploadArtwork();
  const editArtwork = useEditArtwork();
  const deleteArtwork = useDeleteArtwork();
  const uploadLogo = useUploadLogo();
  const uploadCoverImage = useUploadCoverImage();
  const uploadArtistPortrait = useUploadArtistPortrait();
  const updateMediaContacts = useUpdateMediaContacts();

  // ── Artwork form state ──────────────────────────────────────────
  const [artworkForm, setArtworkForm] = useState<ArtworkFormData>({
    title: '',
    description: '',
    imageFile: null,
  });
  const [editingArtwork, setEditingArtwork] = useState<any | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

  // ── Media contacts state ────────────────────────────────────────
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');

  // ── Image upload progress ───────────────────────────────────────
  const [logoProgress, setLogoProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [portraitProgress, setPortraitProgress] = useState(0);

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
        const params = {
          id: editingArtwork.id,
          title: artworkForm.title,
          description: artworkForm.description,
          imageBytes,
          format,
          fileName,
        };
        try {
          await editArtwork.mutateAsync(params);
        } catch (err) {
          if (await reAuthIfNeeded(err)) {
            await editArtwork.mutateAsync(params);
          } else {
            throw err;
          }
        }
        toast.success('Artwork updated successfully!');
        handleCancelEdit();
      } else {
        if (!artworkForm.imageFile) {
          toast.error('Please select an image for the artwork.');
          return;
        }
        const imageBytes = await fileToUint8Array(artworkForm.imageFile);
        const params = {
          title: artworkForm.title,
          description: artworkForm.description,
          imageBytes,
          format: artworkForm.imageFile.type || null,
          fileName: artworkForm.imageFile.name || null,
        };
        try {
          await uploadArtwork.mutateAsync(params);
        } catch (err) {
          if (await reAuthIfNeeded(err)) {
            await uploadArtwork.mutateAsync(params);
          } else {
            throw err;
          }
        }
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
      try {
        await deleteArtwork.mutateAsync(id);
      } catch (err) {
        if (await reAuthIfNeeded(err)) {
          await deleteArtwork.mutateAsync(id);
        } else {
          throw err;
        }
      }
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
      const params = {
        bytes,
        onProgress: (pct: number) => setProgress(pct),
      };
      try {
        await mutate(params);
      } catch (err) {
        if (await reAuthIfNeeded(err)) {
          await mutate(params);
        } else {
          throw err;
        }
      }
      setProgress(0);
      toast.success(`${label} uploaded successfully!`);
    } catch (err: any) {
      setProgress(0);
      toast.error(err?.message || `Failed to upload ${label}.`);
    }
  };

  // ── Media contacts handler ──────────────────────────────────────

  const handleSaveMediaContacts = async () => {
    const params = {
      whatsappNumber: whatsapp,
      instagramProfile: instagram,
    };
    try {
      try {
        await updateMediaContacts.mutateAsync(params);
      } catch (err) {
        if (await reAuthIfNeeded(err)) {
          await updateMediaContacts.mutateAsync(params);
        } else {
          throw err;
        }
      }
      toast.success('Social media links saved successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save social media links.');
    }
  };

  // ── Loading / auth guard ────────────────────────────────────────

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-terracotta mx-auto mb-4" />
          <p className="text-charcoal-medium font-medium">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  // Show loading while actor is initializing or backend auth is in progress
  if (actorFetching || (!backendAuthReady && !backendAuthError)) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-terracotta mx-auto mb-4" />
          <p className="text-charcoal-medium font-medium">Connecting to backend…</p>
        </div>
      </div>
    );
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
              <p className="text-xs text-charcoal-medium">Portfolio Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-charcoal-medium bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-700 font-medium">kumawatdeepak2004@gmail.com</span>
            </div>
            <a
              href="/"
              className="text-sm text-charcoal-medium hover:text-terracotta transition-colors hidden sm:block font-medium"
            >
              View Site
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-warm-border text-charcoal font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Backend auth error banner */}
        {backendAuthError && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm font-semibold">Backend Authentication Error</p>
              <p className="text-red-600 text-xs mt-0.5">{backendAuthError}</p>
              <button
                className="mt-2 text-xs text-red-700 underline font-medium"
                onClick={() => {
                  backendAuthAttempted.current = false;
                  setBackendAuthError(null);
                  setBackendAuthReady(false);
                  if (actor) {
                    const { username, password } = getAdminCredentials();
                    actor
                      .loginWithPassword(username, password)
                      .then(() => {
                        setBackendAuthReady(true);
                        setBackendAuthError(null);
                      })
                      .catch((err: unknown) => {
                        const msg = (err as any)?.message || String(err);
                        setBackendAuthError(`Backend authentication failed: ${msg}`);
                      });
                  }
                }}
              >
                Retry authentication
              </button>
            </div>
          </div>
        )}

        <Tabs defaultValue="gallery" className="space-y-6">
          <TabsList className="bg-white border border-warm-border rounded-xl p-1 shadow-sm flex-wrap h-auto gap-1">
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
                    <Label htmlFor="artwork-title" className="text-charcoal font-semibold text-sm">
                      Title *
                    </Label>
                    <Input
                      id="artwork-title"
                      value={artworkForm.title}
                      onChange={(e) =>
                        setArtworkForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Artwork title"
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal-light focus:border-terracotta bg-white"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="artwork-description"
                      className="text-charcoal font-semibold text-sm"
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
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal-light focus:border-terracotta resize-none bg-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-charcoal font-semibold text-sm">
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
                        <Upload className="w-8 h-8 text-charcoal-light mx-auto mb-2" />
                        <p className="text-sm text-charcoal-medium font-medium">Click to upload image</p>
                        <p className="text-xs text-charcoal-light mt-1">PNG, JPG, WEBP</p>
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
                  disabled={
                    uploadArtwork.isPending ||
                    editArtwork.isPending ||
                    !backendAuthReady
                  }
                  className="bg-terracotta hover:bg-terracotta/90 text-cream font-semibold disabled:opacity-60"
                >
                  {uploadArtwork.isPending || editArtwork.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : editingArtwork ? (
                    'Update Artwork'
                  ) : (
                    'Upload Artwork'
                  )}
                </Button>
                {editingArtwork && (
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="border-warm-border text-charcoal hover:bg-cream"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Artwork Grid */}
            <div className="bg-white border border-warm-border rounded-2xl p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-charcoal mb-5">
                Artwork Gallery
                <span className="ml-2 text-sm font-normal text-charcoal-medium">
                  ({artworks.length} items)
                </span>
              </h2>
              {artworksLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden">
                      <div className="w-full h-40 bg-cream animate-pulse" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-cream rounded animate-pulse" />
                        <div className="h-3 bg-cream rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : artworks.length === 0 ? (
                <div className="text-center py-16">
                  <Image className="w-12 h-12 text-charcoal-light mx-auto mb-3" />
                  <p className="text-charcoal-medium font-medium">No artworks yet</p>
                  <p className="text-charcoal-light text-sm mt-1">
                    Add your first artwork using the form above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artworks.map((artwork) => (
                    <ArtworkCard
                      key={String(artwork.id)}
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
          <TabsContent value="site-images" className="space-y-6">
            <div className="bg-white border border-warm-border rounded-2xl p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-charcoal mb-1">Site Images</h2>
              <p className="text-charcoal-medium text-sm mb-6">
                Upload images that appear across your portfolio website.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ImageUploadCard
                  title="Logo"
                  description="Your brand logo displayed in the navigation and footer."
                  progress={logoProgress}
                  isPending={uploadLogo.isPending}
                  onUpload={(file) =>
                    handleImageUpload(
                      file,
                      uploadLogo.mutateAsync,
                      setLogoProgress,
                      'Logo'
                    )
                  }
                />
                <ImageUploadCard
                  title="Cover / Hero Image"
                  description="The full-screen background image on the homepage hero section."
                  progress={coverProgress}
                  isPending={uploadCoverImage.isPending}
                  onUpload={(file) =>
                    handleImageUpload(
                      file,
                      uploadCoverImage.mutateAsync,
                      setCoverProgress,
                      'Cover image'
                    )
                  }
                />
                <ImageUploadCard
                  title="Artist Portrait"
                  description="Your professional photo shown in the About section."
                  progress={portraitProgress}
                  isPending={uploadArtistPortrait.isPending}
                  onUpload={(file) =>
                    handleImageUpload(
                      file,
                      uploadArtistPortrait.mutateAsync,
                      setPortraitProgress,
                      'Artist portrait'
                    )
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* ── Social Links Tab ── */}
          <TabsContent value="social-links" className="space-y-6">
            <div className="bg-white border border-warm-border rounded-2xl p-6 shadow-sm">
              <h2 className="font-display text-lg font-bold text-charcoal mb-1">
                Social Media &amp; Contact
              </h2>
              <p className="text-charcoal-medium text-sm mb-6">
                Update your WhatsApp number and Instagram profile link.
              </p>
              {contactsLoading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-cream rounded-lg animate-pulse" />
                  <div className="h-10 bg-cream rounded-lg animate-pulse" />
                </div>
              ) : (
                <div className="space-y-5 max-w-lg">
                  <div>
                    <Label
                      htmlFor="whatsapp"
                      className="text-charcoal font-semibold text-sm"
                    >
                      WhatsApp Number
                    </Label>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal-light focus:border-terracotta bg-white"
                    />
                    <p className="text-xs text-charcoal-light mt-1">
                      Include country code (e.g., +91 for India)
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="instagram"
                      className="text-charcoal font-semibold text-sm"
                    >
                      Instagram Profile URL
                    </Label>
                    <Input
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://www.instagram.com/yourhandle"
                      className="mt-1 border-warm-border text-charcoal placeholder:text-charcoal-light focus:border-terracotta bg-white"
                    />
                  </div>
                  <Button
                    onClick={handleSaveMediaContacts}
                    disabled={updateMediaContacts.isPending || !backendAuthReady}
                    className="bg-terracotta hover:bg-terracotta/90 text-cream font-semibold disabled:opacity-60"
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
