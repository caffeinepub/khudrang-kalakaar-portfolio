import Map "mo:core/Map";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
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

  type OldActor = {
    ADMIN_USERNAME : Text;
    ADMIN_PASSWORD_HASH : Text;
    artworks : Map.Map<Nat, Artwork>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    nextArtworkId : Nat;
    logo : ?Storage.ExternalBlob;
    coverImage : ?Storage.ExternalBlob;
    artistPortrait : ?Storage.ExternalBlob;
    mediaContacts : ?MediaContacts;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    adminUsernames : Map.Map<Principal, Text>;
    adminPasswordHash : Text;
    ADMIN_USERNAME : Text;
    artworks : Map.Map<Nat, Artwork>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    nextArtworkId : Nat;
    logo : ?Storage.ExternalBlob;
    coverImage : ?Storage.ExternalBlob;
    artistPortrait : ?Storage.ExternalBlob;
    mediaContacts : ?MediaContacts;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    let adminUsernames = Map.empty<Principal, Text>();
    {
      old with
      adminPasswordHash = old.ADMIN_PASSWORD_HASH;
      adminUsernames
    };
  };
};
