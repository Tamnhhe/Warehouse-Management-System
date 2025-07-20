/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       required:
 *         - name
 *         - status
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the supplier.
 *         name:
 *           type: string
 *           description: The name of the supplier (must be unique).
 *         contact:
 *           type: string
 *           description: Contact phone number (unique, 10-15 digits).
 *         email:
 *           type: string
 *           format: email
 *           description: Contact email address (must be unique).
 *         address:
 *           type: string
 *           description: The physical address of the supplier.
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: The operational status of the supplier.
 *       example:
 *         _id: "60d0fe4f5311236168a109ca"
 *         name: "An Khanh Suppliers"
 *         contact: "0987654321"
 *         email: "contact@ankhanh.com"
 *         address: "123 ABC Street, District 1, HCMC"
 *         status: "active"
 *
 *     SupplierProductInfo:
 *       type: object
 *       properties:
 *         supplierProductId:
 *           type: string
 *         productId:
 *           type: string
 *         productName:
 *           type: string
 *         productDescription:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: number
 *         expiry:
 *           type: string
 *           format: date
 *         categoryId:
 *           type: string
 *         categoryName:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *
 *     SupplierWithProductsResponse:
 *       type: object
 *       properties:
 *         supplier:
 *           $ref: '#/components/schemas/Supplier'
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SupplierProductInfo'
 *         stats:
 *           type: object
 *           properties:
 *             totalProducts:
 *               type: number
 *             totalStock:
 *               type: number
 *             avgPrice:
 *               type: number
 *             totalValue:
 *               type: number
 */

/**
 * @swagger
 * /suppliers/getAllSuppliers:
 *   get:
 *     summary: Get a summarized list of suppliers (searchable)
 *     tags: [Suppliers]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Name of the supplier to search for (case-insensitive).
 *     responses:
 *       '200':
 *         description: A summarized list of suppliers containing only _id, name, and status.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   status:
 *                     type: string
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /suppliers/get-list-suppliers:
 *   get:
 *     summary: Get a full list of all suppliers
 *     tags: [Suppliers]
 *     description: This endpoint retrieves the complete details for all suppliers, wrapped in a response object.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of suppliers.
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
 *                     $ref: '#/components/schemas/Supplier'
 *                 total:
 *                   type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /suppliers/getSupplierWithProducts/{id}:
 *   get:
 *     summary: Get supplier details along with their product list and stats
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the supplier.
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         default: false
 *         description: "Set to `true` to include products with an 'inactive' status."
 *     responses:
 *       '200':
 *         description: Detailed supplier information, product list, and statistics.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplierWithProductsResponse'
 *       '404':
 *         description: Supplier not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /suppliers/getSupplierById/{id}:
 *   get:
 *     summary: Get a single supplier by ID
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the supplier.
 *     responses:
 *       '200':
 *         description: Detailed information for the supplier.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supplier'
 *       '404':
 *         description: Supplier not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /suppliers/getSupplierProducts/{supplierId}:
 *   get:
 *     summary: Get the product list for a single supplier
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the supplier.
 *     responses:
 *       '200':
 *         description: A list of products offered by this supplier.
 *       '404':
 *         description: No products found for this supplier.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /suppliers/addSupplier:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *           example:
 *             name: "Clean Foods Inc."
 *             contact: "0912345678"
 *             email: "info@cleanfoods.com"
 *             address: "Tan Binh Industrial Park, HCMC"
 *             status: "active"
 *     responses:
 *       '201':
 *         description: Supplier created successfully.
 *       '400':
 *         description: Invalid data (e.g., missing name, duplicate name/email/contact, incorrect format).
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /suppliers/updateSupplier/{id}:
 *   put:
 *     summary: Update a supplier's information
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the supplier to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       '200':
 *         description: Updated successfully.
 *       '400':
 *         description: Invalid data (e.g., duplicate name/email/contact, incorrect format).
 *       '404':
 *         description: Supplier not found.
 *       '500':
 *         description: Server error.
 */

/**
 * @swagger
 * /suppliers/update-status/{id}:
 *   put:
 *     summary: Update a supplier's status
 *     tags: [Suppliers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the supplier.
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
 *                 description: The new status for the supplier.
 *             required:
 *               - status
 *     responses:
 *       '200':
 *         description: Status changed successfully.
 *       '404':
 *         description: Supplier not found.
 *       '500':
 *         description: Server error.
 */
