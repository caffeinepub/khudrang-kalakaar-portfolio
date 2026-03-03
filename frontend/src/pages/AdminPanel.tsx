import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Upload,
  Image,
  Phone,
  Instagram,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useActor } from '../hooks/useActor';
import { validateSession, clearSession } from '../lib/adminAuth';
import {
  useGetAllArtworks,
  useGetLogo,
  useGetCoverImage,
  useGetArtistPortrait,
  useGetMediaContacts,
  useUploadArtwork,
  useEditArtwork,
  useDeleteArtwork,
  useUploadLogo,
  useUploadCoverImage,
  useUploadArtistPortrait,
  useUpdateMediaContacts,
} from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

// ── Types ──
interface ArtworkForm {
  title: string;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
}

const emptyForm = (): ArtworkForm => ({
  title: '',
  description: '',
  imageFile: null,
  imagePreview: null,
});

// ── Helpers ──
function fileToUint8Array(file: File): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target!.result as ArrayBuffer;
      resolve(new Uint8Array(result) as Uint8Array<ArrayBuffer>);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function getErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('Unauthorized') || msg.includes('not authorized') || msg.includes('Invalid admin')) {
    return 'Authorization failed. Please log out and log in again.';
  }
  return msg.length > 120 ? msg.slice(0, 120) + '…' : msg;
}

