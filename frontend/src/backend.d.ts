import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Artwork {
    id: bigint;
    title: string;
    description: string;
    image?: ExternalBlob;
    location?: string;
}
export interface MediaContacts {
    instagramProfile: string;
    whatsappNumber: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteArtwork(id: bigint): Promise<void>;
    editArtwork(id: bigint, title: string, description: string, imageUpload: ExternalBlob | null, location: string | null): Promise<void>;
    getAllArtworks(): Promise<Array<Artwork>>;
    getArtistPortrait(): Promise<ExternalBlob | null>;
    getArtwork(id: bigint): Promise<Artwork | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoverImage(): Promise<ExternalBlob | null>;
    getLogo(): Promise<ExternalBlob | null>;
    getMediaContacts(): Promise<MediaContacts | null>;
    getMyRole(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateMediaContacts(whatsappNumber: string, instagramProfile: string): Promise<void>;
    uploadArtistPortrait(blob: ExternalBlob): Promise<void>;
    uploadArtwork(title: string, description: string, imageUpload: ExternalBlob | null, location: string | null): Promise<bigint>;
    uploadCoverImage(blob: ExternalBlob): Promise<void>;
    uploadLogo(blob: ExternalBlob): Promise<void>;
}
