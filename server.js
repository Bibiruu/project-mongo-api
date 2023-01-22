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
        "/company": "Company option",
        "/company/:id": "Company option with id",
        "/company?location=bangalore&easyapply=true":
          "Replace the location of your choice from database and easyapply to either: true or false",
      },
    ],
  });
});

const Company = mongoose.model("Company", {
  Title: String,
  Company: String,
  Location: String,
  Easy_Apply: Boolean,
  Salary_Lower_Limit: Number,
  Salary_Upper_Limit: Number,
});

//database seeding and layering for safety in IF statement
if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await Company.deleteMany();
    blockchainjobs.forEach((data) => {
      new Company(data).save();
    });
    seedDatabase();
  };
}

app.get("/blockchainjobs", async (req, res) => {
  res.json(blockchainjobs); // sending the whole data set which you imported
});

app.get("/company", async (req, res) => {
  try {
    const company = await Company.find({}); // will find all in your database
    res.status(200).json({
      success: true,
      data: company,
      message: "Success",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: null,
      error: error,
      message: "Page not found",
    });
  }
});
//https://project-mongo-api-jzokz6hyzq-lz.a.run.app/company/63c8811ec2f48a68801cb941
app.get("/company/:id", async (req, res) => {
  try {
    const id = await Company.findById(req.params.id); //mongodb id: _id
    if (id) {
      res.status(200).json({
        success: true,
        data: id,
        message: "Success",
      });
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      data: null,
      error: error,
      message: "Page not found",
    });
  }
});

//https://project-mongo-api-jzokz6hyzq-lz.a.run.app/company?location=remote&easyapply=false
app.get("/company/", async (req, res) => {
  const { location, easyapply } = req.query;
  const response = {
    success: true,
    data: {},
  };

  const locationQuery = location ? location : /.*/gm;
  const easypplyQuery = easyapply ? easyapply : /.*/gm;

  try {
    response.data = await Company.find({
      location: locationQuery,
      easyapply: easypplyQuery,
    });
    res.status(200).json({
      success: true,
      data: response.data,
      message: "Connection successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: error,
      message: "Page not found",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

/*Additional adding when time:
app.get("/company/:company", async (req, res) => {
  const companyId = await Company.findById(req.params.company);
  const jobTitles = blockchainjobs.filter(
    (item) => item.Company.toLowerCase() === companyId.toLowerCase()
  );
  console.log({jobTitles})
  if (!jobTitles) {
    res.status(404).json({ error: "Error in id." });
  } else {
    res.status(200).json(companyId);
  }
});*/
