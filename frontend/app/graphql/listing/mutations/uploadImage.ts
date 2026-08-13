import { gql } from "@apollo/client";
import { uploadClient } from "@/app/lib/apolloClient";

export { uploadClient };

export const UPLOAD_IMAGES = gql`
  mutation UploadImages($files: [Upload!]!, $listingId: ID!) {
    uploadImages(files: $files, listingId: $listingId) {
      id
      listingId
      objectKey
      url
      mimeType
      size
      type
      sortOrder
    }
  }
`;

export async function uploadImagesDirect(files: File[], listingId: string) {
  if (!listingId) {
    throw new Error("listingId is required for image upload");
  }
  const result = await uploadClient.mutate<{
    uploadImages: {
      id: string;
      listingId: string;
      objectKey: string;
      url: string;
      mimeType: string;
      size: number;
      type: string;
      sortOrder: number;
    }[];
  }>({
    mutation: UPLOAD_IMAGES,
    variables: { files, listingId },
  });
  return result.data?.uploadImages ?? [];
}
