let app;

try {
  app = require("../server");
} catch (err) {
  console.error("Failed to load server:", err);

  module.exports = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://kapato.vercel.app");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.status(500).json({
      error: "Server failed to start",
      message: err.message,
    });
  };
} 

if (app) {
  module.exports = (req, res) => {
    try {
      return app(req, res);
    } catch (err) {
      console.error("Handler error:", err);

      if (!res.headersSent) {
        res.setHeader(
          "Access-Control-Allow-Origin",
          req.headers.origin || "https://kapato.vercel.app"
        );
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.status(500).json({
          error: "Handler error",
          message: err.message,
        });
      }
    }
  };
}
