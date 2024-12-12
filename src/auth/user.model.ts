export interface BaseUser {
  admin_id: number;
  created_at: Date;
  email: string;
  name: string;
  password: string;
  status: boolean;
}

// interface Admin extends BaseUser {
//   last_login_at: Date;
// }

// // Teacher-specific properties
// interface Teacher extends BaseUser {
//   college: string;
//   subject: string;
//   teacher_id: number;
// }
