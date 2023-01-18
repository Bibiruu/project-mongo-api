import express from "express";
import cors from "cors";
import blockchainjobs from "./data/blockchainjobs.json";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); //configuration

const mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.get("/", (req, res) => {
  res.send({
    responseMassage: "Choice routes:",
    Routes: [
      {
        "/blockchainjobs": "Displaying the whole available data",
        "/title": "All work Titles",
        "/title/:id": "Paste your title id here ex. 6383ed726dc4c30af4e21c67 ",
        "/company": "Company option",
        "/company/:id":
          "Company option with id input ex. 63c6df59879d2963951c8f1d ",
      },
    ],
  });
});

const Company = mongoose.model("Company", {
  Company: String,
  Easy_Apply: Boolean,
  Salary_Lower_Limit: Number,
  Salary_Upper_Limit: Number,
});

/*const Title = mongoose.model("Title", {
  Title: String,
  Location: {
    type: mongoose.Schema.Types.String,
    ref: "Location",
  },
});*/

if (process.env.MONGO_URL) {
  const seedDatabase = async () => {
    await Company.deleteMany({});
    await Title.deleteMany();

    blockchainjobs.forEach((data) => {
      new Company(data).save();
      new Title(data).save();
    });
    seedDatabase();
  };

    app.get("/blockchainjobs", async (req, res) => {
      res.json(blockchainjobs); // sending the whole data set which you imported
    });

    app.get("/title", async (req, res) => {
      const title = await Title.find();
      res.json(title);
      console.log("Title", title);
    });

    app.get("/title/:title", async (req, res) => {
      const titleId = await Title.findById(req.params.title);

      if (!titleId) {
        res.status(404).json({ error: "Error in id." });
      } else {
        res.status(200).json(titleId);
      }
    });

    app.get("/company", async (req, res) => {
      const company = await Company.find(); // will find all in your database
      res.json(company);
    });

    app.get("/company/:id", async (req, res) => {
      const id = await Company.findById(req.params.id);

      if (id) {
        res.status(200).json(id);
      } else {
        res.status(404).json({ error: "Error in id." });
      }
    });

    app.get("/company/:id/title", async (req, res) => {
      const companies = await Company.findById(req.params.id).populate(
        "Location"
      );

      if (companies) {
        const title = await Title.find({
          companies: mongoose.Types.ObjectId(companies.id),
        });
        res.status(200).json(title);
      } else {
        res.status(404).json({ error: "Error in author name." });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }

