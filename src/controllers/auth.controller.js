import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import ApiKey from "../models/apikey.model.js";
import { generateApiKey, generateToken } from "../utils/generateToken.js";

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
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Signup successful",
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