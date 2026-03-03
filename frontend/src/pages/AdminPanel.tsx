import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Loader2, Upload, Trash2, Edit2, X, Check, MapPin, LogOut, Image as ImageIcon } from 'lucide-react';
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
} from '../hooks/useQueries';
import type { Artwork } from '../backend';
import { ExternalBlob } from '../backend';

type Tab = 'artworks' | 'media' | 'contacts';

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

      {/* Tabs */}
      <div className="bg-white border-b border-cream-dark px-6">
        <div className="flex gap-0 max-w-5xl mx-auto">
          {(['artworks', 'media', 'contacts'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-inter text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-terracotta text-terracotta'
                  : 'border-transparent text-charcoal/60 hover:text-charcoal'
              }`}
            >
              {tab === 'artworks' ? 'Projects' : tab === 'media' ? 'Site Media' : 'Contacts'}
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
                                  size={14}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-terracotta"
                                />
                                <input
                                  type="text"
                                  value={editForm.location}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, location: e.target.value })
                                  }
                                  placeholder="e.g. Ajmer, Rajasthan"
                                  className="w-full border border-cream-dark rounded-lg pl-8 pr-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
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
                                rows={3}
                                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block font-inter text-xs font-medium text-charcoal/70 mb-1">
                                Replace Image (optional — leave blank to keep existing)
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
                              className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                            >
                              {editArtwork.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center gap-2 bg-cream-dark hover:bg-cream text-charcoal font-inter text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-cream-dark"
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-start gap-4 p-4">
                          {artwork.image ? (
                            <img
                              src={artwork.image.getDirectURL()}
                              alt={artwork.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-cream-dark rounded-lg flex-shrink-0 flex items-center justify-center">
                              <ImageIcon size={24} className="text-charcoal/30" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-playfair font-semibold text-charcoal text-base truncate">
                              {artwork.title}
                            </h3>
                            {artwork.location && (
                              <p className="flex items-center gap-1 font-inter text-xs text-terracotta mt-0.5">
                                <MapPin size={11} />
                                {artwork.location}
                              </p>
                            )}
                            {artwork.description && (
                              <p className="font-inter text-xs text-charcoal/60 mt-1 line-clamp-2">
                                {artwork.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => startEditing(artwork)}
                              className="p-2 rounded-lg bg-cream hover:bg-cream-dark text-charcoal/70 hover:text-charcoal transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteArtwork(artwork.id)}
                              disabled={deleteArtwork.isPending}
                              className="p-2 rounded-lg bg-cream hover:bg-red-50 text-charcoal/70 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deleteArtwork.isPending ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
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

        {/* ── SITE MEDIA TAB ── */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="bg-white rounded-2xl shadow-warm-md p-6">
              <h2 className="font-playfair font-bold text-xl text-charcoal mb-2">Logo</h2>
              <p className="font-inter text-sm text-charcoal/60 mb-4">
                Upload the site logo (displayed in the header and footer).
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="flex-1 border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none"
                />
                <button
                  onClick={handleUploadLogo}
                  disabled={!logoFile || uploadLogo.isPending}
                  className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {uploadLogo.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Upload Logo
                </button>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div className="bg-white rounded-2xl shadow-warm-md p-6">
              <h2 className="font-playfair font-bold text-xl text-charcoal mb-2">Cover Image</h2>
              <p className="font-inter text-sm text-charcoal/60 mb-4">
                Upload the hero/cover image shown at the top of the portfolio page.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="flex-1 border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none"
                />
                <button
                  onClick={handleUploadCover}
                  disabled={!coverFile || uploadCoverImage.isPending}
                  className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {uploadCoverImage.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Upload Cover
                </button>
              </div>
            </div>

            {/* Artist Portrait Upload */}
            <div className="bg-white rounded-2xl shadow-warm-md p-6">
              <h2 className="font-playfair font-bold text-xl text-charcoal mb-2">
                Artist Portrait
              </h2>
              <p className="font-inter text-sm text-charcoal/60 mb-4">
                Upload the artist portrait shown in the About section.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  ref={portraitRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPortraitFile(e.target.files?.[0] || null)}
                  className="flex-1 border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none"
                />
                <button
                  onClick={handleUploadPortrait}
                  disabled={!portraitFile || uploadArtistPortrait.isPending}
                  className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {uploadArtistPortrait.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  Upload Portrait
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTACTS TAB ── */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-2xl shadow-warm-md p-6 max-w-lg">
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
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </div>
              <div>
                <label className="block font-inter text-sm font-medium text-charcoal mb-1">
                  Instagram Profile
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://www.instagram.com/yourprofile"
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </div>
              <button
                onClick={handleUpdateContacts}
                disabled={updateMediaContacts.isPending}
                className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
              >
                {updateMediaContacts.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
