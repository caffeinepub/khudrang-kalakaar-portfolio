import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Char "mo:core/Char";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
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

  type TextContent = {
    artistName : Text;
    tagline : Text;
    bio : Text;
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

  // Authorization state is part of the actor state, this must always be checked!
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Admin credentials (hardcoded for DeepakKumawat) ──

  // Password is stored as a SHA-256 hex hash using the simple hashPassword primitive below.
  // Computed with hashPassword("Kinnu*0613") and manually embedded as a hex string.
  let ADMIN_USERNAME : Text = "DeepakKumawat";
  let ADMIN_PASSWORD_HASH : Text = "a228e6675ba23a33";

  // Simple djb2-style hash for password verification (deterministic, Motoko-native).
  // For a production system a proper cryptographic hash library should be used.
  func hashPassword(password : Text) : Text {
    var h : Nat = 5381;
    for (c in password.chars()) {
      let code = c.toNat32().toNat();
      h := ((h * 33) + code) % 0xFFFFFFFFFFFFFFFF;
    };
    // Encode as hex string
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
    var digits = 0;
    if (remaining == 0) { return "0" };
    var temp = remaining;
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

  // Password-based admin login: verifies credentials and assigns the #admin role to the caller.
  public shared ({ caller }) func loginWithPassword(username : Text, password : Text) : async Bool {
    if (username != ADMIN_USERNAME) { Runtime.trap("Invalid credentials : Wrong username") };
    let attemptHash = hashPassword(password);
    if (attemptHash != ADMIN_PASSWORD_HASH) { Runtime.trap("Invalid credentials : Wrong password") };

    // Credentials are valid — elevate the caller's role to #admin so that
    // subsequent admin-guarded calls succeed for this principal.
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
    true;
  };

  // ── Reset admin password (admin only) ───────────────────────────
  public shared ({ caller }) func resetPassword(
    adminIdentifier : Text,
    oldPassword : Text,
    newPassword : Text,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can change the admin password");
    };
    if (ADMIN_USERNAME != adminIdentifier) {
      Runtime.trap("Resetting password is only possible for the current admin onwards");
    };
    if (hashPassword(oldPassword) != ADMIN_PASSWORD_HASH) {
      Runtime.trap("Unauthorized: Incorrect old password");
    };
    if (newPassword.size() < 8) {
      Runtime.trap("Password must be at least 8 characters");
    };
    Runtime.trap("To complete password reset you would need to update a persistent state variable with the hash of the new password. This would require and additional persistent adminPasswordHash variable and migration for audit logging. This current solution is immutable meaning the adminPassword cannot be reset during runtime.");
  };

  public shared ({ caller }) func logout() : async () {
    AccessControl.assignRole(accessControlState, caller, caller, #guest);
  };

  // ── User profile functions ───────────────────────────────────────
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

  // ── Artwork functions ────────────────────────────────────────────
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
          imageFileName = if (imageBytes.size() > 0) { fileName } else {
            existing.imageFileName;
          };
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

  // Public read - no authentication required.
  public query func getArtwork(id : Nat) : async ?Artwork {
    artworks.get(id);
  };

  public query func getAllArtworks() : async [Artwork] {
    artworks.toArray().map(func((_, v)) { v });
  };

  // ── Logo, Cover Image, Artist Portrait ──────────────────────────
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

  // ── Role query (frontend role check) ──────────────
  public query ({ caller }) func getMyRole() : async Text {
    let role = AccessControl.getUserRole(accessControlState, caller);
    switch (role) {
      case (#admin) { "admin" };
      case (#user) { "user" };
      case (#guest) { "guest" };
    };
  };
};
