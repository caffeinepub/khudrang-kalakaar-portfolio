import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Artwork, MediaContacts } from '../backend';
import { ExternalBlob } from '../backend';

// ── Public queries ──

export function useGetAllArtworks() {
  const { actor, isFetching } = useActor();

  return useQuery<Artwork[]>({
    queryKey: ['artworks'],
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
    queryKey: ['logo'],
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
    queryKey: ['coverImage'],
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
    queryKey: ['artistPortrait'],
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
    queryKey: ['mediaContacts'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMediaContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for backwards compatibility
export const useMediaContacts = useGetMediaContacts;

// ── Text content stub ──
// Returns null so components gracefully fall back to defaults.
export function useTextContent() {
  return useQuery<{ artistName: string; tagline: string; bio: string } | null>({
    queryKey: ['textContent'],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useUpdateTextContent() {
  return useMutation({
    mutationFn: async (_params: { artistName?: string; tagline?: string; bio?: string }) => {
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
      if (!actor) throw new Error('Actor not available');

      let imageBlob: ExternalBlob | null = null;
      if (data.imageFile) {
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes);
      }

      return actor.uploadArtwork(
        data.title,
        data.description,
        imageBlob,
        data.location
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
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
      if (!actor) throw new Error('Actor not available');

      let imageBlob: ExternalBlob | null = null;
      if (data.imageFile) {
        // New image provided — convert and upload
        const bytes = new Uint8Array(await data.imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes);
      } else if (data.keepExistingImage && data.existingImage) {
        // Keep the existing image blob
        imageBlob = data.existingImage;
      }
      // else imageBlob stays null (clears the image)

      return actor.editArtwork(
        data.id,
        data.title,
        data.description,
        imageBlob,
        data.location
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });
}

export function useDeleteArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteArtwork(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });
}

// ── Admin: media uploads ──

export function useUploadLogo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadLogo(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logo'] });
    },
  });
}

export function useUploadCoverImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadCoverImage(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverImage'] });
    },
  });
}

export function useUploadArtistPortrait() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadArtistPortrait(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistPortrait'] });
    },
  });
}

// ── Admin: media contacts ──

export function useUpdateMediaContacts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { whatsappNumber: string; instagramProfile: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMediaContacts(data.whatsappNumber, data.instagramProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaContacts'] });
    },
  });
}
