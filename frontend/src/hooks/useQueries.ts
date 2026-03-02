import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob, type Artwork, type TextContent } from '../backend';

// ─── Logo ────────────────────────────────────────────────────────────────────

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
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.uploadLogo(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logo'] });
    },
  });
}

// ─── Cover Image ─────────────────────────────────────────────────────────────

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
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.uploadCoverImage(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coverImage'] });
    },
  });
}

// ─── Artist Portrait ──────────────────────────────────────────────────────────

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
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      await actor.uploadArtistPortrait(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistPortrait'] });
    },
  });
}

// ─── Text Content ─────────────────────────────────────────────────────────────

export function useGetTextContent() {
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
      await actor.updateTextContent(artistName, tagline, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['textContent'] });
    },
  });
}

// ─── Artworks ─────────────────────────────────────────────────────────────────

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

export function useAddArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      image,
    }: {
      title: string;
      description: string;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addArtwork(title, description, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });
}

export function useUpdateArtwork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      image,
    }: {
      id: bigint;
      title: string;
      description: string;
      image: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateArtwork(id, title, description, image);
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

// ─── Admin check ──────────────────────────────────────────────────────────────

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

// ─── User Profile ─────────────────────────────────────────────────────────────

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
