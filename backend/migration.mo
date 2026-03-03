import Map "mo:core/Map";
import Storage "blob-storage/Storage";

module {
  type OldArtwork = {
    id : Nat;
    title : Text;
    description : Text;
    image : [Nat8];
    imageFormat : ?Text;
    imageFileName : ?Text;
    location : ?Text;
  };

  type OldActor = {
    artworks : Map.Map<Nat, OldArtwork>;
    nextArtworkId : Nat;
    logo : ?Storage.ExternalBlob;
    coverImage : ?Storage.ExternalBlob;
    artistPortrait : ?Storage.ExternalBlob;
    mediaContacts : ?{
      whatsappNumber : Text;
      instagramProfile : Text;
    };
    adminUsernames : Map.Map<Principal, Text>;
    isInitialized : Bool;
  };

  type NewArtwork = {
    id : Nat;
    title : Text;
    description : Text;
    image : ?Storage.ExternalBlob;
    location : ?Text;
  };

  type NewActor = {
    artworks : Map.Map<Nat, NewArtwork>;
    nextArtworkId : Nat;
    logo : ?Storage.ExternalBlob;
    coverImage : ?Storage.ExternalBlob;
    artistPortrait : ?Storage.ExternalBlob;
    mediaContacts : ?{
      whatsappNumber : Text;
      instagramProfile : Text;
    };
  };

  public func run(old : OldActor) : NewActor {
    let newArtworks = old.artworks.map<Nat, OldArtwork, NewArtwork>(
      func(_id, oldArtwork) {
        {
          id = oldArtwork.id;
          title = oldArtwork.title;
          description = oldArtwork.description;
          image = null; // No migration from [Nat8] to blob
          location = oldArtwork.location;
        };
      }
    );
    {
      artworks = newArtworks;
      nextArtworkId = old.nextArtworkId;
      logo = old.logo;
      coverImage = old.coverImage;
      artistPortrait = old.artistPortrait;
      mediaContacts = old.mediaContacts;
    };
  };
};
