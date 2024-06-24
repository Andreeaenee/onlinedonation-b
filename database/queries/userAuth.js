const addUserQuery = `INSERT INTO "user" (user_type_id, email, password, status_id) VALUES ($1, $2, $3, $4) returning user_id;`;
const getAllUsersQuery = `SELECT * FROM "user";`;
const getAllUsersByStatusQuery = `SELECT * FROM "user" WHERE status_id = $1;`;
const getEmailQuery = `SELECT email FROM "user" WHERE user_id = $1;`;
const getUserTypeQuery = `SELECT user_type_id FROM "user" WHERE user_id = $1;`;
const getUserByIdQuery = `
  SELECT 
    u.*, 
    ut.name as user_type_name,
    st.name as status_name
  FROM 
    "user" u
  JOIN 
    "user_type" ut
  ON 
    u.user_type_id = ut.id 
  JOIN
    "status_name" st
  ON
    u.status_id = st.id
  WHERE 
    u.user_id = $1;
`;

const addVerificationEmailTokenQuery = `INSERT INTO "email_verification" (user_id, confirmation_token) VALUES ($1, $2) returning user_id;`;
const getUserIdQuery = `SELECT user_id, created_at FROM email_verification WHERE confirmation_token = $1;`;
const updateUserStatusQuery = `UPDATE "user" SET status_id = $2 WHERE user_id = $1`;
const updateEmailVerificationQuery = `UPDATE "email_verification" SET confirmed = true WHERE user_id = $1`;
const checkUserQuery = `SELECT * FROM "user" WHERE email = $1;`;
const changePasswordQuery = `UPDATE "user" SET password = $1 WHERE user_id = $2;`;
const updateEmailVerificationTokenQuery = `UPDATE "email_verification" SET confirmation_token = $2, created_at = $3 WHERE user_id = $1;`;
const completeRegistrationQuery = `UPDATE "user" SET name = $1, address = $2, phone = $3, link= $4, logo_id = $5, main_photo_id = $6, document_id = $7, cif = $8, contracturl = $9, description = $10 WHERE user_id = $11;`;

module.exports = {
  addUserQuery,
  getAllUsersQuery,
  addVerificationEmailTokenQuery,
  updateUserStatusQuery,
  updateEmailVerificationQuery,
  checkUserQuery,
  changePasswordQuery,
  getUserIdQuery,
  updateEmailVerificationTokenQuery,
  completeRegistrationQuery,
  getEmailQuery,
  getUserTypeQuery,
  getAllUsersByStatusQuery,
  getUserByIdQuery,
};
