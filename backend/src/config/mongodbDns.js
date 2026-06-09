const dns = require("dns");

const configureMongoDns = () => {
  const servers = process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8";
  const resolvedServers = servers
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (resolvedServers.length > 0) {
    dns.setServers(resolvedServers);
  }
};

module.exports = { configureMongoDns };