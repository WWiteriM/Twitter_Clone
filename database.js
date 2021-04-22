const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

class Database {
  constructor() {
    this.connect();
  }

  // eslint-disable-next-line class-methods-use-this
  connect() {
    mongoose
      .connect(
        'mongodb+srv://admin:12345@twitterclonecluster.trl59.mongodb.net/TwitterDB?retryWrites=true&w=majority',
      )
      .then(() => {
        console.log('Success');
      })
      .catch((err) => {
        console.log(`MongoDb connection error -- ${err}`);
      });
  }
}

module.exports = new Database();
