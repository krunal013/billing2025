const express = require("express");
const cors = require("cors"); // Ensure this line is present
const connectDB = require("./config/db");
const companyRoutes = require("./routes/companyRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const userRoutes = require("./controllers/UserController");

const app = express();
connectDB();

app.use(cors()); // Enable CORS
app.use(express.json());
app.use("/api/companies", companyRoutes);
app.use("/api", pdfRoutes);
app.use("/api/users", userRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
