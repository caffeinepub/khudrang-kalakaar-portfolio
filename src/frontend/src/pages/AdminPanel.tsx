import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  Edit2,
  FileText,
  ImagePlus,
  Images,
  Loader2,
  LogOut,
  MapPin,
  Paintbrush,
  ShieldCheck,
  ShieldQuestion,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Artwork } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  useAddGalleryImage,
  useClaimAdminWithCode,
  useDeleteArtwork,
  useDeleteGalleryImage,
  useEditArtwork,
  useGetAdminPrincipal,
  useGetAllArtworks,
  useGetGalleryImages,
  useGetLogo,
  useGetMediaContacts,
  useUpdateMediaContacts,
  useUploadArtistPortrait,
  useUploadArtwork,
  useUploadCoverImage,
  useUploadLogo,
} from "../hooks/useQueries";
import { type SiteContent, useSiteContent } from "../hooks/useSiteContent";

const MAX_GALLERY_SIZE = 15 * 1024 * 1024; // 15MB

type Tab = "artworks" | "media" | "contacts" | "gallery" | "content";

// ── Compact colour swatch that opens a native colour picker ──
interface ColorSwatchProps {
  value: string;
  onChange: (color: string) => void;
  title?: string;
}

function ColorSwatch({ value, onChange, title }: ColorSwatchProps) {
  const swatchRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative shrink-0" title={title || "Pick colour"}>
      <button
        type="button"
        onClick={() => swatchRef.current?.click()}
        className="w-8 h-8 rounded-lg border-2 border-cream-dark shadow-sm hover:border-terracotta/60 transition-colors flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-terracotta/40"
        style={{ backgroundColor: value || "transparent" }}
        aria-label={title || "Pick colour"}
        data-ocid="content.color_swatch.button"
      >
        {!value && <Paintbrush size={12} className="text-charcoal/40" />}
      </button>
      <input
        ref={swatchRef}
        type="color"
        value={value || "#888888"}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-charcoal/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors leading-none"
          title="Reset to default"
          aria-label="Reset colour"
          data-ocid="content.color_reset.button"
        >
          <X size={8} />
        </button>
      )}
    </div>
  );
}

// ── Label + colour swatch + input field row ──
interface FieldRowProps {
  label: string;
  colorValue: string;
  onColorChange: (color: string) => void;
  children: React.ReactNode;
}

