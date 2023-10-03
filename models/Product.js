const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Product {
  constructor(productData) {
    this.id = uuidv4();
    this.title = productData.title || '';
    this.description = productData.description || '';
    this.brand = productData.brand || '';
    this.display = true; 
    this.shape = productData.shape || '';
    this.size = productData.size || '';
    this.strength = productData.strength || '';
    this.wrapper = productData.wrapper || '';
    this.binder = productData.binder || '';
    this.filler = productData.filler || '';
    this.grade = productData.grade || '';
    this.blender = productData.blender || '';
    this.sku = productData.sku || '';
    this.country_of_origin = productData.country_of_origin || '';
    this.images = productData.images || [];

    if (productData.variants) {
      this.variants = productData.variants.map((variant) => ({
        id: uuidv4(),
        product_id: this.id,
        packageqty: variant.packageqty || '',
        packagetype: variant.packagetype || '',
        oldPrice: variant.oldPrice,
        currentPrice: variant.currentPrice || null, 
        stock: variant.stock || 0,
      }));
    } else {
      this.variants = null;
    }
  }

  static create(newProduct, result) {
    db.query('INSERT INTO products SET ?', {
      id: newProduct.id,
      title: newProduct.title,
      description: newProduct.description,
      brand: newProduct.brand,
      display: newProduct.display,
      shape:newProduct.shape,
      size:newProduct.size,
      strength:newProduct.strength,
      wrapper:newProduct.wrapper,
      binder:newProduct.binder,
      filler:newProduct.filler,
      grade:newProduct.grade,
      blender:newProduct.blender,
      sku:newProduct.sku,
      country_of_origin:newProduct.country_of_origin,
      images: JSON.stringify(newProduct.images),
    }, (err, res) => {
      if (err) {
        console.error('Error creating product:', err);
        result(err, null);
      } else {
        console.log('Created product:', newProduct);
        result(null, newProduct);
      }
    });

    if (newProduct.variants) {
      newProduct.variants.forEach((variant) => {
        db.query('INSERT INTO product_variants SET ?', variant, (err, res) => {
          if (err) {
            console.error('Error creating product variant:', err);
          } else {
            console.log('Created product variant:', variant);
          }
        });
      });
    }
  }

  static async updateDisplay(ids, displayValue, result) {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    if (idsArray.length === 0) {
      console.error('No product IDs provided for updating display.');
      return result('No product IDs provided for updating display.', null);
    }
  
    let connection; 
  
    try {
      connection = await db.promise();
      await connection.beginTransaction();
  
      const [updateResult] = await connection.query(
        'UPDATE products SET display = ? WHERE id IN (?)',
        [displayValue, idsArray]
      );
      
      if (updateResult.affectedRows > 0) {
        console.log('Updated product display for IDs:', idsArray);
        await connection.commit();
        return result(null, updateResult);
      } else {
        console.error('No rows were updated.');
        await connection.rollback();
        return result('No rows were updated.', null);
      }
      
      await connection.commit();
  
      console.log('Updated product display for IDs:', idsArray);
      return result(null, updateResult);
    } catch (error) {
      if (connection && connection.rollback) {
        await connection.rollback();
      }
  
      console.error('Error updating product display:', error);
      return result(error, null);
    }
}

  
  


  static findById(productId, result) {
    db.query('SELECT * FROM products WHERE id = ?', [productId], (err, res) => {
      if (err) {
        console.error('Error finding product by ID:', err);
        result(err, null);
      } else {
        if (res.length > 0) {
          const product = { ...res[0] };
          db.query('SELECT * FROM product_variants WHERE product_id = ?', [productId], (err, variantRes) => {
            if (err) {
              console.error('Error retrieving product variants:', err);
              result(err, null);
            } else {
              const variants = [];
              variantRes.forEach((row) => {
                variants.push({
                  id: row.id,
                  packageqty: row.packageqty,
                  packagetype: row.packagetype,
                  oldPrice: row.oldPrice,
                  currentPrice: row.currentPrice,
                  stock: row.stock,
                  outstock:row.outstock
                });
              });
              product.variants = variants;
  
              result(null, product);
            }
          });
        } else {
          result(null, null);
        }
      }
    });
  }
  

  static getAll(result) {
    db.query(
      'SELECT products.*, product_variants.id AS variant_id, ' +
      'product_variants.packageType, product_variants.packageqty, product_variants.oldPrice, ' +
      'product_variants.currentPrice, product_variants.stock, ' +
      'product_variants.outstock ' + 
      'FROM products ' +
      'LEFT JOIN product_variants ON products.id = product_variants.product_id ' +
      'GROUP BY products.id, variant_id',
      (err, res) => {
        if (err) {
          console.error('Error getting all products:', err);
          result(err, null);
        } else {
          const productsWithVariants = [];
          let currentProduct = null;
  
          res.forEach((row) => {
            if (!currentProduct || currentProduct.id !== row.id) {
              currentProduct = {
                ...row,
                variants: [],
              };
              productsWithVariants.push(currentProduct);
            }
  
            if (row.variant_id) {
              currentProduct.variants.push({
                id: row.variant_id,
                packageType: row.packageType,
                packageqty: row.packageqty,
                oldPrice: row.oldPrice,
                currentPrice: row.currentPrice,
                stock: row.stock,
                outstock: row.outstock,  
              });
            }
          });
  
          result(null, productsWithVariants);
        }
      }
    );
  }
  
  

  static deleteById(productId, result) {
    db.query('DELETE FROM product_variants WHERE product_id = ?', productId, (err, res) => {
      if (err) {
        console.error('Error deleting product variants by product ID:', err);
        result(err, null);
      } else {
        db.query('DELETE FROM products WHERE id = ?', productId, (err, res) => {
          if (err) {
            console.error('Error deleting product by ID:', err);
            result(err, null);
          } else {
            console.log('Deleted product with ID:', productId);
            result(null, res);
          }
        });
      }
    });
  }



  static updateVariantStockById(id, variantId, updatedStock, result) {
    let outstock = updatedStock > 0 ? 'instock' : 'outofstock';
    console.log(outstock)
    db.query(
      'UPDATE product_variants SET stock = ?, outstock = ? WHERE id = ? AND product_id = ?',
      [updatedStock, outstock, variantId, id],
      (err, res) => {
        if (err) {
          console.error('Error updating product variant stock by ID:', err);
          result(err, null);
        } else {
          console.log('Updated product variant stock with ID:', variantId);
          result(null, res);
        }
      }
    );
  }
  
  
  

 static updateById(id, updatedProduct, result) {
  const { images, variants, ...productData } = updatedProduct;

  productData.images = JSON.stringify(images);
  db.query('UPDATE products SET ? WHERE id = ?', [productData, id], (err, res) => {
    if (err) {
      console.error('Error updating product by ID:', err);
      result(err, null);
    } else {
      console.log('Updated product with ID:', id);
      result(null, updatedProduct);
    }
  });
}

  
  
}

module.exports = Product;
