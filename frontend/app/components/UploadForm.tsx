'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { gql} from '@apollo/client';
import { useMutation } from "@apollo/client/react";

const LISTING_PICTURE_UPLOAD = gql`
  mutation ListingPictureUpload($input: ListingPictureUploadInput!) {
    listingPictureUpload(input: $input) {
      success
      message
    }
  }
`;

type ListingPictureType='cover'|'livingRoom'|'bedRoom'|'bathroom'|'kitchen'|'other';

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const maxSizeMB = 10;

export default function UploadForm() {
  const [files, setFiles] = useState<Partial<{ [key in ListingPictureType]: File }>>({});
  const [progress, setProgress] = useState<Partial<{ [key in ListingPictureType]: number }>>({});
  const [error, setError] = useState<string | null>(null);

  const [listingPictureUpload] = useMutation(LISTING_PICTURE_UPLOAD);

  // Validate file
  const validateFile = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, JPEG, and PNG allowed.');
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Max file size: ${maxSizeMB}MB`);
      return false;
    }
    return true;
  };

  // Upload using presign URL
async function uploadToPresignedUrl(file: File, type: ListingPictureType) {
  const res = await fetch('/api/presign-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
    fileName: file.name,
    fileType: file.type,
    }),
  });

  if (!res.ok) {
    throw new Error('Presign failed (proxy error)');
  }

  const { uploadUrl, key } = await res.json();
  if (!uploadUrl) throw new Error('Failed presign.');

  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  return key;
}


const handleDrop =
  (type: ListingPictureType) =>
  (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setError(null);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setFiles(prev => ({
      ...prev,
      [type]: file,
    }));
  };

  async function handleSubmit() {
    setError(null);

    if (!files.cover || !files.livingRoom || !files.bedRoom || !files.bathroom || !files.kitchen || !files.other) {
      setError('Please upload all 6 images.');
      return;
    }

    try {
      const uploadedKeys = {
        coverKey: await uploadToPresignedUrl(files.cover, 'cover'),
        livingRoomKey: await uploadToPresignedUrl(files.livingRoom, 'livingRoom'),
        bedRoomKey: await uploadToPresignedUrl(files.bedRoom, 'bedRoom'),
        bathroomKey: await uploadToPresignedUrl(files.bathroom, 'bathroom'),
        kitchenKey: await uploadToPresignedUrl(files.kitchen, 'kitchen'),
        otherKey: await uploadToPresignedUrl(files.other, 'other'),
      };

      const result = await listingPictureUpload({
        variables: { input: uploadedKeys }
      });

      alert((result.data as unknown as any).listingPictureUpload.message);
    } catch (err) {
      console.error(err);
      setError('Upload failed.');
    }
  }

  const renderDropBox = (
    type: ListingPictureType,
    label: string,
    preview = false
  ) => (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={preview ? handleDrop(type) : undefined} 
      className="flex flex-col justify-center items-center border-2 border-dashed rounded-xl p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 w-full h-40 text-center"
    >
      {files[type] ? (
        <Image
          src={URL.createObjectURL(files[type])}
          width={120}
          height={80}
          className="object-cover rounded-md"
          alt={`${label} preview`}
        />
      ) : (
        <span className="text-sm text-gray-500">{label}</span>
      )}

      {progress[type] != null && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="h-2 bg-blue-500 rounded-full"
            style={{ width: `${progress[type]}%` }}
          ></div>
        </div>
      )}

      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && validateFile(file)) {
            setFiles(prev => ({ ...prev, [type]: file }));
          }
        }}
      />
    </label>
  );

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold text-center">
        Identity Verification
      </h2>

      {/* Grid - mobile responsive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderDropBox('cover', 'Cover of Card')}
        {renderDropBox('livingRoom', 'Living Room of Card')}
        {renderDropBox('bedRoom', 'Bed Room of Card')}
        {renderDropBox('bathroom', 'Bathroom of Card')}
        {renderDropBox('kitchen', 'Kitchen of Card')}
        {renderDropBox('other', 'Other of Card')}
      </div>

      {error && (
        <div className="text-red-500 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        Submit Verification
      </button>
    </div>
  );
}
