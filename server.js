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
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

const Thought = mongoose.model('Thought', ThoughtSchema);

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hello world');
});

app.get('/thoughts', async (req, res) => {
  const thoughtsList = await Thought.find()
    .sort({ createdAt: 'desc' })
    .limit(20)
    .exec();
  res.json(thoughtsList);
});

app.post('/thoughts', async (req, res) => {
  const { message, likes } = req.body;

  try {
    const newThought = await new Thought({ message, likes }).save();
    res.status(201).json({ response: newThought, success: true });
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

app.post('/members/:thoughtId/like', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedLike = await Thought.findByIdAndUpdate(
      // Argument 1 - id
      id,
      // Argument 2 - properties to change
      {
        $inc: {
          score: 1,
        },
      },
      // Argument 3 - options (not mandatory)
      {
        new: true,
      }
    );
    res.status(200).json({ response: updatedLike, success: true });
  } catch (error) {
    res.status(400).json({ response: error, success: false });
  }
});

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`);
});
