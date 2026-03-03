import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let MAX_GALLERY_IMAGE_SIZE = 15_728_640;

  public type UserProfile = {
    name : Text;
  };

  public type GalleryImage = {
    id : Nat;
    blob : Storage.ExternalBlob;
    filename : Text;
    mimeType : Text;
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
    email : ?Text;
  };

  stable let artworks = Map.empty<Nat, Artwork>();
  stable let galleryImages = Map.empty<Nat, GalleryImage>();
  stable var nextArtworkId = 0;
  stable var nextGalleryImageId = 0;
  stable var logo : ?Storage.ExternalBlob = null;
  stable var coverImage : ?Storage.ExternalBlob = null;
  stable var artistPortrait : ?Storage.ExternalBlob = null;
  stable var mediaContacts : ?MediaContacts = null;
  stable var adminPrincipal : ?Principal = null;

  let emptyUserProfiles = Map.empty<Principal, UserProfile>();
  stable var userProfiles = emptyUserProfiles;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public query func getAdminPrincipal() : async ?Principal {
    adminPrincipal;
  };

  func isAdminCaller(caller : Principal) : Bool {
    adminPrincipal == ?caller;
  };

  public shared ({ caller }) func claimAdminWithCode(code : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    if (code == "131104") {
      adminPrincipal := ?caller;
      // Also assign admin role in the access control system
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
      #ok("Admin privileges granted");
    } else {
      #err("Invalid code");
    };
  };

  public type AddGalleryImageArgs = {
    blob : Storage.ExternalBlob;
    filename : Text;
    mimeType : Text;
  };

  public query func listGalleryImages() : async [GalleryImage] {
    galleryImages.values().toArray();
  };

  public query func findGalleryImage(id : Nat) : async ?GalleryImage {
    galleryImages.get(id);
  };

  public shared ({ caller }) func addGalleryImage(args : AddGalleryImageArgs) : async {
    #ok : Nat;
    #err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add a gallery image");
    };

    let newGalleryImage : GalleryImage = {
      id = nextGalleryImageId;
      blob = args.blob;
      filename = args.filename;
      mimeType = args.mimeType;
    };
    galleryImages.add(nextGalleryImageId, newGalleryImage);

    let currentId = nextGalleryImageId;
    nextGalleryImageId += 1;
    #ok(currentId);
  };

  public shared ({ caller }) func deleteGalleryImage(id : Nat) : async {
    #ok : ();
    #err : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete gallery image");
    };

    if (galleryImages.containsKey(id)) {
      galleryImages.remove(id);
      #ok(());
    } else {
      #err("Gallery image with id " # id.toText() # " not found");
    };
  };

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
          ". No artwork found, please create a new one instead."
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
    email : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    mediaContacts := ?{
      whatsappNumber;
      instagramProfile;
      email;
    };
  };

  public query func getMediaContacts() : async ?MediaContacts {
    mediaContacts;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
