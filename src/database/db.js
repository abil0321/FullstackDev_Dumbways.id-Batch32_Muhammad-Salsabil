import { Pool } from "pg";

// TODO: Koneksi ke localhost
// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "personal-web",
//   password: "ganteng321",
//   port: 5432,
// });

// TODO: Koneksi ke NeonDB
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_Fec3yP0BNVRw@ep-floral-voice-a1g2nwja-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false, // WAJIB agar koneksi SSL dari Neon tidak ditolak
  },
});

export default pool;