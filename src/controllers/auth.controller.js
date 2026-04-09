import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import ApiKey from "../models/apikey.model.js";
import { generateApiKey, generateToken } from "../utils/generateToken.js";
import { sendOtpEmail } from "../services/sendOtpEmail.js";
import apilogModel from "../models/apilog.model.js";

/**
 * @route POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    let user;

    if (existingUser) {
      // update existing unverified user
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
      user = existingUser;
    } else {
      // create new user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        otp,
        otpExpiry,
      });
    }

    // send OTP email
    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to email",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // mark verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Account verified",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User found",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gkey: user.gkey,
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const meUpdate = async (req, res) => {
  try {
    const { name, email, gkey } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (gkey) user.gkey = gkey;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gkey: user.gkey,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createKey = async (req, res) => {

  const { name } = req.body;

  const rawKey = generateApiKey();
  const hashedKey = await bcrypt.hash(rawKey, 10);

  const key = await ApiKey.create({
    name,
    key: hashedKey,
    user: req.user.id,
  });

  res.json({
    id: key._id,
    key: rawKey, // send only once
  });
};

export const getKeys = async (req, res) => {
  const keys = await ApiKey.find({ user: req.user.id })
    .select("_id name createdAt lastUsed");
  res.json(keys);
};

export const deleteKey = async (req, res) => {
  await ApiKey.deleteOne({
    _id: req.params.id,
    user: req.user.id,
  });

  res.json({ success: true });
};

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalRequests = await apilogModel.countDocuments({});

    const activeKeys = await ApiKey.countDocuments({
      userId
    });

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const errors24h = await apilogModel.countDocuments({
      status: { $gte: 400 },
      createdAt: { $gte: last24h },
    });

    res.json({
      totalRequests,
      activeKeys,
      errors24h,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
