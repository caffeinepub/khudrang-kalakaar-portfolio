import { useState, useRef, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useIsCallerAdmin,
  useGetLogo, useUploadLogo,
  useGetCoverImage, useUploadCoverImage,
  useGetArtistPortrait, useUploadArtistPortrait,
  useGetTextContent, useUpdateTextContent,
  useGetAllArtworks, useAddArtwork, useUpdateArtwork, useDeleteArtwork,
} from '../hooks/useQueries';
import { ExternalBlob, type Artwork } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Upload, Trash2, Pencil, ImagePlus, LogIn, ShieldAlert,
  ArrowLeft, Loader2, CheckCircle2, Palette, User, Type, Image,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fileToExternalBlob(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ExternalBlob> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const blob = ExternalBlob.fromBytes(bytes);
  return onProgress ? blob.withUploadProgress(onProgress) : blob;
}

// ─── ImageUploadField ─────────────────────────────────────────────────────────

function ImageUploadField({
  label,
  currentUrl,
  onUpload,
  isUploading,
  progress,
}: {
  label: string;
  currentUrl?: string | null;
  onUpload: (file: File) => void;
  isUploading: boolean;
  progress: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {currentUrl && (
        <div className="relative rounded-md overflow-hidden border border-border">
          <img src={currentUrl} alt={label} className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-sm font-medium">Current Image</span>
          </div>
        </div>
      )}
      {!currentUrl && (
        <div className="h-48 rounded-md border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
          <div className="text-center text-muted-foreground">
            <ImagePlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No image uploaded yet</p>
          </div>
        </div>
      )}
      {isUploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{progress}%</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="w-full border-terracotta text-terracotta hover:bg-terracotta hover:text-white transition-colors"
      >
        {isUploading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</>
        ) : (
          <><Upload className="w-4 h-4 mr-2" /> {currentUrl ? 'Replace Image' : 'Upload Image'}</>
        )}
      </Button>
    </div>
  );
}

// ─── TextContentForm ──────────────────────────────────────────────────────────

function TextContentForm() {
  const { data: textContent, isLoading } = useGetTextContent();
  const updateTextContent = useUpdateTextContent();

  const [artistName, setArtistName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (textContent && !initialized) {
      setArtistName(textContent.artistName);
      setTagline(textContent.tagline);
      setBio(textContent.bio);
      setInitialized(true);
    }
  }, [textContent, initialized]);

  const handleSave = () => {
    updateTextContent.mutate({ artistName, tagline, bio });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="artist-name">Artist Name</Label>
        <Input
          id="artist-name"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          placeholder="e.g. Mudit Sharma"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="e.g. Transforming Spaces with Art"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio / About Text</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write a short bio about the artist…"
          rows={5}
        />
      </div>
      <Button
        onClick={handleSave}
        disabled={updateTextContent.isPending || !artistName.trim()}
        className="w-full bg-terracotta hover:bg-terracotta-dark text-white"
      >
        {updateTextContent.isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
        ) : (
          <><CheckCircle2 className="w-4 h-4 mr-2" /> Save Text Content</>
        )}
      </Button>
      {updateTextContent.isSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" /> Text content updated successfully!
        </p>
      )}
      {updateTextContent.isError && (
        <p className="text-sm text-destructive">Failed to update text content. Please try again.</p>
      )}
    </div>
  );
}

// ─── ArtworkForm ──────────────────────────────────────────────────────────────

function ArtworkForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: Artwork;
  onSave: (title: string, description: string, file: File | null) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial ? initial.image.getDirectURL() : null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const canSave = title.trim() !== '' && (initial ? true : file !== null);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="art-title">Title *</Label>
        <Input
          id="art-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Rajasthani Mural"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="art-desc">Description</Label>
        <Textarea
          id="art-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description…"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Artwork Image {!initial && '*'}</Label>
        {preview && (
          <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-md border border-border" />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="w-full border-dashed"
        >
          <ImagePlus className="w-4 h-4 mr-2" />
          {file ? 'Change Image' : initial ? 'Replace Image' : 'Select Image'}
        </Button>
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          onClick={() => onSave(title, description, file)}
          disabled={!canSave || isSaving}
          className="flex-1 bg-terracotta hover:bg-terracotta-dark text-white"
        >
          {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Save</>}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── ArtworkCard ──────────────────────────────────────────────────────────────

function ArtworkCard({
  artwork,
  onEdit,
  onDelete,
  isDeleting,
}: {
  artwork: Artwork;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <Card className="overflow-hidden group">
      <div className="relative">
        <img
          src={artwork.image.getDirectURL()}
          alt={artwork.title}
          className="w-full h-44 object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-1" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Artwork?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{artwork.title}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <CardContent className="p-3">
        <p className="font-semibold text-sm text-foreground truncate">{artwork.title}</p>
        {artwork.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{artwork.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: logoBlob } = useGetLogo();
  const { data: coverBlob } = useGetCoverImage();
  const { data: portraitBlob } = useGetArtistPortrait();
  const { data: artworks = [], isLoading: artworksLoading } = useGetAllArtworks();

  const uploadLogo = useUploadLogo();
  const uploadCover = useUploadCoverImage();
  const uploadPortrait = useUploadArtistPortrait();
  const addArtwork = useAddArtwork();
  const updateArtwork = useUpdateArtwork();
  const deleteArtwork = useDeleteArtwork();

  const [logoProgress, setLogoProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [portraitProgress, setPortraitProgress] = useState(0);
  const [artworkProgress, setArtworkProgress] = useState(0);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleLogoUpload = async (file: File) => {
    setLogoProgress(0);
    const blob = await fileToExternalBlob(file, setLogoProgress);
    uploadLogo.mutate(blob);
  };

  const handleCoverUpload = async (file: File) => {
    setCoverProgress(0);
    const blob = await fileToExternalBlob(file, setCoverProgress);
    uploadCover.mutate(blob);
  };

  const handlePortraitUpload = async (file: File) => {
    setPortraitProgress(0);
    const blob = await fileToExternalBlob(file, setPortraitProgress);
    uploadPortrait.mutate(blob);
  };

  const handleAddArtwork = async (title: string, description: string, file: File | null) => {
    if (!file) return;
    setArtworkProgress(0);
    const blob = await fileToExternalBlob(file, setArtworkProgress);
    addArtwork.mutate({ title, description, image: blob }, {
      onSuccess: () => setShowAddForm(false),
    });
  };

  const handleUpdateArtwork = async (title: string, description: string, file: File | null) => {
    if (!editingArtwork) return;
    setArtworkProgress(0);
    let blob: ExternalBlob;
    if (file) {
      blob = await fileToExternalBlob(file, setArtworkProgress);
    } else {
      blob = editingArtwork.image;
    }
    updateArtwork.mutate(
      { id: editingArtwork.id, title, description, image: blob },
      { onSuccess: () => setEditingArtwork(null) }
    );
  };

  const handleDeleteArtwork = async (id: bigint) => {
    setDeletingId(id);
    deleteArtwork.mutate(id, { onSettled: () => setDeletingId(null) });
  };

  // ── Not logged in ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center shadow-card">
          <CardHeader>
            <div className="w-14 h-14 bg-terracotta rounded-sm flex items-center justify-center mx-auto mb-3">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl">Admin Login</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage your portfolio</p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full bg-terracotta hover:bg-terracotta-dark text-white"
            >
              {isLoggingIn ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…</>
              ) : (
                <><LogIn className="w-4 h-4 mr-2" /> Sign In</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Checking admin status ──
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
      </div>
    );
  }

  // ── Not admin ──
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center shadow-card">
          <CardHeader>
            <div className="w-14 h-14 bg-destructive/10 rounded-sm flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-7 h-7 text-destructive" />
            </div>
            <CardTitle className="text-xl">Access Denied</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              You don't have admin privileges to access this panel.
            </p>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Admin Panel ──
  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-xs sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-terracotta rounded-sm flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm leading-none">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Khudrang Kalakaar</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = '/')}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Site
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <Tabs defaultValue="branding">
          <TabsList className="mb-8 bg-white border border-border shadow-xs flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="branding" className="flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" /> Logo
            </TabsTrigger>
            <TabsTrigger value="cover" className="flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" /> Cover Image
            </TabsTrigger>
            <TabsTrigger value="portrait" className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Artist Portrait
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Text Content
            </TabsTrigger>
            <TabsTrigger value="artworks" className="flex items-center gap-1.5">
              <ImagePlus className="w-3.5 h-3.5" /> Artworks
            </TabsTrigger>
          </TabsList>

          {/* ── Branding / Logo Tab ── */}
          <TabsContent value="branding">
            <Card className="max-w-lg shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Site Logo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload or replace the logo shown in the navigation and footer.
                </p>
              </CardHeader>
              <CardContent>
                <ImageUploadField
                  label="Site Logo"
                  currentUrl={logoBlob ? logoBlob.getDirectURL() : null}
                  onUpload={handleLogoUpload}
                  isUploading={uploadLogo.isPending}
                  progress={logoProgress}
                />
                {uploadLogo.isSuccess && (
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-3">
                    <CheckCircle2 className="w-4 h-4" /> Logo updated successfully!
                  </p>
                )}
                {uploadLogo.isError && (
                  <p className="text-sm text-destructive mt-3">
                    Failed to upload logo. Please try again.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Cover Image Tab ── */}
          <TabsContent value="cover">
            <Card className="max-w-lg shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Cover / Hero Image</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload or replace the full-screen background image on the homepage.
                </p>
              </CardHeader>
              <CardContent>
                <ImageUploadField
                  label="Hero Background"
                  currentUrl={coverBlob ? coverBlob.getDirectURL() : null}
                  onUpload={handleCoverUpload}
                  isUploading={uploadCover.isPending}
                  progress={coverProgress}
                />
                {uploadCover.isSuccess && (
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-3">
                    <CheckCircle2 className="w-4 h-4" /> Cover image updated successfully!
                  </p>
                )}
                {uploadCover.isError && (
                  <p className="text-sm text-destructive mt-3">
                    Failed to upload cover image. Please try again.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Artist Portrait Tab ── */}
          <TabsContent value="portrait">
            <Card className="max-w-lg shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Artist Portrait</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload or replace the artist photo shown in the About section.
                </p>
              </CardHeader>
              <CardContent>
                <ImageUploadField
                  label="Artist Portrait"
                  currentUrl={portraitBlob ? portraitBlob.getDirectURL() : null}
                  onUpload={handlePortraitUpload}
                  isUploading={uploadPortrait.isPending}
                  progress={portraitProgress}
                />
                {uploadPortrait.isSuccess && (
                  <p className="text-sm text-green-600 flex items-center gap-1 mt-3">
                    <CheckCircle2 className="w-4 h-4" /> Artist portrait updated successfully!
                  </p>
                )}
                {uploadPortrait.isError && (
                  <p className="text-sm text-destructive mt-3">
                    Failed to upload portrait. Please try again.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Text Content Tab ── */}
          <TabsContent value="text">
            <Card className="max-w-lg shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Text Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Edit the artist name, tagline, and bio displayed on the site.
                </p>
              </CardHeader>
              <CardContent>
                <TextContentForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Artworks Tab ── */}
          <TabsContent value="artworks">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Artwork Gallery</h2>
                  <p className="text-sm text-muted-foreground">
                    {artworks.length} artwork{artworks.length !== 1 ? 's' : ''} in the gallery
                  </p>
                </div>
                {!showAddForm && !editingArtwork && (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-terracotta hover:bg-terracotta-dark text-white"
                  >
                    <ImagePlus className="w-4 h-4 mr-2" /> Add Artwork
                  </Button>
                )}
              </div>

              {/* Add Form */}
              {showAddForm && (
                <Card className="max-w-lg shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base">Add New Artwork</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArtworkForm
                      onSave={handleAddArtwork}
                      onCancel={() => setShowAddForm(false)}
                      isSaving={addArtwork.isPending}
                    />
                    {addArtwork.isError && (
                      <p className="text-sm text-destructive mt-3">Failed to add artwork. Please try again.</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Edit Form */}
              {editingArtwork && (
                <Card className="max-w-lg shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base">Edit Artwork</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ArtworkForm
                      initial={editingArtwork}
                      onSave={handleUpdateArtwork}
                      onCancel={() => setEditingArtwork(null)}
                      isSaving={updateArtwork.isPending}
                    />
                    {updateArtwork.isError && (
                      <p className="text-sm text-destructive mt-3">Failed to update artwork. Please try again.</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Artwork Grid */}
              {artworksLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-52 rounded-md" />
                  ))}
                </div>
              ) : artworks.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-md">
                  <ImagePlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No artworks yet</p>
                  <p className="text-sm mt-1">Click "Add Artwork" to upload your first piece.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artworks.map((artwork) => (
                    <ArtworkCard
                      key={artwork.id.toString()}
                      artwork={artwork}
                      onEdit={() => {
                        setShowAddForm(false);
                        setEditingArtwork(artwork);
                      }}
                      onDelete={() => handleDeleteArtwork(artwork.id)}
                      isDeleting={deletingId === artwork.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
