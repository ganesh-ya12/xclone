import {db} from './src/config/db'
import { userTable } from './src/models/userTable'
import { config } from 'dotenv'
config()
async function main() {
   await db.insert(userTable).values({
        id:"123",
        username:"ganesh",
        password:"hello",
    })
   const user= await db.query.userTable.findFirst();
  console.log(user);
}