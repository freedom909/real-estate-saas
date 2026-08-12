export const TOKENS_PICTURE = {
  repos: {
    pictureRepository: Symbol.for('PictureRepository'),
  },
  models: {
    pictureModel: Symbol.for('PictureModel'),
  },
  usecase: {
    deletePictureUseCase: Symbol.for('DeletePictureUseCase'),
    uploadImageUseCase: Symbol.for('UploadImageUseCase'),
  },
  storage: {
    minioStorage: Symbol.for('MinioStorage'),
  },

}