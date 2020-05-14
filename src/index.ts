// Server
import Koa from 'koa'
const app = new Koa();

// http body parser
import bodyparser from 'koa-bodyparser'
app.use(bodyparser())

// Databasec
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
const adapter = new FileSync('res/db.json')
const auth_adapter=new FileSync('res/db1.json')
const db = low(adapter)
const db1=low(auth_adapter)
const adapter1 = new FileSync('res/db_u1.json')
const db_user1=low(adapter1);
const adapter2 = new FileSync('res/db_u2.json')
const db_user2=low(adapter2);
const adapter3 = new FileSync('res/db_u3.json')
const db_user3=low(adapter3);
interface IContact {
  id: number
  firstname: string
  lastname: string
  phone: string
  email: string
}

interface iusers{
  username: string
  password: string
  token : string
}
// Templates
import Pug from 'koa-pug'
new Pug({
  viewPath: './res/views',
  basedir: './res/views',
  app: app
});

//session tokens list
var index_token=1;
var curr_name="";
//import cookie from 'koa-cookie'
//app.use(cookie());
// Router
import Router from '@koa/router'
const router = new Router();
//for session
router.get('/', async (ctx) => {

  if( ctx.cookies.get(curr_name)==undefined)
  await ctx.redirect('/login')
  else{
  console.log(ctx.cookies.get(curr_name.toString()))
  const contacts = db.get('contacts').value()
  await ctx.render('index', { contacts })}
});


router.post('/login',async (ctx) =>{
  const body1=ctx.request.body
  let uname=body1.email
  let pass=body1.password
  //console.log(uname)
  //console.log(pass)
  const users: iusers[]=db1.get('users').value()
  let temp: boolean = false
  outer:for (var i in users) {
    if( users[i].username==uname && users[i].password==pass)
    {
      console.log("sucess")
      //users[i].token=index_token.toString()
      //index_token++
      db1.setState({ users}).write()
      curr_name=uname;
      ctx.cookies.set(uname.toString(),uname)
      await ctx.redirect('/',{})
        temp=true;
      break outer
      }
    
  }
 
 if(!temp)
 {console.log("failed")
 await ctx.render('login')
 }
  
  }
  );

  router.get('/login',async (ctx) =>{
    await ctx.render('login')
    }
    );


router.post('/:id/delete', async (ctx) => {
  if( ctx.cookies.get(curr_name)==undefined)
  await ctx.redirect('/login')
 { 
  db.get('contacts').remove({ id: +ctx.params.id }).write()
  await ctx.redirect('/')
}
});

router.post('/', async (ctx) => {
  // get all contacts
 const contacts: IContact[] = db.get('contacts').value()

  // get the max id
  const maxId = contacts.reduce((prev, curr) => {
   return Math.max(prev, curr.id)
  }, 0)


if(ctx.cookies.get(curr_name.toString())=="vineeth")
{
  const contacts1: IContact[] = db_user1.get('contacts1').value()

  // get the max id
  const maxId1 = contacts1.reduce((prev, curr) => {
    return Math.max(prev, curr.id)
  }, 0)
  // create new contact
  contacts1.push({
    ...ctx.request.body,
    id: maxId1 +1
  })
 // write to db
  db_user1.setState({ contacts1 }).write()
}


/*if(ctx.cookies.get(curr_name.toString())=="vineeth1")
{
  const contacts2: IContact[] = db_user1.get('contacts2').value()

  // get the max id
  const maxId1 = contacts2.reduce((prev, curr) => {
    return Math.max(prev, curr.id)
  }, 0)
  // create new contact
  contacts2.push({
    ...ctx.request.body,
    id: maxId1 +1
  })
 // write to db
  db_user2.setState({ contacts2 }).write()
}*/


  await ctx.redirect('/')
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const PORT = 3000
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`)
});
