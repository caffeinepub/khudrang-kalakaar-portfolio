import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Artwork, GalleryImage, MediaContacts } from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

// ── Public queries ──

export function useGetAllArtworks() {
  const { actor, isFetching } = useActor();

  return useQuery<Artwork[]>({
    queryKey: ["artworks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtworks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLogo() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ["logo"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLogo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCoverImage() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ["coverImage"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCoverImage();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArtistPortrait() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ["artistPortrait"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getArtistPortrait();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMediaContacts() {
  const { actor, isFetching } = useActor();

  return useQuery<MediaContacts | null>({
    queryKey: ["mediaContacts"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMediaContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for backwards compatibility
export const useMediaContacts = useGetMediaContacts;

// ── Admin principal query ──

export function useGetAdminPrincipal() {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ["adminPrincipal"],
    queryFn: async () => {
      if (!actor) return null;
      const principal = await actor.getAdminPrincipal();
      return principal ? principal.toString() : null;
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Claim admin with 6-digit code mutation ──
export function useClaimAdminWithCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.claimAdminWithCode(code);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPrincipal"] });
    },
  });
}

// Keep old useClaimAdmin as a no-op stub for any remaining references
export function useClaimAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const existing = await actor.getMediaContacts();
      await actor.updateMediaContacts(
        existing?.whatsappNumber ?? "",
        existing?.instagramProfile ?? "",
        existing?.email ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPrincipal"] });
      queryClient.invalidateQueries({ queryKey: ["mediaContacts"] });
    },
  });
}

// ── Text content stub ──
export function useTextContent() {
  return useQuery<{ artistName: string; tagline: string; bio: string } | null>({
    queryKey: ["textContent"],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useUpdateTextContent() {
  return useMutation({
    mutationFn: async (_params: {
      artistName?: string;
      tagline?: string;
      bio?: string;
    }) => {
      // no-op stub
    },
  });
}

// ── Admin: artwork mutations ──

export function useUploadArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      imageFile: File | null;
      location: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");

      let imageBlob: ExternalBlob | null = null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes);
      }

      return actor.uploadArtwork(
        data.title,
        data.description,
        imageBlob,
        data.location,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      queryClient.invalidateQueries({ queryKey: ["adminPrincipal"] });
    },
  });
}

export function useEditArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      imageFile: File | null;
      keepExistingImage: boolean;
      existingImage?: ExternalBlob;
      location: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");

      let imageBlob: ExternalBlob | null = null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes);
      } else if (data.keepExistingImage && data.existingImage) {
        imageBlob = data.existingImage;
      }

      return actor.editArtwork(
        data.id,
        data.title,
        data.description,
        imageBlob,
        data.location,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
  });
}

export function useDeleteArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteArtwork(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
  });
}

// ── Admin: media uploads ──

export function useUploadLogo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error("Actor not available");
      return actor.uploadLogo(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logo"] });
      queryClient.invalidateQueries({ queryKey: ["adminPrincipal"] });
    },
  });
}

export function useUploadCoverImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error("Actor not available");
      return actor.uploadCoverImage(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coverImage"] });
      queryClient.invalidateQueries({ queryKey: ["adminPrincipal"] });
    },
  });
}

export function useUploadArtistPortrait() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error("Actor not available");
      return actor.uploadArtistPortrait(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artistPortrait"] });
      queryClient.invalidateQueries({ queryKey: ["adminPrincipal"] });
    },
  });
}

// ── Admin: media contacts ──

export function useUpdateMediaContacts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      whatsappNumber: string;
      instagramProfile: string;
      email?: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateMediaContacts(
        data.whatsappNumber,
        data.instagramProfile,
        data.email ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mediaContacts"] });
      queryClient.invalidateQueries({ queryKey: ["adminPrincipal"] });
    },
  });
}

// ── Gallery queries & mutations ──

export function useGetGalleryImages() {
  const { actor, isFetching } = useActor();

  return useQuery<GalleryImage[]>({
    queryKey: ["galleryImages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGalleryImages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddGalleryImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      file: File;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const bytes = new Uint8Array(await data.file.arrayBuffer());
      let blob = ExternalBlob.fromBytes(bytes);
      if (data.onProgress) {
        blob = blob.withUploadProgress(data.onProgress);
      }
      const result = await actor.addGalleryImage({
        blob,
        filename: data.file.name,
        mimeType: data.file.type || "image/jpeg",
      });
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
    },
  });
}

export function useDeleteGalleryImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.deleteGalleryImage(id);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
    },
  });
}
