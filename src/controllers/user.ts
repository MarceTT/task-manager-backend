import { Request, Response } from "express";
import { UserModel } from "../models/user";

export const allUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find()
        .select("firstName lastName email role")
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments()
    ]);

    res.status(200).json({ users, total });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getAssiganblesUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find({ role: "user" }).select("_id firstName lastName email");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}


export const verifyUser = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
  
      const user = await UserModel.findOne({ verificationToken: token });
  
      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired verification token" });
      }
  
      if (!user.verificationDeadline || new Date() > user.verificationDeadline) {
        return res.status(400).json({ message: "Verification token expired" });
      }
  
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationDeadline = undefined;
      await user.save();
  
      res.status(200).json({ message: "User verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  };