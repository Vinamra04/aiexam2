const Pool = require('pg-pool');

const pool = new Pool({
  connectionString:
    'postgresql://ai_exam_owner:Xn4VJgq7FATr@ep-lucky-leaf-a1izbhv0.ap-southeast-1.aws.neon.tech/ai_exam?sslmode=require',
});
pool.on('error', (err) => console.error(err)); // don't let a pg restart kill your app

export default pool;
