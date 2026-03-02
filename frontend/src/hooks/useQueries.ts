import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TextContent, Artwork, MediaContacts } from '../backend';
import { ExternalBlob } from '../backend';

// ── Text Content ─────────────────────────────────────────────────────────────

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
    mutationFn: async ({ artistName, tagline, bio }: { artistName: string; tagline: string; bio: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTextContent(artistName, tagline, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textContent'] });
    },
  });
}

// ── Artworks ─────────────────────────────────────────────────────────────────

export function useAllArtworks() {
  const { actor, isFetching } = useActor();
  return useQuery<Artwork[]>({
    queryKey: ['artworks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllArtworks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      imageBytes,
      format,
      fileName,
    }: {
      title: string;
      description: string;
      imageBytes: Uint8Array;
      format: string | null;
      fileName: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadArtwork(title, description, imageBytes, format, fileName);
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
    mutationFn: async ({
      id,
      title,
      description,
      imageBytes,
      format,
      fileName,
    }: {
      id: bigint;
      title: string;
      description: string;
      imageBytes: Uint8Array;
      format: string | null;
      fileName: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editArtwork(id, title, description, imageBytes, format, fileName);
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

// ── Logo ─────────────────────────────────────────────────────────────────────

export function useLogo() {
  const { actor, isFetching } = useActor();
  return useQuery<ExternalBlob | null>({
    queryKey: ['logo'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getLogo();
    },
    enabled: !!actor && !isFetching,
  });
}

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

// ── Cover Image ───────────────────────────────────────────────────────────────

export function useCoverImage() {
  const { actor, isFetching } = useActor();
  return useQuery<ExternalBlob | null>({
    queryKey: ['coverImage'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCoverImage();
    },
    enabled: !!actor && !isFetching,
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

// ── Artist Portrait ───────────────────────────────────────────────────────────

export function useArtistPortrait() {
  const { actor, isFetching } = useActor();
  return useQuery<ExternalBlob | null>({
    queryKey: ['artistPortrait'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getArtistPortrait();
    },
    enabled: !!actor && !isFetching,
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

// ── Admin Check ───────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery({
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
    mutationFn: async (profile: { name: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Media Contacts ────────────────────────────────────────────────────────────

export function useMediaContacts() {
  const { actor, isFetching } = useActor();
  return useQuery<MediaContacts | null>({
    queryKey: ['mediaContacts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMediaContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateMediaContacts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      whatsappNumber,
      instagramProfile,
    }: {
      whatsappNumber: string;
      instagramProfile: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMediaContacts(whatsappNumber, instagramProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaContacts'] });
    },
  });
}
