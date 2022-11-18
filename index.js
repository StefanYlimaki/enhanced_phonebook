require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

var morgan = require('morgan')
const cors = require('cors')

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(express.static('build'))
app.use(express.json())
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)
app.use(cors())

app.get('/', (req, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  Person.find({}).then((persons) => {
    res.send(`
      <div>
        <p>Phonebook has info for ${persons.length} people</p>
          <p>${new Date()}
        <div>
      `)
  })
})

app.get('/health', (req, res) => {
  res.send('ok')
})

app.get('/version', (req, res) => {
  res.send('7') // change this string to ensure a new version deployed
})

app.get('/api/persons', (req, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' })
  }

  if (body.number === undefined) {
    return response.status(400).json({ error: 'number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1000000),
  })

  morgan.token()

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => {
      next(error)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query',
  })
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => {
      next(error)
    })
})

/************ Tuntemattomat kohteet *****************/

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

/************ Virheiden Käsittely *****************/

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'MongoServerError') {
    return response.status(401).send({ error: 'already exists' })
  } else if (error.name === 'ValidationError') {
    return response.status(402).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT | 8080
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
