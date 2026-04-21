import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  postgres: {
    user: process.env.POSTGRES_USER || "username",
    passwd: process.env.POSTGRES_PASSWORD || "password",
    db: process.env.POSTGRES_DB || "database",
  },
  ehr: {
    baseurl: process.env.EHR_BASE_URL || "base url",
    dburl: process.env.DB_URL || "url",
    user: process.env.DB_USER || "username",
    pass: process.env.DB_PASS || "pass",
    authtype: process.env.SECURITY_AUTHTYPE || "authtype",
    authuser: process.env.SECURITY_AUTHUSER || "authuser",
    authpasswd: process.env.SECURITY_AUTHPASSWORD || "authpassword",
  }
}
