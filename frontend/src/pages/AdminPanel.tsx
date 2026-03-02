import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  LogOut,
  Upload,
  Trash2,
  Edit,
  Plus,
  Image as ImageIcon,
  Type,
  Phone,
  Instagram,
  Loader2,
} from 'lucide-react';
import {
  useAllArtworks,
  useUploadArtwork,
  useEditArtwork,
  useDeleteArtwork,
  useLogo,
  useUploadLogo,
  useCoverImage,
  useUploadCoverImage,
  useArtistPortrait,
  useUploadArtistPortrait,
  useTextContent,
  useUpdateTextContent,
  useMediaContacts,
  useUpdateMediaContacts,
} from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import type { Artwork } from '../backend';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function readFileAsUint8Array(file: File): Promise<Uint8Array<ArrayBuffer>> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
}

function ArtworkThumb({ artwork }: { artwork: Artwork }) {
  const [url, setUrl] = useState<string | null>(null);

  useState(() => {
    if (artwork.image && artwork.image.length > 0) {
      const mime = artwork.imageFormat || 'image/jpeg';
      const blob = new Blob([new Uint8Array(artwork.image)], { type: mime });
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  });

  if (!url) {
    return (
      <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
        <ImageIcon size={20} className="text-muted-foreground" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={artwork.title}
      className="w-16 h-16 rounded object-cover flex-shrink-0"
    />
  );
}

// ── Gallery Tab ───────────────────────────────────────────────────────────────

function GalleryTab() {
  const { data: artworks, isLoading } = useAllArtworks();
  const uploadArtwork = useUploadArtwork();
  const editArtwork = useEditArtwork();
  const deleteArtwork = useDeleteArtwork();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const handleNewImageChange = (file: File | null) => {
    setNewImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setNewImagePreview(url);
    } else {
      setNewImagePreview(null);
    }
  };

  const handleEditImageChange = (file: File | null) => {
    setEditImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setEditImagePreview(url);
    } else {
      setEditImagePreview(null);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!newImageFile) {
      toast.error('Please select an image');
      return;
    }
    try {
      const bytes = await readFileAsUint8Array(newImageFile);
      await uploadArtwork.mutateAsync({
        title: newTitle.trim(),
        description: newDescription.trim(),
        imageBytes: bytes,
        format: newImageFile.type || null,
        fileName: newImageFile.name || null,
      });
      toast.success('Artwork uploaded successfully!');
      setNewTitle('');
      setNewDescription('');
      setNewImageFile(null);
      setNewImagePreview(null);
      setShowAddForm(false);
    } catch {
      toast.error('Failed to upload artwork');
    }
  };

  const startEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setEditTitle(artwork.title);
    setEditDescription(artwork.description);
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleEdit = async () => {
    if (!editingArtwork) return;
    if (!editTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    try {
      let bytes: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(0));
      let format: string | null = null;
      let fileName: string | null = null;
      if (editImageFile) {
        bytes = await readFileAsUint8Array(editImageFile);
        format = editImageFile.type || null;
        fileName = editImageFile.name || null;
      }
      await editArtwork.mutateAsync({
        id: editingArtwork.id,
        title: editTitle.trim(),
        description: editDescription.trim(),
        imageBytes: bytes,
        format,
        fileName,
      });
      toast.success('Artwork updated successfully!');
      setEditingArtwork(null);
      setEditImageFile(null);
      setEditImagePreview(null);
    } catch {
      toast.error('Failed to update artwork');
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteArtwork.mutateAsync(id);
      toast.success('Artwork deleted');
    } catch {
      toast.error('Failed to delete artwork');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Artwork Gallery</h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-2"
          size="sm"
        >
          <Plus size={16} />
          Add Artwork
        </Button>
      </div>

      {showAddForm && (
        <div className="border border-border rounded-lg p-5 bg-card space-y-4">
          <h3 className="font-semibold text-foreground">New Artwork</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-title">Title *</Label>
              <Input
                id="new-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Artwork title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-desc">Description</Label>
              <Input
                id="new-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Short description"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Image *</Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
              onClick={() => addFileRef.current?.click()}
            >
              {newImagePreview ? (
                <img src={newImagePreview} alt="Preview" className="max-h-40 mx-auto rounded object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon size={32} />
                  <span className="text-sm">Click to select image</span>
                </div>
              )}
            </div>
            <input
              ref={addFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleNewImageChange(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAdd} disabled={uploadArtwork.isPending} className="gap-2">
              {uploadArtwork.isPending && <Loader2 size={16} className="animate-spin" />}
              Upload Artwork
            </Button>
            <Button variant="outline" onClick={() => { setShowAddForm(false); setNewImagePreview(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {editingArtwork && (
        <div className="border border-accent rounded-lg p-5 bg-card space-y-4">
          <h3 className="font-semibold text-foreground">Edit Artwork</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Artwork title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Input
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Short description"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Image (leave empty to keep current)</Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
              onClick={() => editFileRef.current?.click()}
            >
              {editImagePreview ? (
                <img src={editImagePreview} alt="Preview" className="max-h-40 mx-auto rounded object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon size={32} />
                  <span className="text-sm">Click to replace image (optional)</span>
                </div>
              )}
            </div>
            <input
              ref={editFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleEditImageChange(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleEdit} disabled={editArtwork.isPending} className="gap-2">
              {editArtwork.isPending && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => { setEditingArtwork(null); setEditImagePreview(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !artworks || artworks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p>No artworks yet. Add your first artwork above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {artworks.map((artwork) => (
            <div
              key={Number(artwork.id)}
              className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors"
            >
              <ArtworkThumb artwork={artwork} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{artwork.title}</p>
                {artwork.description && (
                  <p className="text-sm text-muted-foreground truncate">{artwork.description}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => startEdit(artwork)}
                  title="Edit"
                >
                  <Edit size={16} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" title="Delete">
                      <Trash2 size={16} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{artwork.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(artwork.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Site Images Tab ───────────────────────────────────────────────────────────

interface ImageUploadCardProps {
  label: string;
  blob: ExternalBlob | null | undefined;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isPending: boolean;
  onFileChange: (file: File) => void;
}

function ImageUploadCard({ label, blob, inputRef, isPending, onFileChange }: ImageUploadCardProps) {
  return (
    <div className="border border-border rounded-lg p-5 bg-card space-y-3">
      <h3 className="font-semibold text-foreground">{label}</h3>
      {blob ? (
        <img
          src={blob.getDirectURL()}
          alt={label}
          className="w-full max-h-48 object-contain rounded bg-muted"
        />
      ) : (
        <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
          <ImageIcon size={32} className="text-muted-foreground" />
        </div>
      )}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {isPending ? 'Uploading...' : 'Upload New'}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileChange(file);
        }}
      />
    </div>
  );
}

function SiteImagesTab() {
  const { data: logo } = useLogo();
  const { data: coverImage } = useCoverImage();
  const { data: artistPortrait } = useArtistPortrait();

  const uploadLogo = useUploadLogo();
  const uploadCoverImage = useUploadCoverImage();
  const uploadArtistPortrait = useUploadArtistPortrait();

  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const portraitRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (
    file: File,
    mutate: (blob: ExternalBlob) => Promise<void>,
    label: string
  ) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
      const blob = ExternalBlob.fromBytes(bytes);
      await mutate(blob);
      toast.success(`${label} updated successfully!`);
    } catch {
      toast.error(`Failed to update ${label}`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Site Images</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImageUploadCard
          label="Logo"
          blob={logo}
          inputRef={logoRef}
          isPending={uploadLogo.isPending}
          onFileChange={(file) => handleUpload(file, (b) => uploadLogo.mutateAsync(b), 'Logo')}
        />
        <ImageUploadCard
          label="Cover / Hero Image"
          blob={coverImage}
          inputRef={coverRef}
          isPending={uploadCoverImage.isPending}
          onFileChange={(file) => handleUpload(file, (b) => uploadCoverImage.mutateAsync(b), 'Cover Image')}
        />
        <ImageUploadCard
          label="Artist Portrait"
          blob={artistPortrait}
          inputRef={portraitRef}
          isPending={uploadArtistPortrait.isPending}
          onFileChange={(file) => handleUpload(file, (b) => uploadArtistPortrait.mutateAsync(b), 'Artist Portrait')}
        />
      </div>
    </div>
  );
}

// ── Text Content Tab ──────────────────────────────────────────────────────────

function TextContentTab() {
  const { data: textContent, isLoading } = useTextContent();
  const updateTextContent = useUpdateTextContent();

  const [artistName, setArtistName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (textContent && !initialized) {
    setArtistName(textContent.artistName);
    setTagline(textContent.tagline);
    setBio(textContent.bio);
    setInitialized(true);
  }

  const handleSave = async () => {
    try {
      await updateTextContent.mutateAsync({ artistName, tagline, bio });
      toast.success('Text content updated successfully!');
    } catch {
      toast.error('Failed to update text content');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Text Content</h2>
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="space-y-2">
          <Label htmlFor="artist-name">Artist Name</Label>
          <Input
            id="artist-name"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="Artist name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Your tagline"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Artist bio"
            rows={6}
          />
        </div>
        <Button onClick={handleSave} disabled={updateTextContent.isPending} className="gap-2">
          {updateTextContent.isPending && <Loader2 size={16} className="animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ── Social Links Tab ──────────────────────────────────────────────────────────

function SocialLinksTab() {
  const { data: mediaContacts, isLoading } = useMediaContacts();
  const updateMediaContacts = useUpdateMediaContacts();

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramProfile, setInstagramProfile] = useState('');
  const [initialized, setInitialized] = useState(false);

  if (mediaContacts && !initialized) {
    setWhatsappNumber(mediaContacts.whatsappNumber);
    setInstagramProfile(mediaContacts.instagramProfile);
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!whatsappNumber.trim()) {
      toast.error('Please enter a WhatsApp number');
      return;
    }
    if (!instagramProfile.trim()) {
      toast.error('Please enter an Instagram profile URL');
      return;
    }
    try {
      await updateMediaContacts.mutateAsync({
        whatsappNumber: whatsappNumber.trim(),
        instagramProfile: instagramProfile.trim(),
      });
      toast.success('Social links updated successfully!');
    } catch {
      toast.error('Failed to update social links');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Social Links</h2>
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="flex items-center gap-2">
            <Phone size={16} className="text-green-600" />
            WhatsApp Number
          </Label>
          <Input
            id="whatsapp"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="e.g. 917665854193 (with country code, no + or spaces)"
          />
          <p className="text-xs text-muted-foreground">
            Enter the number with country code (e.g. 917665854193 for India +91 76658 54193). Used to generate the WhatsApp link.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram" className="flex items-center gap-2">
            <Instagram size={16} className="text-pink-600" />
            Instagram Profile URL
          </Label>
          <Input
            id="instagram"
            value={instagramProfile}
            onChange={(e) => setInstagramProfile(e.target.value)}
            placeholder="e.g. https://instagram.com/yourusername"
          />
          <p className="text-xs text-muted-foreground">
            Full Instagram profile URL. Used for the QR code and contact links.
          </p>
        </div>

        {(whatsappNumber || instagramProfile) && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Preview</p>
            {whatsappNumber && (
              <p className="text-sm text-muted-foreground">
                WhatsApp link:{' '}
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  https://wa.me/{whatsappNumber}
                </a>
              </p>
            )}
            {instagramProfile && (
              <p className="text-sm text-muted-foreground">
                Instagram:{' '}
                <a
                  href={instagramProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {instagramProfile}
                </a>
              </p>
            )}
          </div>
        )}

        <Button onClick={handleSave} disabled={updateMediaContacts.isPending} className="gap-2">
          {updateMediaContacts.isPending && <Loader2 size={16} className="animate-spin" />}
          Save Social Links
        </Button>
      </div>
    </div>
  );
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  const navigate = useNavigate();

  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
  if (!isAuthenticated) {
    navigate({ to: '/admin-login' });
    return null;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    navigate({ to: '/admin-login' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Khudrang Kalakaar</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="gallery">
          <TabsList className="mb-8 flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="gallery" className="gap-2">
              <ImageIcon size={16} />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="site-images" className="gap-2">
              <Upload size={16} />
              Site Images
            </TabsTrigger>
            <TabsTrigger value="text-content" className="gap-2">
              <Type size={16} />
              Text Content
            </TabsTrigger>
            <TabsTrigger value="social-links" className="gap-2">
              <Phone size={16} />
              Social Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery">
            <GalleryTab />
          </TabsContent>
          <TabsContent value="site-images">
            <SiteImagesTab />
          </TabsContent>
          <TabsContent value="text-content">
            <TextContentTab />
          </TabsContent>
          <TabsContent value="social-links">
            <SocialLinksTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
