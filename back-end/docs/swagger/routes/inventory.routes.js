/**
 * @swagger
 * components:
 *   schemas:
 *     Inventory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         name:
 *           type: string
 *           description: Name of the inventory shelf
 *         location:
 *           type: string
 *           description: Physical location in the warehouse (e.g., A1, B2, C3)
 *         categoryId:
 *           type: string
 *           description: ID of the category this shelf is designated for
 *         maxQuantitative:
 *           type: number
 *           description: Maximum capacity of the shelf (items)
 *         currentQuantitative:
 *           type: number
 *           default: 0
 *           description: Current number of items on the shelf
 *         maxWeight:
 *           type: number
 *           description: Maximum weight capacity of the shelf (kg)
 *         currentWeight:
 *           type: number
 *           default: 0
 *           description: Current weight on the shelf (kg)
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           description: Shelf status
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product stored on this shelf
 *               quantity:
 *                 type: number
 *                 minimum: 0
 *                 description: Quantity of this product on the shelf
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the shelf was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the shelf was last updated
 *       required:
 *         - name
 *         - categoryId
 *         - maxQuantitative
 *         - maxWeight
 *
 *     AddProductToShelfRequest:
 *       type: object
 *       properties:
 *         inventoryId:
 *           type: string
 *           description: ID of the inventory shelf
 *         productId:
 *           type: string
 *           description: ID of the product to add
 *         quantity:
 *           type: number
 *           minimum: 1
 *           description: Quantity to add
 *         weight:
 *           type: number
 *           minimum: 0.1
 *           description: Weight to add (kg)
 *       required:
 *         - inventoryId
 *         - productId
 *         - quantity
 *
 *     RemoveProductFromShelfRequest:
 *       type: object
 *       properties:
 *         inventoryId:
 *           type: string
 *           description: ID of the inventory shelf
 *         productId:
 *           type: string
 *           description: ID of the product to remove
 *         quantity:
 *           type: number
 *           minimum: 1
 *           description: Quantity to remove
 *       required:
 *         - inventoryId
 *         - productId
 *         - quantity
 */

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management
 */

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get all inventory shelves
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all inventory shelves
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /inventory/add:
 *   post:
 *     summary: Create a new inventory shelf
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               maxQuantitative:
 *                 type: number
 *               maxWeight:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *             required:
 *               - name
 *               - categoryId
 *               - maxQuantitative
 *               - maxWeight
 *     responses:
 *       201:
 *         description: Inventory shelf created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /inventory/add-product:
 *   post:
 *     summary: Add a product to a shelf
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddProductToShelfRequest'
 *     responses:
 *       200:
 *         description: Product added to shelf successfully
 *       400:
 *         description: Invalid request data or shelf capacity exceeded
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shelf or product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /inventory/remove-product:
 *   post:
 *     summary: Remove a product from a shelf
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveProductFromShelfRequest'
 *     responses:
 *       200:
 *         description: Product removed from shelf successfully
 *       400:
 *         description: Invalid request data or insufficient quantity
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shelf or product not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /inventory/import-auto:
 *   post:
 *     summary: Automatically distribute a product to appropriate shelves
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to distribute
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: Quantity to distribute
 *             required:
 *               - productId
 *               - quantity
 *     responses:
 *       200:
 *         description: Product distributed successfully
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
 * /inventory/delete/{id}:
 *   delete:
 *     summary: Delete an inventory shelf
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Inventory shelf ID
 *     responses:
 *       200:
 *         description: Shelf deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shelf not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /inventory/layout:
 *   get:
 *     summary: Get the layout of all inventory shelves
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory layout retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
