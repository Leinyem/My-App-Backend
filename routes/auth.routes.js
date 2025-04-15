const router = require("express").Router();
const bcryptjs = require ('bcryptjs');
const UserModel = require("../models/User.model");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../Middlewares/jwt.middleware");

// 1. ROUTE to create user with hashed password

router.post('/signUp', async (req, res)=>{

try{

const salt = bcryptjs.genSaltSync(12);
const hashedPassword = bcryptjs.hashSync(req.body.password, salt);
const hashedUser = {
    ...req.body,
    password: hashedPassword
}

//creating user in DB

const newUser = await UserModel.create(hashedUser);
console.log("User created!", newUser);

res.status(201).json({ message: "User created in DB"});

} catch (error) {

    console.log(error)

    res.status(500).json(error)
}
});

// 2. ---> LogIn ROUTE to find the user by their EMAIL and check PASSWORD (Logically!!)

router.post('/logIn', async (req, res)=>{

    try{
        //first---> Find user by email

        const foundUser = await UserModel.findOne({email: req.body.email})
        if(!foundUser){
            res.status(400).json({errorMessage: 'Email not found'})
        }
        else{
              //if we found the user based on email---->COMPARE PASSWORDS
              
              const passwordFromFrontend = req.body.password;
              const passwordHashedInDB = foundUser.password;
              const passwordsMatch = bcryptjs.compareSync(
                
                passwordFromFrontend,
                passwordHashedInDB
              );

              console.log("passwords match!", passwordsMatch)
    

        if(!passwordsMatch){

            res.status(400).json({errorMessage: 'Incorrect Password'})
       
        } else{

            //non secret data to put into our TOKEN:

            const data = {_id: foundUser._id}

            const authToken = jwt.sign(data, process.env.TOKEN_SECRET, {algorithm: 'HS256' , expiresIn: '24h'})

            res.status(200).json({errorMessage: "You logged in", authToken})
        }}
         
    } catch (error) {
    
        console.log(error)
    
        res.status(500).json(error)
    }
    });

    
    router.get('/profile/:userId', async(req,res)=>{


        try{

            const currentUser = await UserModel.findById(req.params.userId).select('-password -__v -createdAt -updatedAt').populate( "createdBooks borrowedBooks")
            res.status(200).json(currentUser);
        }

        catch(err){
            console.log(err)
            res.status(500).json({errorMessage: "Couldn't get user profile!"})
        }
    });




    //ROUTE to check token and validating it

    router.get('/verify', isAuthenticated , async(req,res)=>{

      try {

           const currentUser = await UserModel.findById(req.payload._id).select('-password -__v -createdAt -updatedAt').populate( "createdBooks borrowedBooks")
           res.status(200).json({ message: "Nice Token!", payload: currentUser});
        
      } catch (error) {
        
        console.log(error)
        res.status(500).json({ errorMessage: "Couldn't verify token!" });
      }

        
    });




module.exports = router;
