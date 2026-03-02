import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


// Apply migration through's actor's with clause

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type Artwork = {
    id : Nat;
    title : Text;
    description : Text;
    image : Storage.ExternalBlob;
  };

  public type TextContent = {
    artistName : Text;
    tagline : Text;
    bio : Text;
  };

  var textContent : TextContent = {
    artistName = "Artist Name";
    tagline = "Art is life";
    bio = "This is a bio";
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let artworks = Map.empty<Nat, Artwork>();
  var nextArtworkId = 0;
  var logo : ?Storage.ExternalBlob = null;
  var coverImage : ?Storage.ExternalBlob = null;
  var artistPortrait : ?Storage.ExternalBlob = null;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

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

  public shared ({ caller }) func addArtwork(title : Text, description : Text, image : Storage.ExternalBlob) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = nextArtworkId;
    let artwork : Artwork = {
      id;
      title;
      description;
      image;
    };
    artworks.add(id, artwork);
    nextArtworkId += 1;
    id;
  };

  public shared ({ caller }) func updateArtwork(id : Nat, title : Text, description : Text, image : Storage.ExternalBlob) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (artworks.get(id)) {
      case (null) { Runtime.trap("Artwork not found") };
      case (?_) {
        let updatedArtwork : Artwork = {
          id;
          title;
          description;
          image;
        };
        artworks.add(id, updatedArtwork);
      };
    };
  };

  public shared ({ caller }) func deleteArtwork(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not artworks.containsKey(id)) {
      Runtime.trap("Artwork not found");
    };
    artworks.remove(id);
  };

  public query func getArtwork(id : Nat) : async ?Artwork {
    artworks.get(id);
  };

  public query func getAllArtworks() : async [Artwork] {
    artworks.values().toArray();
  };

  public query func getArtworksByTitle(title : Text) : async [Artwork] {
    artworks.values().filter(func(artwork) { artwork.title.contains(#text title) }).toArray();
  };

  public query func getArtworksByDescription(description : Text) : async [Artwork] {
    artworks.values().filter(func(artwork) { artwork.description.contains(#text description) }).toArray();
  };

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

  public query func getTextContent() : async TextContent {
    textContent;
  };
};
