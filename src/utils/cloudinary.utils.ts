import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../configs/env.config";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME!,
  api_key: CLOUDINARY_API_KEY!,
  api_secret: CLOUDINARY_API_SECRET!,
});
export class CloudinaryUtil {
  static async uploadStream(file: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "auto" }, (error, result) => {
          if (error || !result) {
            return reject(error);
          } else {
            return resolve(result?.secure_url);
          }
        })
        .end(file);
    });
  }
}
