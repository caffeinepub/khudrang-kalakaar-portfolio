import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetAllArtworks,
  useGetLogo,
  useGetCoverImage,
  useGetArtistPortrait,
  useGetTextContent,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { ExternalBlob } from '../backend';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: artworks = [], refetch: refetchArtworks } = useGetAllArtworks();
  const { data: logo } = useGetLogo();
  const { data: coverImage } = useGetCoverImage();
  const { data: artistPortrait } = useGetArtistPortrait();
  const { data: textContent } = useGetTextContent();

  const [activeTab, setActiveTab] = useState<'gallery' | 'images' | 'text'>('gallery');

  // Artwork form
  const [artworkTitle, setArtworkTitle] = useState('');
  const [artworkDesc, setArtworkDesc] = useState('');
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkLoading, setArtworkLoading] = useState(false);
  const [artworkError, setArtworkError] = useState('');
  const [artworkSuccess, setArtworkSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Edit artwork
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Image uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState<string | null>(null);
  const [imageSuccess, setImageSuccess] = useState('');

  // Text content
  const [artistName, setArtistName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [textLoading, setTextLoading] = useState(false);
  const [textSuccess, setTextSuccess] = useState('');

  const isAuthenticated = !!identity;
  const isLoading = actorFetching || adminLoading;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !actorFetching) {
      navigate({ to: '/admin-login' });
    }
  }, [isAuthenticated, actorFetching]);

  // Redirect if not admin (only after loading is complete)
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin === false) {
      // Not admin - redirect back to login
      navigate({ to: '/admin-login' });
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  // Populate text content form
  useEffect(() => {
    if (textContent) {
      setArtistName(textContent.artistName);
      setTagline(textContent.tagline);
      setBio(textContent.bio);
    }
  }, [textContent]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !artworkFile) return;
    setArtworkLoading(true);
    setArtworkError('');
    setArtworkSuccess('');
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await artworkFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) => setUploadProgress(p));
      await actor.addArtwork(artworkTitle, artworkDesc, blob);
      setArtworkTitle('');
      setArtworkDesc('');
      setArtworkFile(null);
      setArtworkSuccess('Artwork added successfully!');
      refetchArtworks();
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    } catch (err: any) {
      setArtworkError(err?.message || 'Failed to add artwork');
    } finally {
      setArtworkLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteArtwork = async (id: bigint) => {
    if (!actor) return;
    if (!confirm('Delete this artwork?')) return;
    try {
      await actor.deleteArtwork(id);
      refetchArtworks();
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    } catch (err: any) {
      alert(err?.message || 'Failed to delete artwork');
    }
  };

  const handleEditArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || editingId === null) return;
    setEditLoading(true);
    try {
      let blob: ExternalBlob;
      if (editFile) {
        const bytes = new Uint8Array(await editFile.arrayBuffer());
        blob = ExternalBlob.fromBytes(bytes);
      } else {
        const artwork = artworks.find((a) => a.id === editingId);
        if (!artwork) return;
        blob = artwork.image;
      }
      await actor.updateArtwork(editingId, editTitle, editDesc, blob);
      setEditingId(null);
      refetchArtworks();
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    } catch (err: any) {
      alert(err?.message || 'Failed to update artwork');
    } finally {
      setEditLoading(false);
    }
  };

  const handleImageUpload = async (type: 'logo' | 'cover' | 'portrait', file: File) => {
    if (!actor) return;
    setImageLoading(type);
    setImageSuccess('');
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      if (type === 'logo') {
        await actor.uploadLogo(blob);
        queryClient.invalidateQueries({ queryKey: ['logo'] });
      } else if (type === 'cover') {
        await actor.uploadCoverImage(blob);
        queryClient.invalidateQueries({ queryKey: ['coverImage'] });
      } else {
        await actor.uploadArtistPortrait(blob);
        queryClient.invalidateQueries({ queryKey: ['artistPortrait'] });
      }
      setImageSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
    } catch (err: any) {
      alert(err?.message || `Failed to upload ${type}`);
    } finally {
      setImageLoading(null);
    }
  };

  const handleUpdateText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setTextLoading(true);
    setTextSuccess('');
    try {
      await actor.updateTextContent(artistName, tagline, bio);
      queryClient.invalidateQueries({ queryKey: ['textContent'] });
      setTextSuccess('Text content updated successfully!');
    } catch (err: any) {
      alert(err?.message || 'Failed to update text content');
    } finally {
      setTextLoading(false);
    }
  };

  // Show loading while checking auth/admin status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show access denied only when fully loaded and confirmed not admin
  if (!isLoading && isAuthenticated && isAdmin === false) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-red-500 mb-6">Your account does not have admin privileges.</p>
          <button
            onClick={handleLogout}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors mb-3"
          >
            Logout
          </button>
          <button
            onClick={() => navigate({ to: '/' })}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
          >
            ← Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-500">Khudrang Kalakaar Portfolio</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {identity?.getPrincipal().toString().slice(0, 12)}...
            </span>
            <button
              onClick={handleLogout}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(['gallery', 'images', 'text'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'gallery' ? 'Gallery' : tab === 'images' ? 'Site Images' : 'Text Content'}
            </button>
          ))}
        </div>

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 pb-12">
            {/* Add Artwork Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Artwork</h2>
              <form onSubmit={handleAddArtwork} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={artworkTitle}
                  onChange={(e) => setArtworkTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <textarea
                  placeholder="Description"
                  value={artworkDesc}
                  onChange={(e) => setArtworkDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setArtworkFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                />
                {artworkLoading && uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                {artworkError && <p className="text-red-500 text-sm">{artworkError}</p>}
                {artworkSuccess && <p className="text-green-600 text-sm">{artworkSuccess}</p>}
                <button
                  type="submit"
                  disabled={artworkLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {artworkLoading && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {artworkLoading ? 'Uploading...' : 'Add Artwork'}
                </button>
              </form>
            </div>

            {/* Artworks List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Artworks ({artworks.length})
              </h2>
              {artworks.length === 0 ? (
                <p className="text-gray-500 text-sm">No artworks yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artworks.map((artwork) => (
                    <div key={String(artwork.id)} className="border border-gray-200 rounded-lg overflow-hidden">
                      {editingId === artwork.id ? (
                        <form onSubmit={handleEditArtwork} className="p-4 space-y-3">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                            required
                          />
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-gray-500"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={editLoading}
                              className="flex-1 bg-orange-500 text-white text-sm py-1.5 rounded-lg disabled:opacity-60"
                            >
                              {editLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="flex-1 border border-gray-300 text-gray-600 text-sm py-1.5 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <img
                            src={artwork.image.getDirectURL()}
                            alt={artwork.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-3">
                            <p className="font-medium text-gray-900 text-sm truncate">{artwork.title}</p>
                            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{artwork.description}</p>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => {
                                  setEditingId(artwork.id);
                                  setEditTitle(artwork.title);
                                  setEditDesc(artwork.description);
                                  setEditFile(null);
                                }}
                                className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteArtwork(artwork.id)}
                                className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Site Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-6 pb-12">
            {imageSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {imageSuccess}
              </div>
            )}
            {[
              { key: 'logo' as const, label: 'Logo', current: logo, file: logoFile, setFile: setLogoFile },
              { key: 'cover' as const, label: 'Cover Image', current: coverImage, file: coverFile, setFile: setCoverFile },
              { key: 'portrait' as const, label: 'Artist Portrait', current: artistPortrait, file: portraitFile, setFile: setPortraitFile },
            ].map(({ key, label, current, file, setFile }) => (
              <div key={key} className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{label}</h2>
                {current && (
                  <img
                    src={current.getDirectURL()}
                    alt={label}
                    className="w-full max-h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="flex gap-3 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                  />
                  <button
                    onClick={() => file && handleImageUpload(key, file)}
                    disabled={!file || imageLoading === key}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap flex items-center gap-2"
                  >
                    {imageLoading === key && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {imageLoading === key ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Text Content Tab */}
        {activeTab === 'text' && (
          <div className="pb-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Text Content</h2>
              <form onSubmit={handleUpdateText} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist Name</label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    required
                  />
                </div>
                {textSuccess && <p className="text-green-600 text-sm">{textSuccess}</p>}
                <button
                  type="submit"
                  disabled={textLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {textLoading && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {textLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
