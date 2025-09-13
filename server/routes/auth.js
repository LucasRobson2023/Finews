const router = require("express").Router();
const passport = require("passport");

// start OAuth with Google
router.get("/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/generative-language.retriever"
    ],
    accessType: "offline",  // get a refresh token
    prompt: "consent"       // force consent screen to show every time
  })
);

// callback from Google
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // ✅ send token and profile info to frontend
    const user = {
      profile: req.user.profile,
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken
    };

    // Option 1: redirect with token as query param
    // res.redirect(`http://localhost:5173?token=${req.user.accessToken}`);

    // Option 2: send JSON (frontend fetches it directly instead of redirect)
    res.json(user);
  }
);

// logout
router.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("http://localhost:5173");
});

// get current user
router.get("/user", (req, res) => {
  res.send(req.user || null);
});

module.exports = router;
