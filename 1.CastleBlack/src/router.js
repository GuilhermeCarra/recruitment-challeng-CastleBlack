const { Router } = require("express");
const router = Router();

router.get("/health", function(req, res) {
  res.body = "Up and running";
  // QUESTION: why this endpoint blocks the app?

  /*
    ANSWER: because it's receiving a request but it's not sending a response
            so this request has no end.
  */
});

module.exports = router;
