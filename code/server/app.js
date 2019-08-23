const createError = require('http-errors')
const express = require('express')
const path = require('path')
// import c const abc = require('cookie-parser';
const passport = require('passport')
const logger = require('morgan')
const http = require('http')
const Debug = require('debug')

const Passport = require('./config/passport')

const profilesRouter = require('./routes/profiles')
const usersRouter = require('./routes/users')

//连接Mysql
require('./db/connect')

const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport 初始化
app.use(passport.initialize());
Passport(passport);

//路由 Router
app.use('/api/profiles', profilesRouter);
app.use('/api/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json(err);
  // res.render('error');
});

var debug = Debug('node-express-template:server');

/**
  * Get port from environment and store in Express.
  */
/**
  * Normalize a port into a number, string, or false.
  */
const port = (function (val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
})(process.env.PORT || '3000');
app.set('port', port);

/**
  * Create HTTP server.
  */

const server = http.createServer(app);

/**
  * Listen on provided port, on all network interfaces.
  */

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/**
  * Event listener for HTTP server "error" event.
  */
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

/**
  * Event listener for HTTP server "listening" event.
  */
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
});