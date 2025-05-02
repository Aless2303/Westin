import { Request, Response } from "express";
import mongoose from "mongoose";

export const getBackgroundByFilename = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(500).json({ message: "Database connection not established" });
      return;
    }

    const backgroundsCollection = db.collection("backgrounds");
    const background = await backgroundsCollection.findOne({ filename: req.params.filename });

    if (!background || !background.image) {
      res.status(404).json({ message: "Background image not found" });
      return;
    }

    res.status(200).json(background);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getBackgroundImageByFilename = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(500).json({ message: "Database connection not established" });
      return;
    }

    const backgroundsCollection = db.collection("backgrounds");
    const background = await backgroundsCollection.findOne({ filename: req.params.filename });

    if (!background || !background.image) {
      res.status(404).json({ message: "Background image not found" });
      return;
    }

    let imageData;
    if (background.image.buffer) {
      imageData = background.image.buffer;
    } else if (background.image.$binary && background.image.$binary.base64) {
      imageData = Buffer.from(background.image.$binary.base64, "base64");
    } else {
      imageData = background.image;
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Disposition", `inline; filename="${background.filename}"`);
    res.send(imageData);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};