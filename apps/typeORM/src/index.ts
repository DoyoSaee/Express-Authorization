import express from 'express';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.send('Running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
