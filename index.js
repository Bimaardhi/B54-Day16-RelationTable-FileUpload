// import

const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const { title } = require("process");
const config = require("./config/config.json");
const {Sequelize, QueryTypes, where} = require("sequelize");
const sequelize = new Sequelize(config.development);
const projectModel = require("./models").tb_project; 
const User = require("./models").user  
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const postimages = require("./middleware/uploadimage");

// setting variable global
app.set('view engine', 'hbs');
app.set("views", path.join(__dirname, "./views"))

app.use("/asset", express.static(path.join(__dirname, "./asset")));
app.use("/postimage", express.static(path.join(__dirname, "./postimage")));

app.use(express.urlencoded({ extended: false }))

app.use(session({
    username: "sessionsaya",
    secret: "jangan kesini bang",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}))

app.use(flash())

//routing

app.get("/", home);
app.get("/detail", detail);
app.get("/addmyproject", addMyProject);
app.get("/edit/:id", editProject);
app.post("/detail", postimages.single("image"), addetail);
app.get("/project/:id", project);
app.post("/delete/:id", deleteProject);
app.post("/edit", editNew);
app.get("/login", menuLogin);
app.get("/register", menuRegister);
app.post("/login", login);
app.post("/register", register);
app.post("/logout", logout);


// service
function menuLogin(req,res) {
    res.render("login")
}

async function logout(req,res) {
    req.session.destroy(function(err) {
        if(err) return console.error("gagal log out!")
        console.log("log out berhasil")

        res.redirect("/")
    })

      
}

async function login(req,res) {
    const { email, pasword } = req.body;

    const user = await User.findOne({
        where: { email },
    });

    if(!user) {
        req.flash("failed", "email not found!")
        return res.redirect("/login")
    }

    if(!user) return console.error("email gagal bro")

    const isPaswordsucces = await bcrypt.compare(pasword, user.pasword)

    if(!isPaswordsucces) {
        req.flash("failed", "password not found")
        return res.redirect("/login")
    }
    
    if(!isPaswordsucces) return console.error("pasword gagal bro")

    req.session.loginUser = true
    req.session.user = {
        id: user.id,
        name : user.username,
        email : user.email
    }

    req.flash("selamat", "login berhasil")


    res.redirect("/")

}

function menuRegister(req,res) {
    res.render("register")
}

async function register(req,res) {
    const {username, email, pasword} = req.body

   const salt = 10

   const hashpasword = await bcrypt.hash(pasword, salt)

    await User.create({
    username,
    email,
    pasword: hashpasword
   })

   res.redirect("/")

}


function home(req, res) {

    res.render("index")
}

async function detail(req, res) {

    const query = 'SELECT public.tb_projects.id, public.tb_projects.title, public.tb_projects.content, public.tb_projects.image, public.tb_projects."createdAt", public.users.username FROM public.users JOIN public.tb_projects ON public.users.id = public.tb_projects.user_id;'
    const data = await sequelize.query(query, {type: QueryTypes.SELECT})

    // const data = await projectModel.findAll()
    const loginUser = req.session.loginUser
    const user = req.session.user

    console.log(loginUser, user)

    res.render("detail", { data, loginUser, user });
}

async function addetail(req, res) {

    const {title, content, } = req.body;

    const image = req.file.path

    console.log("gambarnya" , image)
    // const query = `INSERT INTO tb_projects(title,content,image,"createdAt","updatedAt") VALUES('${title}','${content}','https://images.pexels.com/photos/296301/pexels-photo-296301.jpeg?auto=compress&cs=tinysrgb&w=300', now(), now())`;
    

    // const data = await sequelize.query(query, {type :QueryTypes.INSERT})

    const userId = req.session.user.id
    console.log("usernya", userId)

    await projectModel.create({
        title,
        content,
        image,
        user_id: userId
    });

    res.redirect("detail")
}


async function project(req, res) {

    const { id } = req.params

    const query = `SELECT * FROM tb_projects WHERE id=${id}`
    const data = await sequelize.query(query, {type: QueryTypes.SELECT})
    
    // const data = await projectModel.findOne({
    //     where: { id },
    // });
    // res.render("project", { data: data })
    
    res.render("project", { data: data[0] })
}

function addMyProject(req, res) {

    res.render("addmyproject")
}


async function deleteProject(req, res) {
    const { id } = req.params;

    const query = `DELETE FROM tb_projects WHERE id=${id}`;
  const data = await sequelize.query(query, { type: QueryTypes.DELETE });

    // console.log("id yg di delete", id);
    // data.splice(id, 1)
    res.redirect("/detail")
}

async function editProject(req, res) {
    const { id } = req.params;

    const data = await projectModel.findOne ({
        where: { id },
    });

    res.render("edit", { data });
}

async function editNew(req, res) {
    const { title, content, id } = req.body;

    const query  = `UPDATE tb_projects SET title='${title}', content='${content}' WHERE id=${id}`
    const data = await sequelize.query(query, {type: QueryTypes.UPDATE})

    // const data = await projectModel({
    //     title,
    //     content,
    //     where: { id },
    // })

    res.redirect("/detail")
}

app.listen(port, () => {
    console.log('example app listening on PORT:', port)
})