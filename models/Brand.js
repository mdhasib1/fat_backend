const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Brand {
  constructor(brandData) {
    this.id = uuidv4();
    this.brand_name = brandData.brand_name || '';
  }

  static create(newBrand, result) {
    db.query('INSERT INTO brands SET ?', {
      id: newBrand.id,
      brand_name: newBrand.brand_name,
    }, (err, res) => {
      if (err) {
        console.error('Error creating brand:', err);
        result(err, null);
      } else {
        console.log('Created brand:', newBrand);
        result(null, newBrand);
      }
    });
  }

  static getAll(result) {
    db.query('SELECT * FROM brands', (err, rows) => {
      if (err) {
        console.error('Error getting all brands:', err);
        result(err, null);
      } else {
        result(null, rows);
      }
    });
  }
  
  static insertMany(brandsData, result) {
    const createdBrands = [];
    const totalBrands = brandsData.length;

    brandsData.forEach((brandData, index) => {
      const newBrand = new Brand({ brand_name: brandData.brand_name });

      Brand.create(newBrand, (err, createdBrand) => {
        if (err) {
          console.error('Error creating brand:', err);
        } else {
          createdBrands.push(createdBrand);
        }

        if (index === totalBrands - 1) {
          // All brands have been processed
          result(null, createdBrands);
        }
      });
    });
  }

  static findByName(brandName, result) {
    db.query('SELECT * FROM brands WHERE brand_name = ?', [brandName], (err, rows) => {
      if (err) {
        console.error('Error finding brand by name:', err);
        result(err, null);
      } else {
        result(null, rows);
      }
    });
  }

  static deleteById(brandId, result) {
    db.query('DELETE FROM brands WHERE id = ?', [brandId], (err, res) => {
      if (err) {
        console.error('Error deleting brand by id:', err);
        result(err, null);
      } else {
        console.log('Deleted brand with id:', brandId);
        result(null, res.affectedRows > 0);
      }
    });
  }


  static async updateDisplay(ids, displayValue, result) {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    if (idsArray.length === 0) {
      console.error('No brand IDs provided for updating display.');
      return result('No brand IDs provided for updating display.', null);
    }
  
    let connection; 
  
    try {
      connection = await db.promise();
      await connection.beginTransaction();
  
      const [updateResult] = await connection.query(
        'UPDATE brands SET display = ? WHERE id IN (?)',
        [displayValue, idsArray]
      );
      
      if (updateResult.affectedRows > 0) {
        console.log('Updated brand display for IDs:', idsArray);
        await connection.commit();
        return result(null, updateResult);
      } else {
        console.error('No rows were updated.');
        await connection.rollback();
        return result('No rows were updated.', null);
      }
      
      await connection.commit();
  
      // console.log('Updated brand display for IDs:', idsArray);
      return result(null, updateResult);
    } catch (error) {
      if (connection && connection.rollback) {
        await connection.rollback();
      }
  
      console.error('Error updating brand display:', error);
      return result(error, null);
    }
}



}




module.exports = Brand;
