const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Joi = require('joi');

const app = new express();
app.use(cors());
app.use(express.json());

const submitRequestSchema = Joi.object({
  firstName: Joi.string()
    .regex(/^[A-Za-z]+$/)
    .required(),
  lastName: Joi.string()
    .regex(/^[A-Za-z]+$/)
    .required(),
  email: Joi.string().email().allow('').optional(),
  phoneNumber: Joi.string().allow('').optional(),
  Supervisor: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    identificationNumber: Joi.string().required(),
  }).required(),
});

app.get('/api/supervisors', async (req, res) => {
  try {
    const response = await axios.get(
      'https://o3m5qixdng.execute-api.us-east-1.amazonaws.com/api/managers'
    );
    res.json(
      response.data
        .sort((a, b) => {
          if (a.jurisdiction < b.jurisdiction) return -1;
          if (a.jurisdiction > b.jurisdiction) return 1;

          if (a.lastName < b.lastName) return -1;
          if (a.lastName > b.lastName) return 1;

          if (a.firstName < b.firstName) return -1;
          if (a.firstName > b.firstName) return 1;

          return 0;
        })
        .map((item) => ({
          id: item.id,
          name: `${item.jurisdiction} - ${item.lastName}, ${item.firstName}`,
          phone: item.phone,
          identificationNumber: item.identificationNumber,
        }))
    );
  } catch (e) {
    res.json({
      error: e.message,
    });
  }
});

app.post('/api/submit', (req, res) => {
  const { error } = submitRequestSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  console.log('Received notification request:', req.body);

  return res
    .status(200)
    .json({ message: 'Notification request submitted successfully.' });
});

app.listen(8080, () => {
  console.log('Listening on 8080. Ctrl+c to stop this server.');
});
