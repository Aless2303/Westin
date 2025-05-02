// backend/src/models/mapImageModel.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMapImage extends Document {
  name: string;
  filename: string;
  type: string;
  description: string;
  usage: string;
  dimensions?: {
    width: number;
    height: number;
  };
  fileSize?: number;
  mimeType: string;
  image: Buffer;
  uploadedAt: Date;
}

const mapImageSchema = new Schema<IMapImage>(
  {
    name: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['login_background', 'game_map', 'game_map_base'],
    },
    description: {
      type: String,
      required: true,
    },
    usage: {
      type: String,
      required: true,
    },
    dimensions: {
      width: Number,
      height: Number,
    },
    fileSize: Number,
    mimeType: {
      type: String,
      required: true,
      default: 'image/jpeg',
    },
    image: {
      type: Buffer,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'mapImages' // Explicitly using lowercase to match your database
  }
);

const MapImage = mongoose.model<IMapImage>('mapImage', mapImageSchema);

export default MapImage;