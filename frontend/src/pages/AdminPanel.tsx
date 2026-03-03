import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  Loader2,
  Upload,
  Trash2,
  Edit2,
  X,
  Check,
  MapPin,
  LogOut,
  ShieldCheck,
  ShieldQuestion,
  ImagePlus,
  Images,
} from 'lucide-react';
import {
  useGetAllArtworks,
  useUploadArtwork,
  useEditArtwork,
  useDeleteArtwork,
  useGetMediaContacts,
  useUpdateMediaContacts,
  useUploadLogo,
  useUploadCoverImage,
  useUploadArtistPortrait,
  useGetAdminPrincipal,
  useClaimAdminWithCode,
  useGetGalleryImages,
  useAddGalleryImage,
  useDeleteGalleryImage,
} from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import type { Artwork } from '../backend';
import { ExternalBlob } from '../backend';

const MAX_GALLERY_SIZE = 15 * 1024 * 1024; // 15MB

type Tab = 'artworks' | 'media' | 'contacts' | 'gallery';

interface EditingArtwork {
  id: bigint;
  title: string;
  description: string;
  location: string;
  newImageFile?: File;
  existingImage?: ExternalBlob;
}

async function fileToExternalBlob(file: File): Promise<ExternalBlob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return ExternalBlob.fromBytes(bytes);
}

