const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h0us0hz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const appointmentOptionCollection = client
      .db("doctorsPortalDB")
      .collection("appointmentOptions");

    const bookingCollection = client
      .db("doctorsPortalDB")
      .collection("bookings");

    // Finding available time slots for a day.
    // Use aggregate to query multiple collections and then merge data.
    app.get("/appointmentOptions", async (req, res) => {
      const date = req.query.date;
      console.log(date);
      const query = {};
      // Fetching all treatment options
      const options = await appointmentOptionCollection.find(query).toArray();
      const bookingQuery = { appointmentDate: date };
      // Fetching options according to date chosen by the user
      const alreadyBooked = await bookingCollection
        .find(bookingQuery)
        .toArray();
      // Looping through all treatment options
      options.forEach((option) => {
        // Fetching the selected treatment option
        const optionBooked = alreadyBooked.filter(
          (book) => book.treatment === optionBooked
        );
        // Fetching all the booked slots out of the selected treatment option.
        const bookedSlots = optionBooked.map((book) => book.slot);
        console.log(option.name, bookedSlots);
      });
      res.send(options);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log("Booking:", booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log());

app.get("/", async (req, res) => {
  res.send("Doctors Portal Server Running");
});

app.listen(port, () =>
  console.log(`Doctors Portal Server running on port ${port}`)
);
