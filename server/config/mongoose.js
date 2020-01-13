const mongoose = require('mongoose')
const URI = process.env.MONGODB_URI || 'mongodb://localhost/default'

mongoose
  .connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log('mongodb connected at', URI))
  .catch(err => console.log('mongodb connection failed\nError:', err))