// ── Admin Status Banner ──
function AdminStatusBanner() {
  const { isFetching: actorFetching } = useActor();
  const { data: adminPrincipal, isLoading: adminLoading, refetch } = useGetAdminPrincipal();
  const claimAdminWithCode = useClaimAdminWithCode();

  const [code, setCode] = useState('');
  const [justClaimed, setJustClaimed] = useState(false);
  const [codeError, setCodeError] = useState('');

  const handleClaim = async () => {
    if (code.length !== 6) {
      setCodeError('Please enter a 6-digit code.');
      return;
    }
    setCodeError('');
    try {
      await claimAdminWithCode.mutateAsync(code);
      setJustClaimed(true);
      setCode('');
      toast.success('Admin access claimed successfully! You are now the permanent admin.');
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setCodeError(msg);
      toast.error(`Failed to claim admin: ${msg}`);
    }
  };

  const isLoading = actorFetching || adminLoading;

  if (isLoading) {
    return (
      <div className="mx-4 sm:mx-6 mt-4 max-w-5xl lg:mx-auto">
        <div className="flex items-center gap-3 bg-cream-dark/50 border border-cream-dark rounded-xl px-4 py-3">
          <Loader2 size={16} className="animate-spin text-charcoal/50" />
          <span className="font-inter text-sm text-charcoal/60">Checking admin status…</span>
        </div>
      </div>
    );
  }

  // No admin set yet — show 6-digit code form
  if (!adminPrincipal) {
    return (
      <div className="mx-4 sm:mx-6 mt-4 max-w-5xl lg:mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex items-start gap-3 mb-4">
            <ShieldQuestion size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-inter text-sm font-semibold text-amber-800">
                No admin registered yet
              </p>
              <p className="font-inter text-xs text-amber-700 mt-0.5">
                Enter the 6-digit admin registration code to claim permanent admin access.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(val);
                  setCodeError('');
                }}
                placeholder="Enter 6-digit code"
                className={`w-full border rounded-lg px-4 py-2.5 font-inter text-sm text-charcoal tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
                  codeError ? 'border-red-400 bg-red-50' : 'border-amber-300 bg-white'
                }`}
              />
              {codeError && (
                <p className="font-inter text-xs text-red-600 mt-1">{codeError}</p>
              )}
            </div>
            <button
              onClick={handleClaim}
              disabled={claimAdminWithCode.isPending || code.length !== 6}
              className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 shrink-0"
            >
              {claimAdminWithCode.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ShieldCheck size={14} />
              )}
              {claimAdminWithCode.isPending ? 'Claiming…' : 'Claim Admin Access'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin is set — show success
  return (
    <div className="mx-4 sm:mx-6 mt-4 max-w-5xl lg:mx-auto">
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <ShieldCheck size={18} className="text-green-600 shrink-0" />
        <div className="flex-1">
          <p className="font-inter text-sm font-semibold text-green-800">
            {justClaimed ? 'Admin access claimed!' : 'Admin access active'}
          </p>
          <p className="font-inter text-xs text-green-700 mt-0.5 font-mono break-all">
            Admin ID: {adminPrincipal.slice(0, 24)}…
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Gallery Tab ──
function GalleryTab() {
  const { data: galleryImages = [], isLoading: galleryLoading } = useGetGalleryImages();
  const addGalleryImage = useAddGalleryImage();
  const deleteGalleryImage = useDeleteGalleryImage();

  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileError, setFileError] = useState('');
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileError('');
    if (file) {
      if (file.size > MAX_GALLERY_SIZE) {
        setFileError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 15 MB.`);
        setGalleryFile(null);
        if (galleryInputRef.current) galleryInputRef.current.value = '';
        return;
      }
    }
    setGalleryFile(file);
  };

  const handleUpload = async () => {
    if (!galleryFile) {
      setFileError('Please select an image to upload.');
      return;
    }
    setUploadProgress(0);
    try {
      await addGalleryImage.mutateAsync({
        file: galleryFile,
        onProgress: (pct) => setUploadProgress(pct),
      });
      toast.success('Artwork uploaded to gallery!');
      setGalleryFile(null);
      setUploadProgress(0);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Upload failed: ${msg}`);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: bigint, filename: string) => {
    if (!confirm(`Delete "${filename}" from the gallery? This cannot be undone.`)) return;
    try {
      await deleteGalleryImage.mutateAsync(id);
      toast.success('Image removed from gallery.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to delete: ${msg}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload New Image */}
      <div className="bg-white rounded-2xl shadow-warm-md p-6">
        <h2 className="font-playfair font-bold text-xl text-charcoal mb-2 flex items-center gap-2">
          <ImagePlus size={20} className="text-terracotta" />
          Upload Artwork
        </h2>
        <p className="font-inter text-xs text-charcoal/50 mb-5">
          Accepted formats: JPG, PNG, WEBP, GIF · Maximum size: 15 MB · No upload limit
        </p>

        <div className="space-y-3">
          <div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none"
            />
            {fileError && (
              <p className="font-inter text-xs text-red-600 mt-1">{fileError}</p>
            )}
            {galleryFile && !fileError && (
              <p className="font-inter text-xs text-charcoal/50 mt-1">
                Selected: {galleryFile.name} ({(galleryFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {addGalleryImage.isPending && uploadProgress > 0 && (
            <div className="w-full bg-cream-dark rounded-full h-2 overflow-hidden">
              <div
                className="bg-terracotta h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={addGalleryImage.isPending || !galleryFile || !!fileError}
            className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {addGalleryImage.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {uploadProgress > 0 ? `Uploading ${uploadProgress}%…` : 'Uploading…'}
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload to Gallery
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gallery Images Grid */}
      <div className="bg-white rounded-2xl shadow-warm-md p-6">
        <h2 className="font-playfair font-bold text-xl text-charcoal mb-5 flex items-center gap-2">
          <Images size={20} className="text-terracotta" />
          Gallery Images
          {galleryImages.length > 0 && (
            <span className="font-inter text-sm font-normal text-charcoal/50 ml-1">
              ({galleryImages.length} {galleryImages.length === 1 ? 'image' : 'images'})
            </span>
          )}
        </h2>

        {galleryLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={28} className="animate-spin text-terracotta" />
          </div>
        ) : galleryImages.length === 0 ? (
          <p className="text-charcoal/50 font-inter text-sm text-center py-8">
            No gallery images yet. Upload your first artwork above.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {galleryImages.map((image) => (
              <div
                key={String(image.id)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-cream-dark bg-cream-dark"
              >
                <img
                  src={image.blob.getDirectURL()}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Overlay with delete */}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/60 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(image.id, image.filename)}
                    disabled={deleteGalleryImage.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 font-inter text-xs font-medium flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
                {/* Filename */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/80 to-transparent px-2 py-2">
                  <p className="text-cream font-inter text-xs truncate">{image.filename}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('artworks');

  // Artworks state
  const { data: artworks, isLoading: artworksLoading } = useGetAllArtworks();
  const uploadArtwork = useUploadArtwork();
  const editArtwork = useEditArtwork();
  const deleteArtwork = useDeleteArtwork();

  // New artwork form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const newImageRef = useRef<HTMLInputElement>(null);

  // Editing state
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editForm, setEditForm] = useState<EditingArtwork | null>(null);
  const editImageRef = useRef<HTMLInputElement>(null);

  // Media contacts state
  const { data: mediaContacts } = useGetMediaContacts();
  const updateMediaContacts = useUpdateMediaContacts();
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');

  // Sync contacts form from fetched data
  useEffect(() => {
    if (mediaContacts) {
      setWhatsapp(mediaContacts.whatsappNumber || '');
      setInstagram(mediaContacts.instagramProfile || '');
    }
  }, [mediaContacts]);

  // Logo/Cover/Portrait upload hooks
  const uploadLogo = useUploadLogo();
  const uploadCoverImage = useUploadCoverImage();
  const uploadArtistPortrait = useUploadArtistPortrait();

  // Logo/Cover/Portrait file state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const portraitRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    navigate({ to: '/' });
  };

  // ── Artwork handlers ──
  const handleUploadArtwork = async () => {
    if (!newTitle.trim()) {
      toast.error('Please provide a title.');
      return;
    }
    try {
      await uploadArtwork.mutateAsync({
        title: newTitle.trim(),
        description: newDescription.trim(),
        imageFile: newImageFile,
        location: newLocation.trim() || null,
      });
      toast.success('Project added successfully!');
      setNewTitle('');
      setNewDescription('');
      setNewLocation('');
      setNewImageFile(null);
      if (newImageRef.current) newImageRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to add project: ${msg}`);
    }
  };

  const startEditing = (artwork: Artwork) => {
    setEditingId(artwork.id);
    setEditForm({
      id: artwork.id,
      title: artwork.title,
      description: artwork.description,
      location: artwork.location || '',
      existingImage: artwork.image ?? undefined,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
    if (editImageRef.current) editImageRef.current.value = '';
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    try {
      await editArtwork.mutateAsync({
        id: editForm.id,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        imageFile: editForm.newImageFile ?? null,
        keepExistingImage: !editForm.newImageFile,
        existingImage: editForm.existingImage,
        location: editForm.location.trim() || null,
      });
      toast.success('Project updated successfully!');
      cancelEditing();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to update project: ${msg}`);
    }
  };

  const handleDeleteArtwork = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteArtwork.mutateAsync(id);
      toast.success('Project deleted.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to delete project: ${msg}`);
    }
  };

  // ── Contacts handler ──
  const handleUpdateContacts = async () => {
    try {
      await updateMediaContacts.mutateAsync({
        whatsappNumber: whatsapp.trim(),
        instagramProfile: instagram.trim(),
      });
      toast.success('Contact info updated successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to update contacts: ${msg}`);
    }
  };

  // ── Media upload handlers ──
  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error('Please select a logo image.');
      return;
    }
    try {
      const blob = await fileToExternalBlob(logoFile);
      await uploadLogo.mutateAsync(blob);
      toast.success('Logo uploaded successfully!');
      setLogoFile(null);
      if (logoRef.current) logoRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to upload logo: ${msg}`);
    }
  };

  const handleUploadCover = async () => {
    if (!coverFile) {
      toast.error('Please select a cover image.');
      return;
    }
    try {
      const blob = await fileToExternalBlob(coverFile);
      await uploadCoverImage.mutateAsync(blob);
      toast.success('Cover image uploaded successfully!');
      setCoverFile(null);
      if (coverRef.current) coverRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to upload cover image: ${msg}`);
    }
  };

  const handleUploadPortrait = async () => {
    if (!portraitFile) {
      toast.error('Please select a portrait image.');
      return;
    }
    try {
      const blob = await fileToExternalBlob(portraitFile);
      await uploadArtistPortrait.mutateAsync(blob);
      toast.success('Portrait uploaded successfully!');
      setPortraitFile(null);
      if (portraitRef.current) portraitRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to upload portrait: ${msg}`);
    }
  };

  const TAB_LABELS: Record<Tab, string> = {
    artworks: 'Projects',
    media: 'Site Media',
    contacts: 'Contacts',
    gallery: 'Gallery',
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-charcoal text-cream px-6 py-4 flex items-center justify-between shadow-warm-lg">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/logo-k.dim_200x200.png"
            alt="Logo"
            className="h-9 w-9 object-contain"
          />
          <div>
            <h1 className="font-playfair font-bold text-xl text-cream">Admin Panel</h1>
            <p className="font-inter text-cream/60 text-xs">Khudrang Kalakaar</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-cream/70 hover:text-cream transition-colors font-inter text-sm"
        >
          <LogOut size={16} />
          Exit
        </button>
      </header>

      {/* Admin Status Banner */}
      <AdminStatusBanner />

      {/* Tabs */}
      <div className="bg-white border-b border-cream-dark px-4 sm:px-6 mt-4 overflow-x-auto">
        <div className="flex gap-0 max-w-5xl mx-auto min-w-max">
          {(['artworks', 'media', 'contacts', 'gallery'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 font-inter text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-charcoal/60 hover:text-charcoal'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ── ARTWORKS TAB ── */}
        {activeTab === 'artworks' && (
          <div className="space-y-8">
            {/* Add New Artwork */}
            <div className="bg-white rounded-2xl shadow-warm-md p-6">
              <h2 className="font-playfair font-bold text-xl text-charcoal mb-5">
                Add New Project
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Project title"
                    className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  />
                </div>
                <div>
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-terracotta"
                    />
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Ajmer, Rajasthan"
                      className="w-full border border-cream-dark rounded-lg pl-8 pr-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    Description
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Project description"
                    rows={3}
                    className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                    Image (optional)
                  </label>
                  <input
                    ref={newImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                    className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleUploadArtwork}
                disabled={uploadArtwork.isPending}
                className="mt-5 flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {uploadArtwork.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                Add Project
              </button>
            </div>

            {/* Existing Artworks */}
            <div className="bg-white rounded-2xl shadow-warm-md p-6">
              <h2 className="font-playfair font-bold text-xl text-charcoal mb-5">
                Existing Projects
              </h2>
              {artworksLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={28} className="animate-spin text-terracotta" />
                </div>
              ) : !artworks || artworks.length === 0 ? (
                <p className="text-charcoal/50 font-inter text-sm text-center py-8">
                  No projects yet. Add your first project above.
                </p>
              ) : (
                <div className="space-y-4">
                  {artworks.map((artwork) => (
                    <div
                      key={String(artwork.id)}
                      className="border border-cream-dark rounded-xl overflow-hidden"
                    >
                      {editingId === artwork.id && editForm ? (
                        /* Edit Mode */
                        <div className="p-5 bg-cream/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-inter text-xs font-medium text-charcoal/70 mb-1">
                                Title
                              </label>
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, title: e.target.value })
                                }
                                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                              />
                            </div>
                            <div>
                              <label className="block font-inter text-xs font-medium text-charcoal/70 mb-1">
                                Location
                              </label>
                              <div className="relative">
                                <MapPin
                                  size={12}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-terracotta"
                                />
                                <input
                                  type="text"
                                  value={editForm.location}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, location: e.target.value })
                                  }
                                  placeholder="e.g. Ajmer, Rajasthan"
                                  className="w-full border border-cream-dark rounded-lg pl-7 pr-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                                />
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block font-inter text-xs font-medium text-charcoal/70 mb-1">
                                Description
                              </label>
                              <textarea
                                value={editForm.description}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, description: e.target.value })
                                }
                                rows={2}
                                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block font-inter text-xs font-medium text-charcoal/70 mb-1">
                                Replace Image (optional)
                              </label>
                              <input
                                ref={editImageRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    newImageFile: e.target.files?.[0],
                                  })
                                }
                                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={handleSaveEdit}
                              disabled={editArtwork.isPending}
                              className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-xs font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                            >
                              {editArtwork.isPending ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center gap-2 bg-cream-dark hover:bg-cream-dark/80 text-charcoal font-inter text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                              <X size={12} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-center gap-4 p-4">
                          {artwork.image ? (
                            <img
                              src={artwork.image.getDirectURL()}
                              alt={artwork.title}
                              className="w-16 h-16 object-cover rounded-lg shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-cream-dark rounded-lg shrink-0 flex items-center justify-center">
                              <span className="text-charcoal/30 text-xs">No img</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-inter text-sm font-semibold text-charcoal truncate">
                              {artwork.title}
                            </p>
                            {artwork.location && (
                              <p className="font-inter text-xs text-terracotta flex items-center gap-1 mt-0.5">
                                <MapPin size={10} />
                                {artwork.location}
                              </p>
                            )}
                            {artwork.description && (
                              <p className="font-inter text-xs text-charcoal/50 mt-0.5 truncate">
                                {artwork.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEditing(artwork)}
                              className="p-2 text-charcoal/50 hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteArtwork(artwork.id)}
                              disabled={deleteArtwork.isPending}
                              className="p-2 text-charcoal/50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MEDIA TAB ── */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Logo */}
            <div className="bg-white rounded-2xl shadow-warm-md p-6">
              <h2 className="font-playfair font-bold text-lg text-charcoal mb-4">Logo</h2>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none mb-3"
              />
              <button
                onClick={handleUploadLogo}
                disabled={uploadLogo.isPending || !logoFile}
                className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                {uploadLogo.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                Upload Logo
              </button>
            </div>

            {/* Cover Image */}
            <div className="bg-white rounded-2xl shadow-warm-md p-6">
              <h2 className="font-playfair font-bold text-lg text-charcoal mb-4">Cover Image</h2>
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none mb-3"
              />
              <button
                onClick={handleUploadCover}
                disabled={uploadCoverImage.isPending || !coverFile}
                className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                {uploadCoverImage.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                Upload Cover
              </button>
            </div>

            {/* Artist Portrait */}
            <div className="bg-white rounded-2xl shadow-warm-md p-6">
              <h2 className="font-playfair font-bold text-lg text-charcoal mb-4">
                Artist Portrait
              </h2>
              <input
                ref={portraitRef}
                type="file"
                accept="image/*"
                onChange={(e) => setPortraitFile(e.target.files?.[0] || null)}
                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none mb-3"
              />
              <button
                onClick={handleUploadPortrait}
                disabled={uploadArtistPortrait.isPending || !portraitFile}
                className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                {uploadArtistPortrait.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                Upload Portrait
              </button>
            </div>
          </div>
        )}

        {/* ── CONTACTS TAB ── */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-2xl shadow-warm-md p-6">
            <h2 className="font-playfair font-bold text-xl text-charcoal mb-5">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </div>
              <div>
                <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/khudrangkalakaar"
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </div>
            </div>
            <button
              onClick={handleUpdateContacts}
              disabled={updateMediaContacts.isPending}
              className="mt-5 flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {updateMediaContacts.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Save Contacts
            </button>
          </div>
        )}

        {/* ── GALLERY TAB ── */}
        {activeTab === 'gallery' && <GalleryTab />}
      </main>
    </div>
  );
}
