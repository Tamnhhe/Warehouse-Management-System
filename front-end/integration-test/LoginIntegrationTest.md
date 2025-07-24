# Integration Test Document - Login Functionality

## Feature: Login
**Test requirement:** The screen allows users to log in using email and password. After successful login, users are redirected to the product dashboard based on their role (Manager or Employee).

**Number of TCs:** 10

## Testing Rounds Summary
| Testing Round | Passed | Failed | Pending | N/A |
|---------------|--------|--------|---------|-----|
| Round 1       | 0      | 0      | 10      | 0   |
| Round 2       | 0      | 0      | 10      | 0   |
| Round 3       | 0      | 0      | 10      | 0   |

## Test Cases

| Test Case ID | Test Case Description | Test Case Procedure | Expected Results | Pre-conditions | Round 1 | Test date | Tester | Round 2 | Test date | Tester | Round 3 | Test date | Tester | Note |
|--------------|----------------------|---------------------|------------------|----------------|---------|-----------|--------|---------|-----------|--------|---------|-----------|--------|------|
| LOGIN_001 | Test basic login with valid manager credentials | "1. Navigate to the login page (http://localhost:3000/login)<br>2. Enter valid manager email<br>3. Enter valid password<br>4. Click ""Đăng nhập"" button" | "1. User should be successfully logged in<br>2. Success message ""Đăng nhập thành công! Chuyển hướng..."" should appear<br>3. User should be redirected to the product dashboard (/product)<br>4. JWT token should be stored in localStorage" | "1. System must be accessible<br>2. Manager account must exist in the system with status 'active'" | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | |
| LOGIN_002 | Test basic login with valid employee credentials | "1. Navigate to the login page (http://localhost:3000/login)<br>2. Enter valid employee email<br>3. Enter valid password<br>4. Click ""Đăng nhập"" button" | "1. User should be successfully logged in<br>2. Success message ""Đăng nhập thành công! Chuyển hướng..."" should appear<br>3. User should be redirected to the product dashboard (/product)<br>4. JWT token should be stored in localStorage" | "1. System must be accessible<br>2. Employee account must exist in the system with status 'active'" | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | |
| LOGIN_003 | Test login with non-existent email | "1. Navigate to the login page<br>2. Enter non-existent email (e.g., nonexistent@company.com)<br>3. Enter any password<br>4. Click ""Đăng nhập"" button" | "1. System should display error message: ""Tài khoản không tồn tại""<br>2. User should remain on the login page<br>3. No token should be stored" | "System must be accessible" | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | |
| LOGIN_004 | Test login with incorrect password | "1. Navigate to the login page<br>2. Enter valid email<br>3. Enter incorrect password<br>4. Click ""Đăng nhập"" button" | "1. System should display error message: ""Sai mật khẩu!""<br>2. User should remain on the login page<br>3. No token should be stored" | "- System must be accessible<br>- Account must exist in the system" | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | |
| LOGIN_005 | Test login with empty fields | "1. Navigate to the login page<br>2. Leave email and password fields empty<br>3. Click ""Đăng nhập"" button" | "1. Browser should display HTML5 validation messages<br>2. Form should not be submitted<br>3. User should remain on the login page" | "System must be accessible" | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | |
| LOGIN_006 | Test login with inactive account | "1. Navigate to the login page<br>2. Enter email of inactive account<br>3. Enter correct password<br>4. Click ""Đăng nhập"" button" | "1. System should display error message: ""Vui lòng xác minh tài khoản của bạn!""<br>2. User should remain on the login page<br>3. No token should be stored" | "- System must be accessible<br>- Inactive account must exist in the system" | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | |
| LOGIN_007 | Test login with banned account | "1. Navigate to the login page<br>2. Enter email of banned account<br>3. Enter correct password<br>4. Click ""Đăng nhập"" button" | "1. System should display error message: ""Tài khoản của bạn đã bị cấm đăng nhập""<br>2. User should remain on the login page<br>3. No token should be stored" | "- System must be accessible<br>- Banned account must exist in the system" | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | |
| LOGIN_008 | Test login with invalid email format | "1. Navigate to the login page<br>2. Enter email with invalid format (e.g., invalid-email)<br>3. Enter password<br>4. Click ""Đăng nhập"" button" | "1. Browser should display HTML5 validation message for invalid email format<br>2. Form should not be submitted<br>3. User should remain on the login page" | "System must be accessible" | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | |
| LOGIN_009 | Test "Quên mật khẩu?" link functionality | "1. Navigate to the login page<br>2. Click ""Quên mật khẩu?"" link" | "1. User should be redirected to forgot password page (/forgot-password)<br>2. Forgot password form should be displayed" | "System must be accessible" | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | |
| LOGIN_010 | Test login form responsiveness and animations | "1. Navigate to the login page<br>2. Resize browser window to mobile size<br>3. Verify form layout<br>4. Enter credentials and submit<br>5. Observe animation effects" | "1. Form should be responsive on mobile devices<br>2. Image column should be hidden on mobile<br>3. Form animations should work properly<br>4. Hover effects on login button should work<br>5. Error/success alerts should have proper animations" | "System must be accessible" | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | Pending | 24/07/2025 | HoangMN | |

## Test Environment Setup

### Backend Requirements:
1. Ensure backend server is running on `http://localhost:9999`
2. Database should have test user accounts with different statuses:
   - Active manager account
   - Active employee account  
   - Inactive account
   - Banned account

### Frontend Requirements:
1. Frontend development server should be running on `http://localhost:3000`
2. All dependencies should be installed

### Test Data Setup:
Create the following test accounts in the database:
```json
{
  "manager_active": {
    "email": "manager@company.com",
    "password": "password123",
    "role": "manager",
    "status": "active"
  },
  "employee_active": {
    "email": "employee@company.com", 
    "password": "password123",
    "role": "employee",
    "status": "active"
  },
  "user_inactive": {
    "email": "inactive@company.com",
    "password": "password123",
    "role": "employee", 
    "status": "inactive"
  },
  "user_banned": {
    "email": "banned@company.com",
    "password": "password123",
    "role": "employee",
    "status": "banned"
  }
}
```

## How to Run Tests

### Prerequisites:
1. Install dependencies:
   ```bash
   cd front-end
   npm install
   ```

2. Start backend server:
   ```bash
   cd back-end
   npm start
   ```

3. Start frontend development server:
   ```bash
   cd front-end
   npm run dev
   ```

### Manual Testing Steps:
1. Open browser and navigate to `http://localhost:3000/login`
2. Follow each test case procedure step by step
3. Verify expected results match actual results
4. Record test results in the table above
5. Take screenshots for failed test cases

### Automated Testing (Optional):
If implementing automated tests, consider using:
- **Cypress** for end-to-end testing
- **Jest + React Testing Library** for component testing
- **Supertest** for API testing

## Notes:
- All error messages should be displayed in Vietnamese as per the system design
- JWT tokens have 30-day expiration
- Successful login redirects to `/product` page
- Form includes client-side validation for required fields and email format
- UI includes animations and responsive design features