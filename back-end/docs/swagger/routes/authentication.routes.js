/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID of the user
 *         fullName:
 *           type: string
 *           description: Full name of the user
 *         account:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: Email address of the user
 *             password:
 *               type: string
 *               format: password
 *               description: Password for authentication (hashed)
 *         profile:
 *           type: object
 *           properties:
 *             phoneNumber:
 *               type: string
 *               description: User's phone number
 *             avatar:
 *               type: string
 *               description: URL to user's avatar image
 *             dob:
 *               type: string
 *               format: date
 *               description: Date of birth
 *             address:
 *               type: string
 *               description: User's address
 *             gender:
 *               type: string
 *               enum: [male, female]
 *               description: User's gender
 *             idCard:
 *               type: number
 *               description: ID card number (required for employees and managers)
 *         salary:
 *           type: number
 *           description: Salary (required for employees and managers)
 *         role:
 *           type: string
 *           enum: [manager, employee, customer]
 *           default: customer
 *           description: Role of the user in the system
 *         type:
 *           type: string
 *           enum: [fulltime, parttime]
 *           default: parttime
 *           description: Employment type for employees
 *         schedule:
 *           type: object
 *           properties:
 *             workDays:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *               description: Days of the week the employee works
 *             shifts:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [Morning, Afternoon, Evening]
 *               description: Shifts for part-time employees
 *             startTime:
 *               type: string
 *               description: Start time for full-time employees
 *             endTime:
 *               type: string
 *               description: End time for full-time employees
 *         status:
 *           type: string
 *           enum: [active, inactive, banned]
 *           default: inactive
 *           description: Current status of the user account
 *       required:
 *         - fullName
 *         - account
 *         - role
 *         - status
 *
 *     LoginCredentials:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: Email for login
 *         password:
 *           type: string
 *           format: password
 *           description: Password for login
 *       required:
 *         - email
 *         - password
 *
 *     RefreshToken:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Refresh token for obtaining new access token
 *       required:
 *         - refreshToken
 *
 *     ResetPasswordRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email address for password reset
 *       required:
 *         - email
 *
 *     NewPasswordRequest:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           format: password
 *           description: New password
 *         confirmPassword:
 *           type: string
 *           format: password
 *           description: Confirm new password
 *       required:
 *         - password
 *         - confirmPassword
 *
 *     RegisterRequest:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         password:
 *           type: string
 *           format: password
 *           description: Password
 *         confirmPassword:
 *           type: string
 *           format: password
 *           description: Confirm password
 *         role:
 *           type: string
 *           enum: [manager, employee, customer]
 *           default: customer
 *           description: User role
 *       required:
 *         - fullName
 *         - email
 *         - password
 *         - confirmPassword
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication operations
 */

/**
 * @swagger
 * /authentication/login:
 *   post:
 *     summary: Log in to the system
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /authentication/new-register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful, verification email sent
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /authentication/verify-email/{id}/{token}:
 *   get:
 *     summary: Verify email using token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /authentication/refresh:
 *   post:
 *     summary: Get a new access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshToken'
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New JWT access token
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /authentication/logout:
 *   post:
 *     summary: Log out from the system
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshToken'
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /authentication/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /authentication/reset-password/{id}/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or passwords don't match
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /authentication/verify/{token}:
 *   post:
 *     summary: Verify account using token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Verification token
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /authentication/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful, verification email sent
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /authentication:
 *   get:
 *     summary: Test authentication route
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication route is working
 */
