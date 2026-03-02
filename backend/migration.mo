module {
  public type OldActor = {
    nextArtworkId : Nat;
  };

  public type NewActor = {
    nextArtworkId : Nat;
    textContent : {
      artistName : Text;
      tagline : Text;
      bio : Text;
    };
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      textContent = {
        artistName = "Artist Name";
        tagline = "Art is life";
        bio = "This is a bio";
      }
    };
  };
};
