const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const crypto = require('crypto');
const moment = require('moment');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const middlewareAuthorization = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }
  if (authorization.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }

  next();
};

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

const newTalkerNameAuthentication = (req, res, next) => {
  const { name } = req.body;
  
  if (!name) { return res.status(400).json({ message: 'O campo "name" é obrigatório' }); }
  if (name.length < 3) { 
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' }); 
  }

  next();
};

const newTalkerAgeAuthentication = (req, res, next) => {
  const { age } = req.body;
  if (!age) { return res.status(400).json({ message: 'O campo "age" é obrigatório' }); }
  if (age < 18) { 
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' }); 
  }

  next();
};

const newTalkerTalkAuthentication = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) { return res.status(400).json({ message: 'O campo "talk" é obrigatório' }); }
  next();
};

const newTalkerEmailAuthentication = (req, res, next) => {
  const { talk } = req.body;
  const { watchedAt } = talk;
  if (!watchedAt) { 
    return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' }); 
  }
  if (!moment(watchedAt, 'DD/MM/YYYY', true).isValid()) { 
    return (
      res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' })
    );
  }
  next();
};

const newTalkerRateAuthentication = (req, res, next) => {
  const { talk } = req.body;
  const { rate } = talk;

  if (!rate) { return res.status(400).json({ message: 'O campo "rate" é obrigatório' }); }
  if (rate < 1 || rate > 5) { 
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' }); 
  }

  next();
};

app.post('/talker', 
  middlewareAuthorization, 
  newTalkerNameAuthentication, 
  newTalkerAgeAuthentication,
  newTalkerTalkAuthentication,
  newTalkerRateAuthentication,
  newTalkerEmailAuthentication,
  async (req, res) => {
    const { name, age, talk } = req.body;
    const talkers = await fs.readFile('./talker.json');
    const nTalkers = JSON.parse(talkers);
    const newId = nTalkers[nTalkers.length - 1].id;
    nTalkers.push({ id: newId + 1, name, age, talk });
    const cTalkers = JSON.stringify(nTalkers);
    fs.writeFile('./talker.json', cTalkers);

    res.status(201).json(nTalkers[nTalkers.length - 1]);
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
