import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import type { Artwork, TextContent, MediaContacts, UserProfile } from '../backend';

// ── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Admin Check ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Artworks ────────────────────────────────────────────────────────────────

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

export function useUploadArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      imageBytes: Uint8Array<ArrayBuffer>;
      format: string | null;
      fileName: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const id = await actor.uploadArtwork(
        params.title,
        params.description,
        params.imageBytes,
        params.format,
        params.fileName
      );
      return id;
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
    mutationFn: async (params: {
      id: bigint;
      title: string;
      description: string;
      imageBytes: Uint8Array<ArrayBuffer>;
      format: string | null;
      fileName: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.editArtwork(
        params.id,
        params.title,
        params.description,
        params.imageBytes,
        params.format,
        params.fileName
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
      await actor.deleteArtwork(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });
}

// ── Logo ────────────────────────────────────────────────────────────────────

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

export function useUploadLogo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      bytes: Uint8Array<ArrayBuffer>;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error('Actor not available');
      let blob = ExternalBlob.fromBytes(params.bytes);
      if (params.onProgress) {
        blob = blob.withUploadProgress(params.onProgress);
      }
      await actor.uploadLogo(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logo'] });
    },
  });
}

// ── Cover Image ─────────────────────────────────────────────────────────────

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

export function useUploadCoverImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      bytes: Uint8Array<ArrayBuffer>;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error('Actor not available');
      let blob = ExternalBlob.fromBytes(params.bytes);
      if (params.onProgress) {
        blob = blob.withUploadProgress(params.onProgress);
      }
      await actor.uploadCoverImage(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverImage'] });
    },
  });
}

// ── Artist Portrait ─────────────────────────────────────────────────────────

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

export function useUploadArtistPortrait() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      bytes: Uint8Array<ArrayBuffer>;
      onProgress?: (pct: number) => void;
    }) => {
      if (!actor) throw new Error('Actor not available');
      let blob = ExternalBlob.fromBytes(params.bytes);
      if (params.onProgress) {
        blob = blob.withUploadProgress(params.onProgress);
      }
      await actor.uploadArtistPortrait(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistPortrait'] });
    },
  });
}

// ── Text Content ────────────────────────────────────────────────────────────

export function useTextContent() {
  const { actor, isFetching } = useActor();

  return useQuery<TextContent>({
    queryKey: ['textContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTextContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateTextContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      artistName: string;
      tagline: string;
      bio: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateTextContent(params.artistName, params.tagline, params.bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textContent'] });
    },
  });
}

// ── Media Contacts ──────────────────────────────────────────────────────────

export function useMediaContacts() {
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

export function useUpdateMediaContacts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      whatsappNumber: string;
      instagramProfile: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateMediaContacts(params.whatsappNumber, params.instagramProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaContacts'] });
    },
  });
}
