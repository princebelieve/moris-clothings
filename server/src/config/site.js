const PRODUCTION_URL = "https://morisclothing.co.uk";
const CLIENT_URL = process.env.NODE_ENV === "production" ? PRODUCTION_URL : (process.env.CLIENT_URL || PRODUCTION_URL).replace(/\/$/, "");
module.exports = { CLIENT_URL, PRODUCTION_URL };
