import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { sequelize } from "../config/database";

// Import models through the index so all associations are wired before use.
import { User, Role, UserRole, Service } from "../models";

const SALT_ROUNDS = 10;

async function seed() {
  await sequelize.authenticate();
  console.log("Database connected. Seeding...\n");

  // -------------------------------------------------------------------------
  // Roles
  // -------------------------------------------------------------------------
  const roleNames = ["ADMIN", "PROVIDER", "CLIENT"] as const;
  const roles: Record<string, Role> = {};

  for (const name of roleNames) {
    const [role] = await Role.findOrCreate({ where: { name } });
    roles[name] = role;
    console.log(`  Role: ${name}`);
  }

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------
  const userData = [
    {
      firstName: "System",
      lastName: "Admin",
      email: "admin@ndova.com",
      password: "Admin@123",
      phone: "+1 000 000 0001",
      role: "ADMIN" as const,
    },
    {
      firstName: "Jane",
      lastName: "Provider",
      email: "provider@ndova.com",
      password: "Provider@123",
      phone: "+1 000 000 0002",
      role: "PROVIDER" as const,
    },
    {
      firstName: "John",
      lastName: "Client",
      email: "client@ndova.com",
      password: "Client@123",
      phone: "+1 000 000 0003",
      role: "CLIENT" as const,
    },
  ];

  for (const u of userData) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);

    let user = await User.findOne({ where: { email: u.email } });
    if (!user) {
      user = await User.create({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        passwordHash,
        phone: u.phone,
      });
    }

    await UserRole.findOrCreate({
      where: { userId: user.id, roleId: roles[u.role].id },
    });

    console.log(`  User: ${u.email}  (${u.role})  password: ${u.password}`);
  }

  // -------------------------------------------------------------------------
  // Services
  // -------------------------------------------------------------------------
  const services = [
    {
      name: "General Consultation",
      description: "A standard consultation session with a provider.",
      durationMinutes: 30,
    },
    {
      name: "Follow-up Appointment",
      description: "A follow-up session to review prior recommendations.",
      durationMinutes: 20,
    },
    {
      name: "Extended Assessment",
      description: "An in-depth assessment and planning session.",
      durationMinutes: 60,
    },
    {
      name: "Urgent Care Visit",
      description: "Priority slot for urgent matters.",
      durationMinutes: 15,
    },
  ];

  for (const s of services) {
    await Service.findOrCreate({ where: { name: s.name }, defaults: s });
    console.log(`  Service: ${s.name}`);
  }

  console.log("\nSeed complete.");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => sequelize.close());
