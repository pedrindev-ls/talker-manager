const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// const loginValidation = (req, res, next) => {
//   const { email, password } = req.body;

//   if (!email || email !== /\w+@\w+\.\S+/g) { 
//     return res.status(404).json({ message: 'O campo "email" é obrigatório' }); 
//   }

//   if (!password || password < 6) {
//     return res.status(404).json({ message: 'Pessoa palestrante não encontrada' }); 
//   }

//   next();
// };

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

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const generatedToken = crypto.randomBytes(8).toString('hex');
  const EMAILREGEX = /\w+@\w+\.\S+/g;

  if (!email) { 
    return res.status(400).json({ message: 'O campo "email" é obrigatório' }); 
  }
  if (!EMAILREGEX.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' }); 
  }
  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' }); 
  }

  return res.status(200).json({ token: generatedToken });
  });

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
