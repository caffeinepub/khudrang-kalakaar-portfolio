import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type UserProfile = {
    name : Text;
  };

  public type Artwork = {
    id : Nat;
    title : Text;
    description : Text;
    image : ?Storage.ExternalBlob;
    location : ?Text;
  };

  public type MediaContacts = {
    whatsappNumber : Text;
    instagramProfile : Text;
  };

  let artworks = Map.empty<Nat, Artwork>();
  var nextArtworkId = 0;
  var logo : ?Storage.ExternalBlob = null;
  var coverImage : ?Storage.ExternalBlob = null;
  var artistPortrait : ?Storage.ExternalBlob = null;
  var mediaContacts : ?MediaContacts = null;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  // ── Authorization Mixin ──
  include MixinAuthorization(accessControlState);

  // ── Storage Mixin (for general storage functions) ──
  include MixinStorage();

  // ── User Profile Functions ──
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // ── Artwork Functions ──
  public shared ({ caller }) func uploadArtwork(
    title : Text,
    description : Text,
    imageUpload : ?Storage.ExternalBlob,
    location : ?Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let artwork : Artwork = {
      id = nextArtworkId;
      title;
      description;
      image = imageUpload;
      location;
    };
    artworks.add(nextArtworkId, artwork);
    nextArtworkId += 1;
    artwork.id;
  };

  public shared ({ caller }) func editArtwork(
    id : Nat,
    title : Text,
    description : Text,
    imageUpload : ?Storage.ExternalBlob,
    location : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (artworks.get(id)) {
      case (null) {
        Runtime.trap(
          "Artwork not found with id " # (id).toText() #
          ". There is no artwork for the id provided, please make sure to use the correct id or create a new artwork instead."
        );
      };
      case (?existing) {
        let updated : Artwork = {
          id = existing.id;
          title;
          description;
          image = imageUpload;
          location;
        };
        artworks.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteArtwork(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    artworks.remove(id);
  };

  public query func getArtwork(id : Nat) : async ?Artwork {
    artworks.get(id);
  };

  public query func getAllArtworks() : async [Artwork] {
    artworks.values().toArray();
  };

  // ── Logo, Cover Image, Artist Portrait Upload Functions ──
  public shared ({ caller }) func uploadLogo(blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    logo := ?blob;
  };

  public query func getLogo() : async ?Storage.ExternalBlob {
    logo;
  };

  public shared ({ caller }) func uploadCoverImage(blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    coverImage := ?blob;
  };

  public query func getCoverImage() : async ?Storage.ExternalBlob {
    coverImage;
  };

  public shared ({ caller }) func uploadArtistPortrait(blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    artistPortrait := ?blob;
  };

  public query func getArtistPortrait() : async ?Storage.ExternalBlob {
    artistPortrait;
  };

  public shared ({ caller }) func updateMediaContacts(
    whatsappNumber : Text,
    instagramProfile : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    mediaContacts := ?{
      whatsappNumber;
      instagramProfile;
    };
  };

  public query func getMediaContacts() : async ?MediaContacts {
    mediaContacts;
  };

  // ── Role Query (Frontend Role Check) ──
  public query ({ caller }) func getMyRole() : async Text {
    let role = AccessControl.getUserRole(accessControlState, caller);
    switch (role) {
      case (#admin) { "admin" };
      case (#user) { "user" };
      case (#guest) { "guest" };
    };
  };
};

