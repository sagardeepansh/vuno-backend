import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ApiKey from "../models/apikey.model.js";
import apilogModel from "../models/apilog.model.js";
import User from "../models/user.model.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");

    req.user = {
      id: decoded.id,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// export const validateApiKey = async (req, res, next) => {
//   const apiKey = req.headers["x-api-key"];

//   if (!apiKey) return res.status(401).json({ error: "Missing API key" });

//   const keys = await ApiKey.find();
//    const apiKeydata = await ApiKey.findOne({ apiKey: apiKey });
//    req.apiKeyId = apiKeydata._id;

//   for (let k of keys) {
//     const match = await bcrypt.compare(apiKey, k.key);
//     if (match) {
//       req.user = k.user;
//       k.lastUsed = new Date();
//       await k.save();
//       return next();
//     }
//   }

//   return res.status(401).json({ error: "Invalid API key" });
// };

function extractDomain(url) {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function isDomainAllowed(domain, whitelist = []) {
  if (!domain) return false;
  console.log("Validating domain:", domain, "against whitelist:", whitelist);
  // allow localhost (dev)
  if (domain === "localhost" || domain.startsWith("127.0.0.1")) {
    return true;
  }

  return whitelist.some((allowed) => {
    const clean = allowed.replace(/^www\./, "");

    // exact match
    if (clean === domain) return true;

    // wildcard (*.example.com)
    if (clean.startsWith("*.")) {
      const base = clean.replace("*.", "");
      return domain === base || domain.endsWith(`.${base}`);
    }

    return false;
  });
}

export const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ message: "Missing API key" });
    }

    // Fetch all keys (still needed because of bcrypt hashing)
    const keys = await ApiKey.find();

    let matchedKey = null;

    for (let k of keys) {
      const match = await bcrypt.compare(apiKey, k.key);
      if (match) {
        matchedKey = k;
        break;
      }
    }

    if (!matchedKey) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    // ✅ Attach useful data
    req.user = matchedKey.user;
    req.apiKeyId = matchedKey._id;
    
    const existingUser = await User.findById(matchedKey.user);
    

    // ✅ DOMAIN VALIDATION START
    const origin =
  req.headers["x-origin"] ||   // ✅ priority
  req.headers.origin ||
  req.headers.referer;

  console.log('origin', origin)

    const domain = extractDomain(origin);
    const whitelist = existingUser?.whitelistDomains || [];

    if (!isDomainAllowed(domain, whitelist)) {
      return res.status(403).json({
        message: "Domain not allowed",
      });
    }
    // ✅ DOMAIN VALIDATION END

    // update last used
    matchedKey.lastUsed = new Date();
    await matchedKey.save();

    return next();
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const trackApiUsage = async (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      await apilogModel.create({
        apiKeyId: req.apiKeyId, // must be set earlier
        endpoint: req.originalUrl,
        status: res.statusCode,
        responseTime: Date.now() - start,
      });
    } catch (err) {
      console.error("Logging failed", err);
    }
  });

  next();
};
