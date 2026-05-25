const { handleApiRequest } = require("../server/apiRouter");

module.exports = function handler(req, res) {
  if (handleApiRequest(req, res)) return;

  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: "API route not found" }));
};
