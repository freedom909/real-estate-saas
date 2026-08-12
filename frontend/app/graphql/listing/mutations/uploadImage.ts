import { gql } from "@apollo/client";
import { uploadClient } from "@/app/lib/apolloClient";

export const UPLOAD_IMAGES = gql`
  mutation UploadImages($files: [Upload!]!) {
    uploadImages(files: $files) {
      objectKey
      url
      mimeType
      size
    }
  }
`;

/**
 * Upload images directly to the listing subgraph (bypasses Apollo Gateway).
 * Apollo Gateway doesn't forward multipart file uploads to subgraphs,
 * so we must hit the listing subgraph at localhost:4101/graphql directly.
 */
export async function uploadImagesDirect(files: File[]) {
  const result = await uploadClient.mutate<{
    uploadImages: { objectKey: string; url: string; mimeType: string; size: number }[];
  }>({
    mutation: UPLOAD_IMAGES,
    variables: { files },
  });
  return result.data?.uploadImages ?? [];
}
