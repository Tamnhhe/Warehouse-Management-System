/**
 * @swagger
 * components:
 *   schemas:
 *     SupplierProduct:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the supplier product record.
 *         supplier:
 *           type: string
 *           description: The ID of the supplier.
 *         stock:
 *           type: number
 *           description: The stock quantity of this product from this supplier.
 *         expiry:
 *           type: string
 *           format: date
 *           description: The expiration date of the product batch.
 *         categoryId:
 *           type: string
 *           description: The ID of the product's category.
 *         productImage:
 *           type: string
 *           description: URL of the product's image.
 *         productName:
 *           type: string
 *           description: The name of the product.
 *         quantitative:
 *           type: number
 *           description: The quantitative measure of the product (e.g., 100, 250).
 *         unit:
 *           type: string
 *           description: The unit of measurement (e.g., grams, ml, pcs).
 *       example:
 *         _id: "61e1a3b4c5d6e7f8g9h0i1j2"
 *         supplier: "60d0fe4f5311236168a109ca"
 *         stock: 150
 *         expiry: "2026-12-31T00:00:00.000Z"
 *         categoryId: "60c72b2f5f1b2c001f8e4d3a"
 *         productImage: "http://example.com/images/product.jpg"
 *         productName: "Kobe Beef"
 *         quantitative: 500
 *         unit: "gram"
 */

/**
 * @swagger
 * /supplier-products/getAllSupplierProducts:
 *   get:
 *     summary: Get all products from every supplier
 *     tags: [SupplierProducts]
 *     responses:
 *       '200':
 *         description: A list of all products from all suppliers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SupplierProduct'
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /supplier-products/supplier/{supplierId}/products:
 *   get:
 *     summary: Get a list of products for a specific supplier
 *     tags: [SupplierProducts]
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the supplier.
 *     responses:
 *       '200':
 *         description: A list of products for the selected supplier.
 *       '400':
 *         description: Invalid supplier ID.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /supplier-products/create:
 *   post:
 *     summary: Create a new supplier product
 *     tags: [SupplierProducts]
 *     description: This API creates a record for a product sold by a supplier. If the product name does not exist in the main `products` table, a new product record will be created there as well.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplier
 *               - stock
 *               - productImage
 *               - productName
 *               - quantitative
 *               - unit
 *             properties:
 *               supplier:
 *                 type: string
 *               stock:
 *                 type: number
 *               expiry:
 *                 type: string
 *                 format: date
 *               categoryId:
 *                 type: string
 *               productImage:
 *                 type: string
 *               productName:
 *                 type: string
 *               quantitative:
 *                 type: number
 *               unit:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created successfully.
 *       '400':
 *         description: Invalid data or missing required fields.
 */

/**
 * @swagger
 * /supplier-products/update/{id}:
 *   put:
 *     summary: Update a supplier product's information
 *     tags: [SupplierProducts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the 'Supplier Product' record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplier:
 *                 type: string
 *               stock:
 *                 type: number
 *               expiry:
 *                 type: string
 *                 format: date
 *               categoryId:
 *                 type: string
 *               productImage:
 *                 type: string
 *               productName:
 *                 type: string
 *               quantitative:
 *                 type: number
 *               unit:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Updated successfully.
 *       '400':
 *         description: Invalid data.
 *       '404':
 *         description: Supplier product not found.
 */

/**
 * @swagger
 * /supplier-products/delete/{id}:
 *   delete:
 *     summary: Delete a supplier product
 *     tags: [SupplierProducts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the 'Supplier Product' record to delete.
 *     responses:
 *       '200':
 *         description: Deleted successfully.
 *       '404':
 *         description: Product not found.
 *       '500':
 *         description: Server error.
 */