// ── Sub-components ──

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-playfair text-2xl font-bold text-charcoal">{title}</h2>
      {subtitle && <p className="text-charcoal/60 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function ImageUploadCard({
  label,
  currentUrl,
  onUpload,
  isLoading,
  accept = 'image/*',
}: {
  label: string;
  currentUrl?: string | null;
  onUpload: (file: File) => void;
  isLoading: boolean;
  accept?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-xl border border-cream-dark p-5 shadow-warm-sm">
      <p className="font-medium text-charcoal mb-3">{label}</p>
      {currentUrl && (
        <img
          src={currentUrl}
          alt={label}
          className="w-full h-40 object-cover rounded-lg mb-3 border border-cream-dark"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-terracotta/10 hover:bg-terracotta/20 text-terracotta border border-terracotta/30 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {isLoading ? 'Uploading…' : 'Choose & Upload'}
      </button>
    </div>
  );
}

// ── Main Component ──

export default function AdminPanel() {
  const navigate = useNavigate();
  const { actor: _actor } = useActor();

  // Guard: require valid session
  useEffect(() => {
    if (!validateSession()) {
      navigate({ to: '/admin-login' });
    }
  }, [navigate]);

  // Data queries
  const { data: artworks = [], isLoading: artworksLoading } = useGetAllArtworks();
  const { data: logoBlob } = useGetLogo();
  const { data: coverBlob } = useGetCoverImage();
  const { data: portraitBlob } = useGetArtistPortrait();
  const { data: mediaContacts } = useGetMediaContacts();

  // Mutations
  const uploadArtworkMutation = useUploadArtwork();
  const editArtworkMutation = useEditArtwork();
  const deleteArtworkMutation = useDeleteArtwork();
  const uploadLogoMutation = useUploadLogo();
  const uploadCoverMutation = useUploadCoverImage();
  const uploadPortraitMutation = useUploadArtistPortrait();
  const updateContactsMutation = useUpdateMediaContacts();

  // Artwork form state
  const [artworkForm, setArtworkForm] = useState<ArtworkForm>(emptyForm());
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [showArtworkForm, setShowArtworkForm] = useState(false);

  // Media contacts state
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'artworks' | 'media' | 'contacts'>('artworks');

  // Populate contacts form when data loads
  useEffect(() => {
    if (mediaContacts) {
      setWhatsapp(mediaContacts.whatsappNumber);
      setInstagram(mediaContacts.instagramProfile);
    }
  }, [mediaContacts]);

  const handleLogout = () => {
    clearSession();
    navigate({ to: '/admin-login' });
  };

  // ── Artwork handlers ──

  const handleArtworkImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setArtworkForm((f) => ({ ...f, imageFile: file, imagePreview: preview }));
  };

  const handleArtworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artworkForm.title.trim()) {
      toast.error('Please enter a title.');
      return;
    }

    try {
      if (editingId !== null) {
        // Edit existing
        let imageBytes = new Uint8Array(new ArrayBuffer(0)) as Uint8Array<ArrayBuffer>;
        let format: string | null = null;
        let fileName: string | null = null;
        if (artworkForm.imageFile) {
          imageBytes = await fileToUint8Array(artworkForm.imageFile);
          format = artworkForm.imageFile.type || null;
          fileName = artworkForm.imageFile.name || null;
        }
        await editArtworkMutation.mutateAsync({
          id: editingId,
          title: artworkForm.title,
          description: artworkForm.description,
          imageBytes,
          format,
          fileName,
        });
        toast.success('Artwork updated successfully!');
      } else {
        // New artwork
        if (!artworkForm.imageFile) {
          toast.error('Please select an image.');
          return;
        }
        const imageBytes = await fileToUint8Array(artworkForm.imageFile);
        await uploadArtworkMutation.mutateAsync({
          title: artworkForm.title,
          description: artworkForm.description,
          imageBytes,
          format: artworkForm.imageFile.type || null,
          fileName: artworkForm.imageFile.name || null,
        });
        toast.success('Artwork uploaded successfully!');
      }
      setArtworkForm(emptyForm());
      setEditingId(null);
      setShowArtworkForm(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleEditArtwork = (artwork: { id: bigint; title: string; description: string }) => {
    setEditingId(artwork.id);
    setArtworkForm({
      title: artwork.title,
      description: artwork.description,
      imageFile: null,
      imagePreview: null,
    });
    setShowArtworkForm(true);
  };

  const handleDeleteArtwork = async (id: bigint) => {
    if (!confirm('Delete this artwork? This cannot be undone.')) return;
    try {
      await deleteArtworkMutation.mutateAsync(id);
      toast.success('Artwork deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ── Media upload handlers ──

  const handleLogoUpload = async (file: File) => {
    try {
      const bytes = await fileToUint8Array(file);
      const blob = ExternalBlob.fromBytes(bytes);
      await uploadLogoMutation.mutateAsync(blob);
      toast.success('Logo updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCoverUpload = async (file: File) => {
    try {
      const bytes = await fileToUint8Array(file);
      const blob = ExternalBlob.fromBytes(bytes);
      await uploadCoverMutation.mutateAsync(blob);
      toast.success('Cover image updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handlePortraitUpload = async (file: File) => {
    try {
      const bytes = await fileToUint8Array(file);
      const blob = ExternalBlob.fromBytes(bytes);
      await uploadPortraitMutation.mutateAsync(blob);
      toast.success('Artist portrait updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ── Contacts handler ──

  const handleContactsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateContactsMutation.mutateAsync({
        whatsappNumber: whatsapp,
        instagramProfile: instagram,
      });
      toast.success('Contact details saved!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const isArtworkMutating =
    uploadArtworkMutation.isPending ||
    editArtworkMutation.isPending ||
    deleteArtworkMutation.isPending;

  const tabs = [
    { id: 'artworks' as const, label: 'Artworks', icon: Image },
    { id: 'media' as const, label: 'Site Media', icon: Upload },
    { id: 'contacts' as const, label: 'Contacts', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-charcoal text-cream shadow-warm-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-xl font-bold">Khudrang Kalakaar</h1>
            <p className="text-cream/60 text-xs">Admin Panel</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-cream/70 hover:text-cream transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-warm-sm border border-cream-dark mb-8 w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-terracotta text-cream shadow-warm-sm'
                  : 'text-charcoal/60 hover:text-charcoal hover:bg-cream/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Artworks Tab ── */}
        {activeTab === 'artworks' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <SectionHeader
                title="Artwork Gallery"
                subtitle="Manage your portfolio artworks"
              />
              <button
                onClick={() => {
                  setArtworkForm(emptyForm());
                  setEditingId(null);
                  setShowArtworkForm(true);
                }}
                className="flex items-center gap-2 bg-terracotta text-cream px-4 py-2 rounded-lg text-sm font-medium hover:bg-terracotta/90 transition-colors shadow-warm-sm"
              >
                <Plus className="w-4 h-4" />
                Add Artwork
              </button>
            </div>

            {/* Artwork Form */}
            {showArtworkForm && (
              <div className="bg-white rounded-xl border border-cream-dark p-6 mb-6 shadow-warm-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair text-lg font-semibold text-charcoal">
                    {editingId !== null ? 'Edit Artwork' : 'Add New Artwork'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowArtworkForm(false);
                      setArtworkForm(emptyForm());
                      setEditingId(null);
                    }}
                    className="text-charcoal/40 hover:text-charcoal transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleArtworkSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal/80 mb-1">Title *</label>
                    <input
                      type="text"
                      value={artworkForm.title}
                      onChange={(e) => setArtworkForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Artwork title"
                      className="w-full px-3 py-2 border border-cream-dark rounded-lg text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta bg-cream/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal/80 mb-1">Description</label>
                    <textarea
                      value={artworkForm.description}
                      onChange={(e) => setArtworkForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Describe this artwork…"
                      rows={3}
                      className="w-full px-3 py-2 border border-cream-dark rounded-lg text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta bg-cream/30 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal/80 mb-1">
                      Image {editingId === null ? '*' : '(leave blank to keep existing)'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleArtworkImageChange}
                      className="w-full text-sm text-charcoal/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-terracotta/10 file:text-terracotta file:font-medium hover:file:bg-terracotta/20 cursor-pointer"
                    />
                    {artworkForm.imagePreview && (
                      <img
                        src={artworkForm.imagePreview}
                        alt="Preview"
                        className="mt-2 h-32 w-auto rounded-lg border border-cream-dark object-cover"
                      />
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isArtworkMutating}
                      className="flex items-center gap-2 bg-terracotta text-cream px-5 py-2 rounded-lg text-sm font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50 shadow-warm-sm"
                    >
                      {isArtworkMutating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isArtworkMutating ? 'Saving…' : 'Save Artwork'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowArtworkForm(false);
                        setArtworkForm(emptyForm());
                        setEditingId(null);
                      }}
                      className="px-5 py-2 rounded-lg text-sm font-medium text-charcoal/60 hover:text-charcoal border border-cream-dark hover:bg-cream/60 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Artworks Grid */}
            {artworksLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
              </div>
            ) : artworks.length === 0 ? (
              <div className="text-center py-16 text-charcoal/40">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No artworks yet. Add your first artwork!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {artworks.map((artwork) => {
                  const imgBlob = new Blob([new Uint8Array(artwork.image)], {
                    type: artwork.imageFormat || 'image/jpeg',
                  });
                  const imageUrl = URL.createObjectURL(imgBlob);
                  return (
                    <div
                      key={artwork.id.toString()}
                      className="bg-white rounded-xl border border-cream-dark overflow-hidden shadow-warm-sm group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={artwork.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-playfair font-semibold text-charcoal truncate">{artwork.title}</h3>
                        {artwork.description && (
                          <p className="text-charcoal/55 text-sm mt-1 line-clamp-2">{artwork.description}</p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleEditArtwork(artwork)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gold/10 text-charcoal border border-gold/20 hover:bg-gold/20 transition-colors font-medium"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteArtwork(artwork.id)}
                            disabled={deleteArtworkMutation.isPending}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
                          >
                            {deleteArtworkMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Site Media Tab ── */}
        {activeTab === 'media' && (
          <div>
            <SectionHeader
              title="Site Media"
              subtitle="Update logo, cover image, and artist portrait"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <ImageUploadCard
                label="Logo"
                currentUrl={logoBlob ? logoBlob.getDirectURL() : null}
                onUpload={handleLogoUpload}
                isLoading={uploadLogoMutation.isPending}
              />
              <ImageUploadCard
                label="Cover / Hero Image"
                currentUrl={coverBlob ? coverBlob.getDirectURL() : null}
                onUpload={handleCoverUpload}
                isLoading={uploadCoverMutation.isPending}
              />
              <ImageUploadCard
                label="Artist Portrait"
                currentUrl={portraitBlob ? portraitBlob.getDirectURL() : null}
                onUpload={handlePortraitUpload}
                isLoading={uploadPortraitMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* ── Contacts Tab ── */}
        {activeTab === 'contacts' && (
          <div>
            <SectionHeader
              title="Social & Contact Details"
              subtitle="Update WhatsApp and Instagram information"
            />
            <div className="bg-white rounded-xl border border-cream-dark p-6 shadow-warm-sm max-w-lg">
              <form onSubmit={handleContactsSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-terracotta" />
                      WhatsApp Number
                    </span>
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 border border-cream-dark rounded-lg text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta bg-cream/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                    <span className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-terracotta" />
                      Instagram Profile URL
                    </span>
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-3 py-2.5 border border-cream-dark rounded-lg text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta bg-cream/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updateContactsMutation.isPending}
                  className="flex items-center gap-2 bg-terracotta text-cream px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50 shadow-warm-sm"
                >
                  {updateContactsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {updateContactsMutation.isPending ? 'Saving…' : 'Save Changes'}
                </button>
                {updateContactsMutation.isSuccess && (
                  <p className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Saved successfully!
                  </p>
                )}
                {updateContactsMutation.isError && (
                  <p className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {getErrorMessage(updateContactsMutation.error)}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
