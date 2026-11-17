const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─── Helper: upload profile image to Supabase Storage ────────────────────────
async function uploadProfileImage(file) {
  if (!file) return "";

  const ext = file.originalname?.split(".").pop() || "jpg";
  const fileName = `profiles/${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error("Image upload error:", error.message);
    return ""; // graceful fallback – signup still succeeds without image
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  return data.publicUrl;
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender, city } = req.body;

    // Check if email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Upload profile image (optional)
    const imageUrl = req.file ? await uploadProfileImage(req.file) : "";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          firstname,
          lastname,
          email,
          password: hashedPassword,
          gender: gender || "Other",
          city,
          profile_image: imageUrl,
        },
      ])
      .select("id, firstname, lastname, email")
      .single();

    if (error) throw error;

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ message: "Signup Successful", token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup Failed" });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user including password hash
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login Successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login Failed" });
  }
};

// ─── GET PROFILE ──────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, firstname, lastname, email, gender, city, profile_image, created_at")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map profile_image → profileImage so the frontend keeps working as-is
    res.json({ ...user, profileImage: user.profile_image });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", user.id);

    if (error) throw error;

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
};