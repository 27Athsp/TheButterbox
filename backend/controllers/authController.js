import User, { findOne } from "/models/User";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

export async function register(req, res) {
  const { name, email, password, role, roleId } = req.body;
  // Add roleID validation if baker/admin logic required
  try {
    const existing = await findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await hash(password, 10);
    const user = new User({ name, email, password: hashed, role, roleId });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req, res) {
  const { email, password, role, roleId } = req.body;
  try {
    const user = await findOne({ email, role });
    if (!user) return res.status(404).json({ error: "User not found" });

    // For baker/admin, check roleId match (custom logic)
    if ((role === "baker" || role === "admin") && user.roleId !== roleId) {
      return res.status(403).json({ error: "Access Denied: Invalid ID" });
    }
    const valid = await compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
}
