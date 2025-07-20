/**
 * @swagger
 * components:
 *   schemas:
 *     TransactionProduct:
 *       type: object
 *       properties:
 *         supplierProductId:
 *           type: string
 *           description: The ID of the specific product from the supplier.
 *         requestQuantity:
 *           type: number
 *           description: The quantity of the product requested.
 *         receiveQuantity:
 *           type: number
 *           description: The quantity of the product physically received.
 *         defectiveProduct:
 *           type: number
 *           description: The quantity of the product that was defective.
 *         achievedProduct:
 *           type: number
 *           description: The final quantity of usable product (receive - defective).
 *         price:
 *           type: number
 *           description: The price per unit for this product in this transaction.
 *         expiry:
 *           type: string
 *           format: date
 *           description: The expiration date for this batch of products.
 *
 *     InventoryTransaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         supplier:
 *           type: string
 *           description: The ID of the supplier associated with the transaction.
 *         transactionType:
 *           type: string
 *           enum: [import, export]
 *           description: The type of the transaction.
 *         transactionDate:
 *           type: string
 *           format: date-time
 *           description: The date the transaction occurred.
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TransactionProduct'
 *         operator:
 *           type: string
 *           description: The ID of the user who handled the transaction.
 *         totalPrice:
 *           type: number
 *           description: The calculated total price for the transaction.
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *           description: The status of the transaction.
 *         branch:
 *           type: string
 *           description: The branch where the transaction took place.
 *
 *     ReceiptProductInput:
 *       type: object
 *       required: [productName, categoryName, quantity, price]
 *       properties:
 *         productName:
 *           type: string
 *         categoryName:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *
 *     ReceiptInput:
 *       type: object
 *       required: [supplierName, products]
 *       properties:
 *         supplierName:
 *           type: string
 *           description: The exact name of the supplier.
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReceiptProductInput'
 */

/**
 * @swagger
 * /inventory-transactions/getAllTransactions:
 *   get:
 *     summary: Get all InventoryTransaction
 *     tags: [InventoryTransaction]
 *     responses:
 *       '200':
 *         description: A list of all InventoryTransaction.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryTransaction'
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /inventory-transactions/getTransactionById/{id}:
 *   get:
 *     summary: Get a single transaction by ID
 *     tags: [InventoryTransaction]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction.
 *     responses:
 *       '200':
 *         description: Detailed information for the transaction.
 *       '404':
 *         description: Transaction not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /inventory-transactions/updateTransaction/{id}:
 *   put:
 *     summary: Update product details within a transaction
 *     tags: [InventoryTransaction]
 *     description: Updates the quantities, prices, etc., of products within a specific transaction. Also recalculates the total price.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TransactionProduct'
 *     responses:
 *       '200':
 *         description: Transaction updated successfully.
 *       '400':
 *         description: Invalid transaction ID or no valid products to update.
 *       '404':
 *         description: Transaction or products not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /inventory-transactions/updateTransactionStatus/{id}:
 *   put:
 *     summary: Update the status of a transaction
 *     tags: [InventoryTransaction]
 *     description: Updates the status of a transaction (e.g., from 'pending' to 'completed'). If the status is set to 'completed', the system will update the main stock levels for the affected products.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the transaction.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *     responses:
 *       '200':
 *         description: Status updated successfully.
 *       '404':
 *         description: Transaction not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /inventory-transactions/createTransaction:
 *   post:
 *     summary: Create a new inventory transaction
 *     tags: [InventoryTransaction]
 *     description: Creates a generic import or export transaction record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryTransaction'
 *     responses:
 *       '201':
 *         description: Transaction created successfully.
 *       '400':
 *         description: Missing required fields or manager not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /inventory-transactions/create-receipts:
 *   post:
 *     summary: Create an import receipt from simplified data
 *     tags: [InventoryTransaction]
 *     description: A high-level endpoint to create an import receipt. The system finds the supplier, products, and categories by name, creates/updates supplier-product relationships, and then generates a formal inventory transaction.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReceiptInput'
 *     responses:
 *       '201':
 *         description: Receipt created successfully.
 *       '400':
 *         description: Invalid data, or a required item (supplier, category, product) was not found in the system.
 *       '500':
 *         description: Server error.
 */
