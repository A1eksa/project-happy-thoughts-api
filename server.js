import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/happyThoughts';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

//schema
const ThoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
  },
  like: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

const Thought = mongoose.model('Thought', ThoughtSchema);

app.get('/thoughts', async (req, res) => {
  const thoughtsList = await Thought.find()
    .sort({ createdAt: 'desc' })
    .limit(20)
    .exec();
  res.json(thoughtsList);
});

app.post('/thoughts', async (req, res) => {
  const { message } = req.body;

  try {
    const newThought = await new Thought({ message }).save();
    res.status(201).json({ response: newThought, success: true });
  } catch (error) {
    res.status(400).json({ response: 'this is error', success: false });
  }
});

app.post('/thoughts/:id/like', async (req, res) => {
  const { id } = req.params;

  try {
    const updateLike = await Thought.findByIdAndUpdate(id, {
      $inc: { hearts: 1 },
    });
    if (updateLike) {
      res.status(200).json({ response: updateLike, success: true });
    } else {
      res.status(404).json({ response: 'Not found', success: false });
    }
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`);
});
