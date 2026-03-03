import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import { getAdminCredentials } from '../lib/adminAuth';

// Helper: authenticate as admin before any admin operation
async function ensureAdminAuth(actor: NonNullable<ReturnType<typeof useActor>['actor']>): Promise<void> {
  const { username, password } = getAdminCredentials();
  await actor.loginWithPassword(username, password);
}

// ── Public queries ──

export function useGetAllArtworks() {
  const { actor, isFetching } = useActor();

  return useQuery({
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

  return useQuery({
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

  return useQuery({
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

  return useQuery({
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

  return useQuery({
    queryKey: ['mediaContacts'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMediaContacts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for backwards compatibility with components that import useMediaContacts
export const useMediaContacts = useGetMediaContacts;

// ── Text content stub (backend no longer exposes text content) ──
// Returns null data so components gracefully fall back to defaults.

export function useTextContent() {
  return useQuery<{ artistName: string; tagline: string; bio: string } | null>({
    queryKey: ['textContent'],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useUpdateTextContent() {
  return useMutation({
    mutationFn: async (_params: { artistName: string; tagline: string; bio: string }) => {
      // no-op: backend no longer supports text content updates
    },
  });
}

// ── Admin: login ──

export function useLoginWithPassword() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.loginWithPassword(username, password);
    },
  });
}

// ── Admin: artwork mutations ──

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
      imageBytes: Uint8Array<ArrayBuffer>;
      format: string | null;
      fileName: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await ensureAdminAuth(actor);
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
      imageBytes: Uint8Array<ArrayBuffer>;
      format: string | null;
      fileName: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await ensureAdminAuth(actor);
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
      await ensureAdminAuth(actor);
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
      await ensureAdminAuth(actor);
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
      await ensureAdminAuth(actor);
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
      await ensureAdminAuth(actor);
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
    mutationFn: async ({
      whatsappNumber,
      instagramProfile,
    }: {
      whatsappNumber: string;
      instagramProfile: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await ensureAdminAuth(actor);
      return actor.updateMediaContacts(whatsappNumber, instagramProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaContacts'] });
    },
  });
}
