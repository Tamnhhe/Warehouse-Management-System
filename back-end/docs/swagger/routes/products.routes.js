/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         productName:
 *           type: string
 *           description: Name of the product
 *         categoryId:
 *           type: string
 *           description: ID of the category this product belongs to
 *         thresholdStock:
 *           type: number
 *           description: Threshold for stock alerts
 *         productImage:
 *           type: string
 *           description: URL to product image
 *         unit:
 *           type: string
 *           description: Unit of measurement (e.g., kg, piece)
 *         location:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               inventoryId:
 *                 type: string
 *                 description: ID of the inventory shelf
 *               stock:
 *                 type: number
 *                 description: Stock quantity in this location
 *                 default: 0
 *         quantitative:
 *           type: number
 *           default: 1
 *           description: Quantitative measurement value
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           description: Product status
 *       required:
 *         - productName
 *         - categoryId
 *         - thresholdStock
 *         - productImage
 *         - unit
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /products/getAllProducts:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /products/getProductById/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /products/createProduct:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               thresholdStock:
 *                 type: number
 *               productImage:
 *                 type: string
 *                 format: binary
 *               unit:
 *                 type: string
 *               location:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     inventoryId:
 *                       type: string
 *                     stock:
 *                       type: number
 *               quantitative:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *             required:
 *               - productName
 *               - categoryId
 *               - thresholdStock
 *               - productImage
 *               - unit
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /products/updateProduct/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               thresholdStock:
 *                 type: number
 *               productImage:
 *                 type: string
 *                 format: binary
 *               unit:
 *                 type: string
 *               location:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     inventoryId:
 *                       type: string
 *                     stock:
 *                       type: number
 *               quantitative:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /products/inactivateProduct/{id}:
 *   put:
 *     summary: Activate or deactivate a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
