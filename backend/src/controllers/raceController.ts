import { Request, Response } from "express";
import mongoose from "mongoose";

export const getRaceByNameAndGender = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(500).json({ message: "Database connection not established" });
      return;
    }

    const racesCollection = db.collection("races");
    const race = await racesCollection.findOne({
      name: req.params.name.charAt(0).toUpperCase() + req.params.name.slice(1).toLowerCase(),
      gender: req.params.gender.charAt(0).toUpperCase() + req.params.gender.slice(1).toLowerCase(),
    });

    if (!race || !race.image) {
      res.status(404).json({ message: "Race image not found" });
      return;
    }

    res.status(200).json(race);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const getRaceImageByNameAndGender = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(500).json({ message: "Database connection not established" });
      return;
    }

    const racesCollection = db.collection("races");
    const race = await racesCollection.findOne({
      name: req.params.name.charAt(0).toUpperCase() + req.params.name.slice(1).toLowerCase(),
      gender: req.params.gender.charAt(0).toUpperCase() + req.params.gender.slice(1).toLowerCase(),
    });

    if (!race || !race.image) {
      res.status(404).json({ message: "Race image not found" });
      return;
    }

    let imageData;
    if (race.image.buffer) {
      imageData = race.image.buffer;
    } else if (race.image.$binary && race.image.$binary.base64) {
      imageData = Buffer.from(race.image.$binary.base64, "base64");
    } else {
      imageData = race.image;
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `inline; filename="${race.name.toLowerCase()}-${race.gender.toLowerCase()}.png"`);
    res.send(imageData);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};