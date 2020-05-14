"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Server
const koa_1 = __importDefault(require("koa"));
const app = new koa_1.default();
// http body parser
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
app.use(koa_bodyparser_1.default());
// Databasec
const lowdb_1 = __importDefault(require("lowdb"));
const FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
const adapter = new FileSync_1.default('res/db.json');
const auth_adapter = new FileSync_1.default('res/db1.json');
const db = lowdb_1.default(adapter);
const db1 = lowdb_1.default(auth_adapter);
const adapter1 = new FileSync_1.default('res/db_u1.json');
const db_user1 = lowdb_1.default(adapter1);
const adapter2 = new FileSync_1.default('res/db_u2.json');
const db_user2 = lowdb_1.default(adapter2);
const adapter3 = new FileSync_1.default('res/db_u3.json');
const db_user3 = lowdb_1.default(adapter3);
// Templates
const koa_pug_1 = __importDefault(require("koa-pug"));
new koa_pug_1.default({
    viewPath: './res/views',
    basedir: './res/views',
    app: app
});
//session tokens list
var index_token = 1;
var curr_name = "";
//import cookie from 'koa-cookie'
//app.use(cookie());
// Router
const router_1 = __importDefault(require("@koa/router"));
const router = new router_1.default();
//for session
router.get('/', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.cookies.get(curr_name) == undefined)
        yield ctx.redirect('/login');
    else {
        console.log(ctx.cookies.get(curr_name.toString()));
        const contacts = db.get('contacts').value();
        yield ctx.render('index', { contacts });
    }
}));
router.post('/login', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const body1 = ctx.request.body;
    let uname = body1.email;
    let pass = body1.password;
    //console.log(uname)
    //console.log(pass)
    const users = db1.get('users').value();
    let temp = false;
    outer: for (var i in users) {
        if (users[i].username == uname && users[i].password == pass) {
            console.log("sucess");
            //users[i].token=index_token.toString()
            //index_token++
            db1.setState({ users }).write();
            curr_name = uname;
            ctx.cookies.set(uname.toString(), uname);
            yield ctx.redirect('/', {});
            temp = true;
            break outer;
        }
    }
    if (!temp) {
        console.log("failed");
        yield ctx.render('login');
    }
}));
router.get('/login', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.render('login');
}));
router.post('/:id/delete', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.cookies.get(curr_name) == undefined)
        yield ctx.redirect('/login');
    {
        db.get('contacts').remove({ id: +ctx.params.id }).write();
        yield ctx.redirect('/');
    }
}));
router.post('/', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // get all contacts
    const contacts = db.get('contacts').value();
    // get the max id
    const maxId = contacts.reduce((prev, curr) => {
        return Math.max(prev, curr.id);
    }, 0);
    if (ctx.cookies.get(curr_name.toString()) == "vineeth") {
        const contacts1 = db_user1.get('contacts1').value();
        // get the max id
        const maxId1 = contacts1.reduce((prev, curr) => {
            return Math.max(prev, curr.id);
        }, 0);
        // create new contact
        contacts1.push(Object.assign(Object.assign({}, ctx.request.body), { id: maxId1 + 1 }));
        // write to db
        db_user1.setState({ contacts1 }).write();
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
    yield ctx.redirect('/');
}));
app
    .use(router.routes())
    .use(router.allowedMethods());
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});
//# sourceMappingURL=index.js.map