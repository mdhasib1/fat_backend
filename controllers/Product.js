const Product = require('../models/Product');



function generateSKU(brand) {
  if (typeof brand === 'string' && brand.length >= 3) {
    const brandInitials = brand.substring(0, 3).toUpperCase();
    const uniqueIdentifier = Math.floor(Math.random() * 10000);
    const sku = `${brandInitials}-${uniqueIdentifier}`;
    return sku;
  } else {
    throw new Error('Invalid brand name provided');
  }
}

exports.createProduct = async (req, res) => {
  const newProductData = req.body;
  console.log(newProductData)
  const variants = newProductData.variants || [];

  if (!Array.isArray(variants)) {
    return res.status(400).json({ error: 'Variants should be an array' });
  }

  try {
    const newProduct = new Product({
      title: newProductData.title,
      description: newProductData.description,
      brand: newProductData.brand,
      display: newProductData.display,
      shape: newProductData.shape,
      size: newProductData.size,
      strength: newProductData.strength,
      wrapper: newProductData.wrapper,
      binder: newProductData.binder,
      filler: newProductData.filler,
      grade: newProductData.grade,
      blender: newProductData.blender,
      sku: generateSKU(newProductData.brand),
      country_of_origin: newProductData.country_of_origin,
      images: newProductData.images,
      variants: variants,
    });

    Product.create(newProduct, (err, product) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json(product);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};




// Get all products
exports.getAllProducts = (req, res) => {
  Product.getAll((err, products) => {
    if (err) {
      console.error('Error getting all products:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Ensure products is an array
    if (!Array.isArray(products)) {
      console.error('Invalid products data:', products);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(products);
  });
};
// Get product by ID
exports.getProductById = (req, res) => {
  const productId = req.params.id;
  Product.findById(productId, (err, product) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
};

// Delete product by ID
exports.deleteProductById = (req, res) => {
  const productId = req.params.id;
  Product.deleteById(productId, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
};


exports.updateProduct = (req, res) => {
  const id = req.params.id;
  const updatedProductData = req.body;

  Product.findById(id, (err, existingProduct) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update only the fields that exist in updatedProductData
    Object.keys(updatedProductData).forEach((key) => {
      if (updatedProductData[key] !== undefined) {
        existingProduct[key] = updatedProductData[key];
      }
    });

    Product.updateById(id, existingProduct, (updateErr, updatedProduct) => {
      if (updateErr) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.json(updatedProduct);
    });
  });
};



exports.updateProductVariantStockById = (req, res) => {
  const { id, variantId } = req.params;
  const { stock } = req.body;

  Product.updateVariantStockById(id, variantId, stock, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product variant not found' });
    }

    res.json({ message: 'Product variant stock updated successfully' });
  });
};


exports.updateDisplay = async (req, res) => {
  const { ids, display } = req.body;

  try {
    await Product.updateDisplay(ids, display, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating display' });
      }
      return res.status(200).json({ message: 'Display updated successfully' });
    });
  } catch (error) {
    console.error('Error updating display:', error);
    return res.status(500).json({ error: 'Error updating display' });
  }
};