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
export interface TextContent {
    bio: string;
    tagline: string;
    artistName: string;
}
export interface Artwork {
    id: bigint;
    title: string;
    description: string;
    image: ExternalBlob;
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
    addArtwork(title: string, description: string, image: ExternalBlob): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteArtwork(id: bigint): Promise<void>;
    getAllArtworks(): Promise<Array<Artwork>>;
    getArtistPortrait(): Promise<ExternalBlob | null>;
    getArtwork(id: bigint): Promise<Artwork | null>;
    getArtworksByDescription(description: string): Promise<Array<Artwork>>;
    getArtworksByTitle(title: string): Promise<Array<Artwork>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoverImage(): Promise<ExternalBlob | null>;
    getLogo(): Promise<ExternalBlob | null>;
    getTextContent(): Promise<TextContent>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateArtwork(id: bigint, title: string, description: string, image: ExternalBlob): Promise<void>;
    updateTextContent(artistName: string, tagline: string, bio: string): Promise<void>;
    uploadArtistPortrait(blob: ExternalBlob): Promise<void>;
    uploadCoverImage(blob: ExternalBlob): Promise<void>;
    uploadLogo(blob: ExternalBlob): Promise<void>;
}
