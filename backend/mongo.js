const mongoose = require('mongoose')
const password = process.argv[2]
const url = `mongodb+srv://fullstackopen:${password}@cluster0.qgqb3at.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

//`mongodb+srv://fullstackopen:${password}@cluster0.qgqb3at.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: Date
})


personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

let person = null

switch(process.argv.length){
case 3:
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
  break
case 5:
  person = new Person({
    name: process.argv[3],
    number: process.argv[4],
    date: new Date()
  })

  person.save().then(() => {
    console.log('added ', person.name, ' number ', person.number, ' to phonebook ')
    mongoose.connection.close()
  })
  break
default:
  console.log('Invalid amount of parameters in database query')
  mongoose.connection.close()
  break
}