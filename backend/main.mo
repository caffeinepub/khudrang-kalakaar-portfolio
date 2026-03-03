import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor self {
  public type UserProfile = {
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

  type MediaContacts = {
    whatsappNumber : Text;
    instagramProfile : Text;
  };

  let artworks = Map.empty<Nat, Artwork>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextArtworkId = 0;
  var logo : ?Storage.ExternalBlob = null;
  var coverImage : ?Storage.ExternalBlob = null;
  var artistPortrait : ?Storage.ExternalBlob = null;
  var mediaContacts : ?MediaContacts = null;

  let adminUsernames = Map.empty<Principal, Text>();
  var isInitialized = false;

  var adminPasswordHash = "a228e6675ba23a33";
  let ADMIN_USERNAME = "DeepakKumawat";

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func hashPassword(password : Text) : Text {
    var h : Nat = 5381;
    for (c in password.chars()) {
      let code = c.toNat32().toNat();
      h := ((h * 33) + code) % 0xFFFFFFFFFFFFFFFF;
    };
    let hexChars = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
    ];
    var result = "";
    var remaining = h;
    if (remaining == 0) { return "0" };
    var temp = remaining;
    var digits = 0;
    while (temp > 0) {
      digits += 1;
      temp /= 16;
    };
    var i = 0;
    while (i < digits) {
      let digit = remaining % 16;
      result := hexChars[digit] # result;
      remaining /= 16;
      i += 1;
    };
    result;
  };

  // Initialize admin (password setup required).
  // Called only once, to bootstrap the very first admin after the actor is deployed.
  public shared ({ caller }) func initializeWithPassword(password : Text) : async () {
    if (not isInitialized) {
      let passwordHash = hashPassword(password);
      adminPasswordHash := passwordHash;
      adminUsernames.add(caller, ADMIN_USERNAME);
      isInitialized := true;
      // Use the actor's own privileged principal to assign admin role to the caller
      AccessControl.assignRole(accessControlState, Principal.fromActor(self), caller, #admin);
    } else {
      Runtime.trap("Initialization has already happened. Please use newly created password next time during login");
    };
  };

  // Login with username+password credentials to obtain admin role.
  // No Internet Identity or principal-based check required beyond valid credentials.
  public shared ({ caller }) func loginWithPassword(username : Text, password : Text) : async Bool {
    let isKnownAdmin = (username == ADMIN_USERNAME and adminPasswordHash == hashPassword(password));
    if (not isKnownAdmin) {
      Runtime.trap("Invalid admin credentials. You are not authorized to perform these actions!");
    };
    // Use the actor's own privileged principal to assign admin role to the caller
    AccessControl.assignRole(accessControlState, Principal.fromActor(self), caller, #admin);
    true;
  };

  // Reset admin password (admin-only)
  public shared ({ caller }) func resetPassword(
    adminIdentifier : Text,
    oldPassword : Text,
    newPassword : Text,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can change admin password");
    };
    if (ADMIN_USERNAME != adminIdentifier) {
      Runtime.trap("Unauthorized: Resetting password is only possible for the current admin");
    };
    if (not isAdminPasswordValid(oldPassword)) {
      Runtime.trap("Unauthorized: Incorrect old password");
    };
    if (newPassword.size() < 8) {
      Runtime.trap("Password must be at least 8 characters");
    };
    adminPasswordHash := hashPassword(newPassword);
  };

  func isAdminPasswordValid(password : Text) : Bool {
    hashPassword(password) == adminPasswordHash;
  };

  // Logout: demote caller back to guest
  public shared ({ caller }) func logout() : async () {
    // Use the actor's own privileged principal to assign guest role to the caller
    AccessControl.assignRole(accessControlState, Principal.fromActor(self), caller, #guest);
  };

  // ── User profile functions ──
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

  // ── Artwork functions ──
  public shared ({ caller }) func uploadArtwork(
    title : Text,
    description : Text,
    imageBytes : [Nat8],
    format : ?Text,
    fileName : ?Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
          image = if (imageBytes.size() > 0) { imageBytes } else { existing.image };
          imageFormat = if (imageBytes.size() > 0) { format } else { existing.imageFormat };
          imageFileName = if (imageBytes.size() > 0) { fileName } else { existing.imageFileName };
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

  // ── Logo, Cover Image, Artist Portrait ──
  include MixinStorage();

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

  // ── Role query (frontend role check) ──
  public query ({ caller }) func getMyRole() : async Text {
    let role = AccessControl.getUserRole(accessControlState, caller);
    switch (role) {
      case (#admin) { "admin" };
      case (#user) { "user" };
      case (#guest) { "guest" };
    };
  };
};
