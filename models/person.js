const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const constainsOnlyNumbers = (str) => {
  return /^\d+$/.test(str)
}

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function (val) {
        const parts = val.split('-')
        if(parts.length > 2) {
          return false
        }
        const first = parts[0]
        const second = parts[1]
        if(constainsOnlyNumbers(first) && constainsOnlyNumbers(second)) {
          if(first.length >= 2 && first.length <=3) {
            if(second.length >= 5 && second.length <= 10) {
              return true
            }
          }
        }
        return false
      }, message: 'the new number is invalid'
    }
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
