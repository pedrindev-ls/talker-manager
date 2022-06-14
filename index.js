const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});

app.get('/talker', async (_req, res) => {
  const talkers = await fs.readFile('./talker.json');
  const cTalkers = JSON.parse(talkers);
  res.status(200).json(cTalkers);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkers = await fs.readFile('./talker.json');
  const cTalkers = JSON.parse(talkers);
  const itemSelected = cTalkers.find((element) => element.id === Number(id));

  if (!itemSelected) { 
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' }); 
  }

  res.status(200).send(itemSelected);
});
