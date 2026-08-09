
import { gql } from "@apollo/client";

export const UPLOAD_IMAGE = gql`
mutation UploadImage($file: Upload!) {
    uploadImage(file: $file) {
        objectKey
        url
        mimeType
        size
    }
}
`;
