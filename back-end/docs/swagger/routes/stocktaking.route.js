/**
 * @swagger
 * components:
 *   schemas:
 *     StocktakingProduct:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *           description: The ID of the product being checked.
 *         systemQuantity:
 *           type: number
 *           description: The quantity recorded in the system before the check.
 *         actualQuantity:
 *           type: number
 *           description: The actual physical quantity counted. Can be null for pending tasks.
 *         difference:
 *           type: number
 *           description: The difference between actual and system quantity. Can be null for pending tasks.
 *
 *     StocktakingTask:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         inventoryId:
 *           type: string
 *           description: The ID of the inventory (shelf) being checked.
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StocktakingProduct'
 *         auditor:
 *           type: string
 *           description: The ID of the user who performed the audit.
 *         status:
 *           type: string
 *           enum: [pending, completed]
 *           description: The status of the stocktaking task.
 *         checkedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the task was completed.
 *         adjustmentId:
 *           type: string
 *           description: The ID of the adjustment document, if one was created.
 *
 *     AdjustmentProduct:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         oldQuantity:
 *           type: number
 *         newQuantity:
 *           type: number
 *         difference:
 *           type: number
 *
 *     Adjustment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         stocktakingTaskId:
 *           type: string
 *         inventoryId:
 *           type: string
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdjustmentProduct'
 *         createdBy:
 *           type: string
 *           description: The ID of the user who created the adjustment.
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /stocktaking/create:
 *   post:
 *     summary: Create a completed stocktaking task
 *     tags: [Stocktaking]
 *     description: Directly create a stocktaking task with final, counted quantities.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [inventoryId, products, auditor]
 *             properties:
 *               inventoryId:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     actualQuantity:
 *                       type: number
 *               auditor:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Stocktaking task created successfully.
 *       '400':
 *         description: Missing required information.
 *       '404':
 *         description: Inventory not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /stocktaking/create-pending:
 *   post:
 *     summary: Create a pending stocktaking task
 *     tags: [Stocktaking]
 *     description: Creates a task to be completed later. Only specifies which products to check.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [inventoryId, productIds, auditor]
 *             properties:
 *               inventoryId:
 *                 type: string
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of product IDs to be checked.
 *               auditor:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Pending stocktaking task created successfully.
 *       '400':
 *         description: Missing required information.
 *       '404':
 *         description: Inventory not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /stocktaking/update/{id}:
 *   put:
 *     summary: Update and complete a pending stocktaking task
 *     tags: [Stocktaking]
 *     description: Submits the actual counted quantities for a pending task, marking it as 'completed'.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the pending stocktaking task.
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
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     actualQuantity:
 *                       type: number
 *     responses:
 *       '200':
 *         description: Stocktaking task updated successfully.
 *       '400':
 *         description: Task is already completed.
 *       '404':
 *         description: Stocktaking task not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /stocktaking/adjustment:
 *   post:
 *     summary: Create an inventory adjustment from a completed task
 *     tags: [Stocktaking]
 *     description: Compares the system and actual quantities in a completed task. If there's a difference, it creates an adjustment record and updates the inventory.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stocktakingTaskId, createdBy]
 *             properties:
 *               stocktakingTaskId:
 *                 type: string
 *               createdBy:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Adjustment created successfully.
 *       '200':
 *         description: No discrepancies found, no adjustment needed.
 *       '400':
 *         description: The stocktaking task is not yet completed.
 *       '404':
 *         description: Stocktaking task not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /stocktaking/history:
 *   get:
 *     summary: Get stocktaking history
 *     tags: [Stocktaking]
 *     responses:
 *       '200':
 *         description: A list of all stocktaking tasks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StocktakingTask'
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /stocktaking/adjustment-history:
 *   get:
 *     summary: Get inventory adjustment history
 *     tags: [Stocktaking]
 *     responses:
 *       '200':
 *         description: A list of all inventory adjustments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Adjustment'
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /stocktaking/detail/{id}:
 *   get:
 *     summary: Get the details of a specific stocktaking task
 *     tags: [Stocktaking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the stocktaking task.
 *     responses:
 *       '200':
 *         description: Detailed information about the stocktaking task.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StocktakingTask'
 *       '404':
 *         description: Stocktaking task not found.
 *       '500':
 *         description: Server error.
 */
