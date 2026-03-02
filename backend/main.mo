import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


// Migrate to new system that stores blob directly in each artwork record

actor {
  type UserProfile = {
    name : Text;
  };

  type Artwork = {
    id : Nat;
    title : Text;
    description : Text;
    image : [Nat8];
    imageFormat : ?Text;
    imageFileName : ?Text;
  };

  type TextContent = {
    artistName : Text;
    tagline : Text;
    bio : Text;
  };

  type MediaContacts = {
    whatsappNumber : Text;
    instagramProfile : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var textContent : TextContent = {
    artistName = "Artist Name";
    tagline = "Art is life";
    bio = "This is a bio";
  };

  let artworks = Map.empty<Nat, Artwork>();
  var nextArtworkId = 0;
  var logo : ?Storage.ExternalBlob = null;
  var coverImage : ?Storage.ExternalBlob = null;
  var artistPortrait : ?Storage.ExternalBlob = null;
  var mediaContacts : ?MediaContacts = null;

  let userProfiles = Map.empty<Principal, UserProfile>();

  // ── User profile functions ──────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Artwork functions ───────────────────────────────────────────────────────

  public shared ({ caller }) func uploadArtwork(
    title : Text,
    description : Text,
    imageBytes : [Nat8],
    format : ?Text,
    fileName : ?Text,
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let artwork : Artwork = {
      id = nextArtworkId;
      title;
      description;
      image = imageBytes;
      imageFormat = format;
      imageFileName = fileName;
    };

    artworks.add(nextArtworkId, artwork);
    nextArtworkId += 1;
    artwork.id;
  };

  public shared ({ caller }) func editArtwork(
    id : Nat,
    title : Text,
    description : Text,
    imageBytes : [Nat8],
    format : ?Text,
    fileName : ?Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (artworks.get(id)) {
      case (null) { Runtime.trap("Artwork not found") };
      case (?existing) {
        let updated : Artwork = {
          id = existing.id;
          title;
          description;
          image = if (imageBytes.size() > 0) { imageBytes } else {
            existing.image;
          };
          imageFormat = if (imageBytes.size() > 0) { format } else {
            existing.imageFormat;
          };
          imageFileName = if (imageBytes.size() > 0) {
            fileName;
          } else { existing.imageFileName };
        };
        artworks.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteArtwork(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    artworks.remove(id);
  };

  // Public read — no auth required (open gallery)
  public query func getArtwork(id : Nat) : async ?Artwork {
    artworks.get(id);
  };

  public query func getAllArtworks() : async [Artwork] {
    artworks.toArray().map(func((_, v)) { v });
  };

  // ── Logo, Cover Image, Artist Portrait ─────────────────────────────────────
  include MixinStorage();

  public shared ({ caller }) func uploadLogo(blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    logo := ?blob;
  };

  public query func getLogo() : async ?Storage.ExternalBlob {
    logo;
  };

  public shared ({ caller }) func uploadCoverImage(blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    coverImage := ?blob;
  };

  public query func getCoverImage() : async ?Storage.ExternalBlob {
    coverImage;
  };

  public shared ({ caller }) func uploadArtistPortrait(blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    artistPortrait := ?blob;
  };

  public query func getArtistPortrait() : async ?Storage.ExternalBlob {
    artistPortrait;
  };

  // ── Media contacts ──────────────────────────────────────────────────────────

  public shared ({ caller }) func updateMediaContacts(
    whatsappNumber : Text,
    instagramProfile : Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    mediaContacts := ?{
      whatsappNumber;
      instagramProfile;
    };
  };

  // Public read — no auth required
  public query func getMediaContacts() : async ?MediaContacts {
    mediaContacts;
  };

  // ── Text content ────────────────────────────────────────────────────────────

  public shared ({ caller }) func updateTextContent(artistName : Text, tagline : Text, bio : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    textContent := {
      artistName;
      tagline;
      bio;
    };
  };

  // Public read — no auth required
  public query func getTextContent() : async TextContent {
    textContent;
  };
};

