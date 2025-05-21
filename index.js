const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_TOKEN;
const CUSTOM_OBJECT_NAME = process.env.CUSTOM_OBJECT_NAME;
const headers = {
  Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
  'Content-Type': 'application/json'
};
// ROUTE 1 - Homepage: list all plants
app.get('/', async (req, res) => {
  const url = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_NAME}?properties=name,genus,species,light_requirement_s_,water_requirements`;
  try {
    const response = await axios.get(url, { headers });
    const plants = response.data.results.filter(p => p.properties); // safety guard
    console.log(`Fetched ${plants.length} plant(s)`); // lightweight log
    res.render('homepage', { plants });
  } catch (err) {
    console.error('Error fetching plants:', err.response?.data || err.message);
    res.status(500).send('Failed to fetch plants.');
  }
});
// ROUTE 2 - Render form to add a new plant
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
  });
});
// ROUTE 3 - Handle form submission
app.post('/update-cobj', async (req, res) => {
  const newPlant = {
    properties: {
      name: req.body.name,
      genus: req.body.genus,
      species: req.body.species,
      water_requirements: req.body.water_requirements,
      light_requirement_s_: req.body.light_requirement_s_ || ''
    }
  };
  const url = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_NAME}`;
  try {
    await axios.post(url, newPlant, { headers });
    res.redirect('/');
  } catch (err) {
    console.error('Error creating plant:', err.response?.data || err.message);
    res.status(500).send('Failed to create plant.');
  }
});
// Start the server
app.listen(3000, () => console.log('Listening on http://localhost:3000'));