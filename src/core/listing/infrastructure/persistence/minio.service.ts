import { Client } from "minio";
import { Readable } from "stream";

export class MinioService {

  private client: Client;


  constructor() {

    this.client = new Client({

      endPoint: process.env.MINIO_HOST!,
      port: Number(process.env.MINIO_PORT),
      useSSL: false,

      accessKey:
        process.env.MINIO_ACCESS_KEY!,

      secretKey:
        process.env.MINIO_SECRET_KEY!

    });

  }


  async upload(
    objectKey: string,
    stream: Readable,
    mimetype: string
  ) {


    await this.client.putObject(

      process.env.MINIO_BUCKET!,

      objectKey,

      stream,

      undefined,

      {
        "Content-Type": mimetype
      }

    );


    return objectKey;

  }

}