function FieldRow({
  label,
  colorValue,
  onColorChange,
  children,
}: FieldRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-inter text-sm font-medium text-charcoal">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-inter text-xs text-charcoal/40">
            Font colour
          </span>
          <ColorSwatch
            value={colorValue}
            onChange={onColorChange}
            title={`${label} font colour`}
          />
        </div>
      </div>
      {children}
    </div>
  );
}

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
  const {
    data: adminPrincipal,
    isLoading: adminLoading,
    isError: adminError,
    refetch,
  } = useGetAdminPrincipal();
  const claimAdminWithCode = useClaimAdminWithCode();

  const [code, setCode] = useState("");
  const [justClaimed, setJustClaimed] = useState(false);
  const [codeError, setCodeError] = useState("");

  const handleClaim = async () => {
    if (code.length !== 6) {
      setCodeError("Please enter a 6-digit code.");
      return;
    }
    setCodeError("");
    try {
      await claimAdminWithCode.mutateAsync(code);
      setJustClaimed(true);
      setCode("");
      toast.success("Admin access claimed! You now have full admin rights.");
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      // If code is correct but admin already claimed, treat as success for this session
      if (msg.includes("already claimed")) {
        setJustClaimed(true);
        setCode("");
        toast.info(
          "Admin access is already registered. You are now authenticated for this session.",
        );
        refetch();
      } else {
        setCodeError(
          msg.includes("Invalid code")
            ? "Wrong code. Please check and try again."
            : msg,
        );
        toast.error(`Failed to claim admin: ${msg}`);
      }
    }
  };

  const isLoading = actorFetching || adminLoading;

  if (isLoading) {
    return (
      <div className="mx-4 sm:mx-6 mt-4 max-w-5xl lg:mx-auto">
        <div className="flex items-center gap-3 bg-cream-dark/50 border border-cream-dark rounded-xl px-4 py-3">
          <Loader2 size={16} className="animate-spin text-charcoal/50" />
          <span className="font-inter text-sm text-charcoal/60">
            Connecting to backend…
          </span>
        </div>
      </div>
    );
  }

  // Admin is already registered and confirmed active
  if (adminPrincipal && !justClaimed) {
    return (
      <div className="mx-4 sm:mx-6 mt-4 max-w-5xl lg:mx-auto">
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <ShieldCheck size={18} className="text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="font-inter text-sm font-semibold text-green-800">
              Admin access active — all features unlocked
            </p>
            <p className="font-inter text-xs text-green-700 mt-0.5 font-mono break-all">
              Session authenticated. You can upload images, edit text, and
              manage all content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin just claimed in this session
  if (justClaimed) {
    return (
      <div className="mx-4 sm:mx-6 mt-4 max-w-5xl lg:mx-auto">
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <ShieldCheck size={18} className="text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="font-inter text-sm font-semibold text-green-800">
              Admin access granted! All features are now unlocked.
            </p>
            <p className="font-inter text-xs text-green-700 mt-0.5">
              You can now upload images, manage projects, edit text, and update
              social media links.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No admin set yet OR error fetching — show 6-digit code form
  return (
    <div className="mx-4 sm:mx-6 mt-4 max-w-5xl lg:mx-auto">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <div className="flex items-start gap-3 mb-4">
          <ShieldQuestion
            size={20}
            className="text-amber-600 shrink-0 mt-0.5"
          />
          <div>
            <p className="font-inter text-sm font-semibold text-amber-800">
              Enter your 6-digit admin code
            </p>
            <p className="font-inter text-xs text-amber-700 mt-0.5">
              {adminError
                ? "Backend is restarting — enter code 131104 to re-authenticate as admin."
                : "Enter the 6-digit admin code to unlock full admin access."}
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
                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(val);
                setCodeError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && code.length === 6) handleClaim();
              }}
              placeholder="Enter 6-digit code (131104)"
              className={`w-full border rounded-lg px-4 py-2.5 font-inter text-sm text-charcoal tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
                codeError
                  ? "border-red-400 bg-red-50"
                  : "border-amber-300 bg-white"
              }`}
              data-ocid="admin.code.input"
            />
            {codeError && (
              <p className="font-inter text-xs text-red-600 mt-1">
                {codeError}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClaim}
            disabled={claimAdminWithCode.isPending || code.length !== 6}
            className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 shrink-0"
            data-ocid="admin.claim.button"
          >
            {claimAdminWithCode.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ShieldCheck size={14} />
            )}
            {claimAdminWithCode.isPending ? "Authenticating…" : "Unlock Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Gallery Tab ──
function GalleryTab() {
  const { data: galleryImages = [], isLoading: galleryLoading } =
    useGetGalleryImages();
  const addGalleryImage = useAddGalleryImage();
  const deleteGalleryImage = useDeleteGalleryImage();

  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileError, setFileError] = useState("");
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileError("");
    if (file) {
      if (file.size > MAX_GALLERY_SIZE) {
        setFileError(
          `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 15 MB.`,
        );
        setGalleryFile(null);
        if (galleryInputRef.current) galleryInputRef.current.value = "";
        return;
      }
    }
    setGalleryFile(file);
  };

  const handleUpload = async () => {
    if (!galleryFile) {
      setFileError("Please select an image to upload.");
      return;
    }
    setUploadProgress(0);
    try {
      await addGalleryImage.mutateAsync({
        file: galleryFile,
        onProgress: (pct) => setUploadProgress(pct),
      });
      toast.success("Artwork uploaded to gallery!");
      setGalleryFile(null);
      setUploadProgress(0);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Upload failed: ${msg}`);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: bigint, filename: string) => {
    if (
      !confirm(`Delete "${filename}" from the gallery? This cannot be undone.`)
    )
      return;
    try {
      await deleteGalleryImage.mutateAsync(id);
      toast.success("Image removed from gallery.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
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
          Accepted formats: JPG, PNG, WEBP, GIF · Maximum size: 15 MB · No
          upload limit
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
              <p className="font-inter text-xs text-red-600 mt-1">
                {fileError}
              </p>
            )}
            {galleryFile && !fileError && (
              <p className="font-inter text-xs text-charcoal/50 mt-1">
                Selected: {galleryFile.name} (
                {(galleryFile.size / 1024 / 1024).toFixed(2)} MB)
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
            type="button"
            onClick={handleUpload}
            disabled={addGalleryImage.isPending || !galleryFile || !!fileError}
            className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {addGalleryImage.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {uploadProgress > 0
                  ? `Uploading ${uploadProgress}%…`
                  : "Uploading…"}
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
              ({galleryImages.length}{" "}
              {galleryImages.length === 1 ? "image" : "images"})
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
                    type="button"
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
                  <p className="text-cream font-inter text-xs truncate">
                    {image.filename}
                  </p>
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
  const [activeTab, setActiveTab] = useState<Tab>("artworks");

  // Artworks state
  const { data: artworks, isLoading: artworksLoading } = useGetAllArtworks();
  const uploadArtwork = useUploadArtwork();
  const editArtwork = useEditArtwork();
  const deleteArtwork = useDeleteArtwork();

  // New artwork form
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const newImageRef = useRef<HTMLInputElement>(null);

  // Editing state
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editForm, setEditForm] = useState<EditingArtwork | null>(null);
  const editImageRef = useRef<HTMLInputElement>(null);

  // Media contacts state
  const { data: mediaContacts } = useGetMediaContacts();
  const updateMediaContacts = useUpdateMediaContacts();
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");

  // Sync contacts form from fetched data
  useEffect(() => {
    if (mediaContacts) {
      setWhatsapp(mediaContacts.whatsappNumber || "");
      setInstagram(mediaContacts.instagramProfile || "");
      setEmail(mediaContacts.email || "");
    }
  }, [mediaContacts]);

  // Logo/Cover/Portrait upload hooks
  const uploadLogo = useUploadLogo();
  const uploadCoverImage = useUploadCoverImage();
  const uploadArtistPortrait = useUploadArtistPortrait();

  // Backend logo for header
  const { data: logoData } = useGetLogo();
  const adminLogoUrl = logoData
    ? logoData.getDirectURL()
    : "/assets/generated/logo-k.dim_200x200.png";

  // Site content (localStorage)
  const { content: siteContent, updateContent } = useSiteContent();
  const [contentForm, setContentForm] = useState<SiteContent>({
    artistName: siteContent.artistName,
    heroTagline: siteContent.heroTagline,
    aboutBio: siteContent.aboutBio,
    location: siteContent.location,
    heroSubtitle: siteContent.heroSubtitle,
    servicesIntro: siteContent.servicesIntro,
    whyChooseIntro: siteContent.whyChooseIntro,
    contactHeading: siteContent.contactHeading,
    contactSubtext: siteContent.contactSubtext,
    stat1Value: siteContent.stat1Value,
    stat1Label: siteContent.stat1Label,
    stat2Value: siteContent.stat2Value,
    stat2Label: siteContent.stat2Label,
    stat3Value: siteContent.stat3Value,
    stat3Label: siteContent.stat3Label,
    stat4Value: siteContent.stat4Value,
    stat4Label: siteContent.stat4Label,
    fontFamily: siteContent.fontFamily,
    primaryTextColor: siteContent.primaryTextColor,
    accentColor: siteContent.accentColor,
    // Per-field colors
    artistNameColor: siteContent.artistNameColor,
    heroTaglineColor: siteContent.heroTaglineColor,
    heroSubtitleColor: siteContent.heroSubtitleColor,
    aboutBioColor: siteContent.aboutBioColor,
    locationColor: siteContent.locationColor,
    servicesIntroColor: siteContent.servicesIntroColor,
    whyChooseIntroColor: siteContent.whyChooseIntroColor,
    contactHeadingColor: siteContent.contactHeadingColor,
    contactSubtextColor: siteContent.contactSubtextColor,
    stat1ValueColor: siteContent.stat1ValueColor,
    stat1LabelColor: siteContent.stat1LabelColor,
    stat2ValueColor: siteContent.stat2ValueColor,
    stat2LabelColor: siteContent.stat2LabelColor,
    stat3ValueColor: siteContent.stat3ValueColor,
    stat3LabelColor: siteContent.stat3LabelColor,
    stat4ValueColor: siteContent.stat4ValueColor,
    stat4LabelColor: siteContent.stat4LabelColor,
  });

  // Logo/Cover/Portrait file state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const portraitRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    navigate({ to: "/" });
  };

  // ── Artwork handlers ──
  const handleUploadArtwork = async () => {
    if (!newTitle.trim()) {
      toast.error("Please provide a title.");
      return;
    }
    try {
      await uploadArtwork.mutateAsync({
        title: newTitle.trim(),
        description: newDescription.trim(),
        imageFile: newImageFile,
        location: newLocation.trim() || null,
      });
      toast.success("Project added successfully!");
      setNewTitle("");
      setNewDescription("");
      setNewLocation("");
      setNewImageFile(null);
      if (newImageRef.current) newImageRef.current.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to add project: ${msg}`);
    }
  };

  const startEditing = (artwork: Artwork) => {
    setEditingId(artwork.id);
    setEditForm({
      id: artwork.id,
      title: artwork.title,
      description: artwork.description,
      location: artwork.location || "",
      existingImage: artwork.image ?? undefined,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
    if (editImageRef.current) editImageRef.current.value = "";
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
      toast.success("Project updated successfully!");
      cancelEditing();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to update project: ${msg}`);
    }
  };

  const handleDeleteArtwork = async (id: bigint) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteArtwork.mutateAsync(id);
      toast.success("Project deleted.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to delete project: ${msg}`);
    }
  };

  // ── Contacts handler ──
  const handleUpdateContacts = async () => {
    try {
      await updateMediaContacts.mutateAsync({
        whatsappNumber: whatsapp.trim(),
        instagramProfile: instagram.trim(),
        email: email.trim() || null,
      });
      toast.success("Contact info updated successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to update contacts: ${msg}`);
    }
  };

  // ── Media upload handlers ──
  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error("Please select a logo image.");
      return;
    }
    try {
      const blob = await fileToExternalBlob(logoFile);
      await uploadLogo.mutateAsync(blob);
      toast.success("Logo uploaded successfully!");
      setLogoFile(null);
      if (logoRef.current) logoRef.current.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to upload logo: ${msg}`);
    }
  };

  const handleUploadCover = async () => {
    if (!coverFile) {
      toast.error("Please select a cover image.");
      return;
    }
    try {
      const blob = await fileToExternalBlob(coverFile);
      await uploadCoverImage.mutateAsync(blob);
      toast.success("Cover image uploaded successfully!");
      setCoverFile(null);
      if (coverRef.current) coverRef.current.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to upload cover image: ${msg}`);
    }
  };

  const handleUploadPortrait = async () => {
    if (!portraitFile) {
      toast.error("Please select a portrait image.");
      return;
    }
    try {
      const blob = await fileToExternalBlob(portraitFile);
      await uploadArtistPortrait.mutateAsync(blob);
      toast.success("Portrait uploaded successfully!");
      setPortraitFile(null);
      if (portraitRef.current) portraitRef.current.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to upload portrait: ${msg}`);
    }
  };

  const TAB_LABELS: Record<Tab, string> = {
    artworks: "Projects",
    media: "Site Media",
    contacts: "Contacts",
    gallery: "Gallery",
    content: "Edit Text",
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-charcoal text-cream px-6 py-4 flex items-center justify-between shadow-warm-lg">
        <div className="flex items-center gap-3">
          <img
            src={adminLogoUrl}
            alt="Logo"
            className="h-9 w-9 object-contain"
          />
          <div>
            <h1 className="font-playfair font-bold text-xl text-cream">
              Admin Panel
            </h1>
            <p className="font-inter text-cream/60 text-xs">
              Khudrang Kalakaar
            </p>
          </div>
        </div>
        <button
          type="button"
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
          {(
            ["artworks", "media", "contacts", "gallery", "content"] as Tab[]
          ).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-4 font-inter text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-terracotta text-terracotta"
                  : "border-transparent text-charcoal/60 hover:text-charcoal"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* ── ARTWORKS TAB ── */}
        {activeTab === "artworks" && (
          <div className="space-y-8">
            {/* Add New Artwork */}
            <div className="bg-white rounded-2xl shadow-warm-md p-6">
              <h2 className="font-playfair font-bold text-xl text-charcoal mb-5">
                Add New Project
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="new-title"
                    className="block font-inter text-sm font-medium text-charcoal mb-1"
                  >
                    Title *
                  </label>
                  <input
                    id="new-title"
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Project title"
                    className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-location"
                    className="block font-inter text-sm font-medium text-charcoal mb-1"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-terracotta"
                    />
                    <input
                      id="new-location"
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Ajmer, Rajasthan"
                      className="w-full border border-cream-dark rounded-lg pl-8 pr-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="new-description"
                    className="block font-inter text-sm font-medium text-charcoal mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="new-description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Project description"
                    rows={3}
                    className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="new-image"
                    className="block font-inter text-sm font-medium text-charcoal mb-1"
                  >
                    Image (optional)
                  </label>
                  <input
                    id="new-image"
                    ref={newImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewImageFile(e.target.files?.[0] || null)
                    }
                    className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
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
                              <label
                                htmlFor="edit-title"
                                className="block font-inter text-xs font-medium text-charcoal/70 mb-1"
                              >
                                Title
                              </label>
                              <input
                                id="edit-title"
                                type="text"
                                value={editForm.title}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="edit-location"
                                className="block font-inter text-xs font-medium text-charcoal/70 mb-1"
                              >
                                Location
                              </label>
                              <div className="relative">
                                <MapPin
                                  size={12}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 text-terracotta"
                                />
                                <input
                                  id="edit-location"
                                  type="text"
                                  value={editForm.location}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      location: e.target.value,
                                    })
                                  }
                                  placeholder="e.g. Ajmer, Rajasthan"
                                  className="w-full border border-cream-dark rounded-lg pl-7 pr-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                                />
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <label
                                htmlFor="edit-description"
                                className="block font-inter text-xs font-medium text-charcoal/70 mb-1"
                              >
                                Description
                              </label>
                              <textarea
                                id="edit-description"
                                value={editForm.description}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    description: e.target.value,
                                  })
                                }
                                rows={2}
                                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label
                                htmlFor="edit-image"
                                className="block font-inter text-xs font-medium text-charcoal/70 mb-1"
                              >
                                Replace Image (optional)
                              </label>
                              <input
                                id="edit-image"
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
                              type="button"
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
                              type="button"
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
                              <span className="text-charcoal/30 text-xs">
                                No img
                              </span>
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
                              type="button"
                              onClick={() => startEditing(artwork)}
                              className="p-2 text-charcoal/50 hover:text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
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
        {activeTab === "media" && (
          <div className="space-y-6">
            {/* Logo */}
            <div className="bg-white rounded-2xl shadow-warm-md p-6">
              <h2 className="font-playfair font-bold text-lg text-charcoal mb-4">
                Logo
              </h2>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none mb-3"
              />
              <button
                type="button"
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
              <h2 className="font-playfair font-bold text-lg text-charcoal mb-4">
                Cover Image
              </h2>
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none mb-3"
              />
              <button
                type="button"
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
                type="button"
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
        {activeTab === "contacts" && (
          <div className="bg-white rounded-2xl shadow-warm-md p-6">
            <h2 className="font-playfair font-bold text-xl text-charcoal mb-1">
              Contact Information
            </h2>
            <p className="font-inter text-xs text-charcoal/50 mb-5">
              Set your contact details below. Once saved, they will be visible
              in the website's contact section. You can add or update the
              contact email at any time from here.
            </p>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="contacts-whatsapp"
                  className="block font-inter text-sm font-medium text-charcoal mb-1"
                >
                  WhatsApp Number
                </label>
                <input
                  id="contacts-whatsapp"
                  data-ocid="contacts.whatsapp.input"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </div>
              <div>
                <label
                  htmlFor="contacts-instagram"
                  className="block font-inter text-sm font-medium text-charcoal mb-1"
                >
                  Instagram Profile URL
                </label>
                <input
                  id="contacts-instagram"
                  data-ocid="contacts.instagram.input"
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/khudrangkalakaar"
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </div>
              <div>
                <label
                  htmlFor="contacts-email"
                  className="block font-inter text-sm font-medium text-charcoal mb-1"
                >
                  Contact Email{" "}
                  <span className="font-normal text-charcoal/40">
                    (optional)
                  </span>
                </label>
                <input
                  id="contacts-email"
                  data-ocid="contacts.email.input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artist@example.com"
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
                <p className="font-inter text-xs text-charcoal/40 mt-1">
                  Add a contact email so clients can reach you directly. Leave
                  blank to hide email from the website.
                </p>
              </div>
            </div>
            <button
              type="button"
              data-ocid="contacts.save_button"
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
        {activeTab === "gallery" && <GalleryTab />}

        {/* ── CONTENT TAB ── */}
        {activeTab === "content" && (
          <div className="bg-white rounded-2xl shadow-warm-md p-6">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={20} className="text-terracotta" />
              <h2 className="font-playfair font-bold text-xl text-charcoal">
                Edit Website Text
              </h2>
            </div>
            <p className="font-inter text-xs text-charcoal/50 mb-5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Changes are saved to this browser. Text updates will appear
              immediately on the website. Use the{" "}
              <Paintbrush size={10} className="inline text-terracotta" /> colour
              swatch next to each field to set a custom font colour for that
              section.
            </p>

            <div className="space-y-5">
              {/* ── Typography Controls ── */}
              <div className="bg-cream/60 border border-cream-dark rounded-xl p-4 space-y-4">
                <p className="font-inter text-sm font-semibold text-charcoal flex items-center gap-2">
                  <span>🎨</span> Typography &amp; Global Colours
                </p>

                {/* Font Family */}
                <div>
                  <label
                    htmlFor="content-font-family"
                    className="block font-inter text-xs font-medium text-charcoal/70 mb-1"
                  >
                    Font Family
                  </label>
                  <select
                    id="content-font-family"
                    data-ocid="content.font-family.select"
                    value={contentForm.fontFamily}
                    onChange={(e) =>
                      setContentForm({
                        ...contentForm,
                        fontFamily: e.target.value,
                      })
                    }
                    className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40 bg-white"
                  >
                    <option value="Inter">
                      Inter (Default – Clean &amp; Modern)
                    </option>
                    <option value="Playfair Display">
                      Playfair Display (Elegant &amp; Serif)
                    </option>
                    <option value="Poppins">
                      Poppins (Friendly &amp; Round)
                    </option>
                    <option value="Montserrat">
                      Montserrat (Bold &amp; Geometric)
                    </option>
                    <option value="Lato">
                      Lato (Light &amp; Professional)
                    </option>
                    <option value="Raleway">
                      Raleway (Stylish &amp; Thin)
                    </option>
                    <option value="Oswald">
                      Oswald (Condensed &amp; Strong)
                    </option>
                    <option value="Merriweather">
                      Merriweather (Classic Serif)
                    </option>
                    <option value="Nunito">Nunito (Soft &amp; Rounded)</option>
                    <option value="Roboto">
                      Roboto (Neutral &amp; Universal)
                    </option>
                    <option value="Open Sans">
                      Open Sans (Readable &amp; Neutral)
                    </option>
                    <option value="Dancing Script">
                      Dancing Script (Handwritten)
                    </option>
                  </select>
                  <p className="font-inter text-xs text-charcoal/40 mt-1">
                    Preview:{" "}
                    <span style={{ fontFamily: contentForm.fontFamily }}>
                      Khudrang Kalakaar — Wall Art
                    </span>
                  </p>
                </div>

                {/* Primary Text Colour */}
                <div>
                  <label
                    htmlFor="content-primary-color"
                    className="block font-inter text-xs font-medium text-charcoal/70 mb-1"
                  >
                    Primary Text Colour{" "}
                    <span className="font-normal text-charcoal/40">
                      (global fallback)
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="content-primary-color"
                      data-ocid="content.primary-color.input"
                      type="color"
                      value={contentForm.primaryTextColor}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          primaryTextColor: e.target.value,
                        })
                      }
                      className="h-10 w-14 rounded-lg border border-cream-dark cursor-pointer bg-white p-0.5"
                    />
                    <input
                      type="text"
                      value={contentForm.primaryTextColor}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          primaryTextColor: e.target.value,
                        })
                      }
                      placeholder="#1a1a2e"
                      className="flex-1 border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40 font-mono"
                    />
                  </div>
                  <p className="font-inter text-xs text-charcoal/40 mt-1">
                    Used for headings and main body text. Per-field colours
                    below override this.
                  </p>
                </div>

                {/* Accent Colour */}
                <div>
                  <label
                    htmlFor="content-accent-color"
                    className="block font-inter text-xs font-medium text-charcoal/70 mb-1"
                  >
                    Accent / Highlight Colour
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="content-accent-color"
                      data-ocid="content.accent-color.input"
                      type="color"
                      value={contentForm.accentColor}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          accentColor: e.target.value,
                        })
                      }
                      className="h-10 w-14 rounded-lg border border-cream-dark cursor-pointer bg-white p-0.5"
                    />
                    <input
                      type="text"
                      value={contentForm.accentColor}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          accentColor: e.target.value,
                        })
                      }
                      placeholder="#c0392b"
                      className="flex-1 border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40 font-mono"
                    />
                  </div>
                  <p className="font-inter text-xs text-charcoal/40 mt-1">
                    Used for buttons, highlights, and decorative elements.
                  </p>
                </div>

                {/* Live Preview */}
                <div
                  className="rounded-xl p-4 border border-cream-dark bg-white"
                  style={{ fontFamily: contentForm.fontFamily }}
                >
                  <p className="text-xs font-inter text-charcoal/40 mb-2 uppercase tracking-wide">
                    Live Preview
                  </p>
                  <h3
                    className="text-2xl font-bold mb-1"
                    style={{
                      color:
                        contentForm.artistNameColor ||
                        contentForm.primaryTextColor,
                    }}
                  >
                    {contentForm.artistName || "Mudit Sharma"}
                  </h3>
                  <p
                    className="text-sm mb-2"
                    style={{
                      color:
                        contentForm.heroTaglineColor ||
                        `${contentForm.primaryTextColor}aa`,
                    }}
                  >
                    {contentForm.heroTagline ||
                      "Transforming Blank Walls into Meaningful Art."}
                  </p>
                  <span
                    className="inline-block text-xs font-semibold px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: contentForm.accentColor }}
                  >
                    Wall Art Specialist
                  </span>
                </div>
              </div>

              {/* ── Per-Field Colour hint ── */}
              <div className="flex items-start gap-2 bg-terracotta/5 border border-terracotta/20 rounded-lg px-3 py-2">
                <Paintbrush
                  size={14}
                  className="text-terracotta shrink-0 mt-0.5"
                />
                <p className="font-inter text-xs text-charcoal/60">
                  Each field below has its own{" "}
                  <strong className="text-charcoal/80">colour swatch</strong>{" "}
                  button. Click it to pick a custom colour for that sentence or
                  section. Leave it as{" "}
                  <code className="bg-cream px-1 rounded text-xs">inherit</code>{" "}
                  (default) to use the global primary colour.
                </p>
              </div>

              {/* Artist Name */}
              <FieldRow
                label="Artist Name"
                colorValue={contentForm.artistNameColor}
                onColorChange={(c) =>
                  setContentForm({ ...contentForm, artistNameColor: c })
                }
              >
                <input
                  id="content-artist-name"
                  data-ocid="content.artist-name.input"
                  type="text"
                  value={contentForm.artistName}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      artistName: e.target.value,
                    })
                  }
                  placeholder="Mudit Sharma"
                  style={
                    contentForm.artistNameColor
                      ? { color: contentForm.artistNameColor }
                      : undefined
                  }
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </FieldRow>

              {/* Hero Tagline */}
              <FieldRow
                label="Hero Tagline"
                colorValue={contentForm.heroTaglineColor}
                onColorChange={(c) =>
                  setContentForm({ ...contentForm, heroTaglineColor: c })
                }
              >
                <input
                  id="content-hero-tagline"
                  data-ocid="content.hero-tagline.input"
                  type="text"
                  value={contentForm.heroTagline}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      heroTagline: e.target.value,
                    })
                  }
                  placeholder="Transforming Blank Walls into Meaningful Art."
                  style={
                    contentForm.heroTaglineColor
                      ? { color: contentForm.heroTaglineColor }
                      : undefined
                  }
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </FieldRow>

              {/* Hero Subtitle */}
              <FieldRow
                label="Hero Subtitle"
                colorValue={contentForm.heroSubtitleColor}
                onColorChange={(c) =>
                  setContentForm({ ...contentForm, heroSubtitleColor: c })
                }
              >
                <input
                  id="content-hero-subtitle"
                  data-ocid="content.hero-subtitle.input"
                  type="text"
                  value={contentForm.heroSubtitle}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      heroSubtitle: e.target.value,
                    })
                  }
                  placeholder="Professional Wall Painting Artist"
                  style={
                    contentForm.heroSubtitleColor
                      ? { color: contentForm.heroSubtitleColor }
                      : undefined
                  }
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </FieldRow>

              {/* About Bio */}
              <FieldRow
                label="About / Bio"
                colorValue={contentForm.aboutBioColor}
                onColorChange={(c) =>
                  setContentForm({ ...contentForm, aboutBioColor: c })
                }
              >
                <textarea
                  id="content-about-bio"
                  data-ocid="content.about-bio.textarea"
                  value={contentForm.aboutBio}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, aboutBio: e.target.value })
                  }
                  rows={5}
                  placeholder="Artist biography..."
                  style={
                    contentForm.aboutBioColor
                      ? { color: contentForm.aboutBioColor }
                      : undefined
                  }
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
                />
              </FieldRow>

              {/* Location */}
              <FieldRow
                label="Location"
                colorValue={contentForm.locationColor}
                onColorChange={(c) =>
                  setContentForm({ ...contentForm, locationColor: c })
                }
              >
                <input
                  id="content-location"
                  data-ocid="content.location.input"
                  type="text"
                  value={contentForm.location}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, location: e.target.value })
                  }
                  placeholder="Bikaner, Rajasthan"
                  style={
                    contentForm.locationColor
                      ? { color: contentForm.locationColor }
                      : undefined
                  }
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </FieldRow>

              {/* Services Intro */}
              <FieldRow
                label="Services Section Intro"
                colorValue={contentForm.servicesIntroColor}
                onColorChange={(c) =>
                  setContentForm({ ...contentForm, servicesIntroColor: c })
                }
              >
                <textarea
                  id="content-services-intro"
                  data-ocid="content.services-intro.textarea"
                  value={contentForm.servicesIntro}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      servicesIntro: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="We offer a wide range of wall art and mural services..."
                  style={
                    contentForm.servicesIntroColor
                      ? { color: contentForm.servicesIntroColor }
                      : undefined
                  }
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
                />
              </FieldRow>

              {/* Why Choose Intro */}
              <FieldRow
                label="Why Choose Us — Intro"
                colorValue={contentForm.whyChooseIntroColor}
                onColorChange={(c) =>
                  setContentForm({ ...contentForm, whyChooseIntroColor: c })
                }
              >
                <textarea
                  id="content-why-choose"
                  data-ocid="content.why-choose.textarea"
                  value={contentForm.whyChooseIntro}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      whyChooseIntro: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="Here's why clients trust Mudit Sharma for their wall art needs."
                  style={
                    contentForm.whyChooseIntroColor
                      ? { color: contentForm.whyChooseIntroColor }
                      : undefined
                  }
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
                />
              </FieldRow>

              {/* Contact Heading */}
              <FieldRow
                label="Contact Section Heading"
                colorValue={contentForm.contactHeadingColor}
                onColorChange={(c) =>
                  setContentForm({ ...contentForm, contactHeadingColor: c })
                }
              >
                <input
                  id="content-contact-heading"
                  data-ocid="content.contact-heading.input"
                  type="text"
                  value={contentForm.contactHeading}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      contactHeading: e.target.value,
                    })
                  }
                  placeholder="Let's Transform Your Space"
                  style={
                    contentForm.contactHeadingColor
                      ? { color: contentForm.contactHeadingColor }
                      : undefined
                  }
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              </FieldRow>

              {/* Contact Subtext */}
              <FieldRow
                label="Contact Section Subtext"
                colorValue={contentForm.contactSubtextColor}
                onColorChange={(c) =>
                  setContentForm({ ...contentForm, contactSubtextColor: c })
                }
              >
                <textarea
                  id="content-contact-subtext"
                  data-ocid="content.contact-subtext.textarea"
                  value={contentForm.contactSubtext}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      contactSubtext: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="Available for residential and commercial projects..."
                  style={
                    contentForm.contactSubtextColor
                      ? { color: contentForm.contactSubtextColor }
                      : undefined
                  }
                  className="w-full border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
                />
              </FieldRow>

              {/* Stats */}
              <div className="pt-2">
                <p className="font-inter text-sm font-semibold text-charcoal mb-3 border-t border-cream-dark pt-4">
                  About Section Stats
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(
                    [
                      {
                        valueKey: "stat1Value",
                        labelKey: "stat1Label",
                        valueColorKey: "stat1ValueColor",
                        labelColorKey: "stat1LabelColor",
                        id: "stat1",
                      },
                      {
                        valueKey: "stat2Value",
                        labelKey: "stat2Label",
                        valueColorKey: "stat2ValueColor",
                        labelColorKey: "stat2LabelColor",
                        id: "stat2",
                      },
                      {
                        valueKey: "stat3Value",
                        labelKey: "stat3Label",
                        valueColorKey: "stat3ValueColor",
                        labelColorKey: "stat3LabelColor",
                        id: "stat3",
                      },
                      {
                        valueKey: "stat4Value",
                        labelKey: "stat4Label",
                        valueColorKey: "stat4ValueColor",
                        labelColorKey: "stat4LabelColor",
                        id: "stat4",
                      },
                    ] as const
                  ).map((stat, i) => (
                    <div
                      key={stat.id}
                      className="bg-cream/60 rounded-xl p-3 space-y-2 border border-cream-dark"
                    >
                      <p className="font-inter text-xs font-medium text-charcoal/60 uppercase tracking-wide">
                        Stat {i + 1}
                      </p>
                      {/* Stat value + colour */}
                      <div className="flex items-center gap-2">
                        <ColorSwatch
                          value={contentForm[stat.valueColorKey]}
                          onChange={(c) =>
                            setContentForm({
                              ...contentForm,
                              [stat.valueColorKey]: c,
                            })
                          }
                          title={`Stat ${i + 1} value colour`}
                        />
                        <input
                          type="text"
                          value={contentForm[stat.valueKey]}
                          onChange={(e) =>
                            setContentForm({
                              ...contentForm,
                              [stat.valueKey]: e.target.value,
                            })
                          }
                          placeholder="e.g. 5+"
                          style={
                            contentForm[stat.valueColorKey]
                              ? { color: contentForm[stat.valueColorKey] }
                              : undefined
                          }
                          className="flex-1 border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                        />
                      </div>
                      {/* Stat label + colour */}
                      <div className="flex items-center gap-2">
                        <ColorSwatch
                          value={contentForm[stat.labelColorKey]}
                          onChange={(c) =>
                            setContentForm({
                              ...contentForm,
                              [stat.labelColorKey]: c,
                            })
                          }
                          title={`Stat ${i + 1} label colour`}
                        />
                        <input
                          type="text"
                          value={contentForm[stat.labelKey]}
                          onChange={(e) =>
                            setContentForm({
                              ...contentForm,
                              [stat.labelKey]: e.target.value,
                            })
                          }
                          placeholder="e.g. Years of Experience"
                          style={
                            contentForm[stat.labelColorKey]
                              ? { color: contentForm[stat.labelColorKey] }
                              : undefined
                          }
                          className="flex-1 border border-cream-dark rounded-lg px-3 py-2 font-inter text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              data-ocid="content.save_button"
              onClick={() => {
                updateContent(contentForm);
                toast.success("Text content saved!");
              }}
              className="mt-6 flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-inter text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              <Check size={16} />
              Save Text Content
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
