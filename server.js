const express = require("express");
const compression = require("compression");
const cors = require("cors");
const app = express();
const port = 3000;
const donationRouter = require("./routes/donation");
const userRouter = require("./routes/user");
const commonRouter = require("./routes/common");

require("dotenv").config();
app.use(cors());
app.use(express.json());
app.use(compression());
app.use("/api", donationRouter);
app.use("/api", userRouter);
app.use("/", commonRouter);
app.use("/api/uploads", express.static("uploads"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
