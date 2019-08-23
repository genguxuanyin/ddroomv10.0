const Sequelize = require('sequelize')
const db = {
    host: 'localhost',
    user: 'root',
    password: 'zx123456',
    database: 'weixin',
    port: 3306
};
const sequelize = new Sequelize(db.database, db.user, db.password, {
    host: db.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    },
    timestamps: false,
    timezone: '+08:00'
});
// var sequelize = new Sequelize(`mysql://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}`);
sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = sequelize;