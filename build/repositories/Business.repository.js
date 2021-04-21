"use strict";

const BaseRepository = require('./base.repository');

let _businessModel = null;

class BusinessRepository extends BaseRepository {
  constructor({
    Business
  }) {
    super(Business);
    _businessModel = Business;
  }

  async getBusinessByEmail(email) {
    return _businessModel.findOne({
      email
    });
  }

  async getBusinessByDni(dni) {
    return _businessModel.findOne({
      'owner.dni': dni
    });
  }

  async getBusinessByCounter() {
    return _businessModel.find({
      active: true,
      disabled: false
    }).sort({
      counter: -1
    }).limit(5);
  }

  async getCategoryBusiness() {
    return _businessModel.aggregate([{
      $match: {
        active: true,
        disabled: false
      }
    }, {
      $group: {
        _id: '$category',
        total: {
          $sum: '$counter'
        }
      }
    }, {
      $sort: {
        total: -1
      }
    }, {
      $limit: 5
    }]);
  }

}

module.exports = BusinessRepository;