
const sequelize = require('../db/connect')
const Sequelize = require('sequelize')
const moment = require('moment')

const Profile = sequelize.define('t_profile', {
    type: {
        type: Sequelize.STRING
    },
    describe: {
        type: Sequelize.STRING
    },
    income: {
        type: Sequelize.STRING,
        allowNull: false
    },
    expend: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cash: {
        type: Sequelize.STRING
    },
    remark: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        get() {
            return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    },
    updatedAt: {
        type: Sequelize.DATE,
        get() {
            return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
        }
    }
});

module.exports = Profile;