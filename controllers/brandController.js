const Brand = require('../models/Brand');
const csv = require("csvtojson");
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const csvFilter = (req, file, cb) => {
  if (file.mimetype.includes("csv")) {
    cb(null, true);
  } else {
    cb("Please upload only csv file.", false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-paw-${file.originalname}`);
  },
});

const maxSize = 200 * 1024 * 1024;

exports.uploadFile = multer({ storage: storage, fileFilter: csvFilter ,   limits: { fileSize: maxSize },
}).single(
  "file"
);

exports.uploadbrands = (req, res) => {
  csv()
  .fromFile(req.file.path)
  .then((csvData) => {
    Brand.insertMany(csvData, (err, data) => {
      if (err) {
      } else {
        res.send("Data Improt Success");
      }
    });
  });
};






// Get all brands
exports.getAllBrands = async(req, res) => {
  Brand.getAll((err, brands) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(200).json(brands);
  });
};

// Get a brand by ID
exports.getBrandById = async(req, res) => {
  const { id } = req.params;
  Brand.findById(id, (err, brand) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.status(200).json(brand);
  });
};

// Create a new brand
exports.createBrand = async(req, res) => {
  const newBrandData = req.body;
  const newBrand = new Brand(newBrandData);

  Brand.create(newBrand, (err, createdBrand) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(201).json(createdBrand);
  });
};

// Update a brand by ID
exports.updateBrand = async(req, res) => {
  const { id } = req.params;
  const updatedBrandData = req.body;

  Brand.updateById(id, updatedBrandData, (err, updatedBrand) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!updatedBrand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.status(200).json(updatedBrand);
  });
};

// Delete a brand by ID
exports.deleteBrand = async(req, res) => {
  const { id } = req.params;

  Brand.deleteById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!result) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.status(204).send();
  });
};


exports.updateDisplay = async (req, res) => {
  const { ids, display } = req.body;

  try {
    await Brand.updateDisplay(ids, display, (err, result) => {
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