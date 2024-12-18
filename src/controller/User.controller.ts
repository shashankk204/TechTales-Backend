import { Context } from "hono";
import { Bindings } from "../utils/types";
import { getPrisma } from "../utils/getprisma";
import { Jwt } from "hono/utils/jwt";
import bcryptjs from "bcryptjs"
import { signinSchema, signupSchema } from "@shashankk204/techtales";

export const signup=async (c:Context<Bindings>)=>{
    const prisma=getPrisma(c.env.DATABASE_URL);
    let data=await c.req.json();

    let typeCheck=signupSchema.safeParse(data);
    if(!typeCheck.success) return c.json({"error":typeCheck.error});

    let email=data.email;
    let password=data.password;
    let name=data.name; 

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword=await bcryptjs.hash(password,salt);
    
    try 
    {
        let newuser=await prisma.user.create({data:{
            email:email,
            password:hashedPassword,
            name:name
        }});

        console.log(newuser);
        const token=await Jwt.sign({id:newuser.id},c.env.JWT_SECRET);
        return c.json({"Authorization":token});

    } 
    catch (error) 
    {
        // console.log(error.message);
        return c.json({"error":"User Already exists"},403)
    }

}



export const signin=async (c:Context<Bindings>)=>{
    const prisma=getPrisma(c.env.DATABASE_URL);
    
    
    let data = await c.req.json();
    const typeCheck=signinSchema.safeParse(data);
    if(!typeCheck.success) return c.json({"error":typeCheck.error});

    let email=data.email;
    let password=data.password;

    
    const userdata=await prisma.user.findUnique({where:{email:email}});
    if(!userdata) return c.json({"error":"invalid Credintials"});

    let checkpassword=await bcryptjs.compare(password,userdata.password);
    if(!checkpassword) return c.json({"error":"invalid credentials"});

    const token=await Jwt.sign({id:userdata?.id},c.env.JWT_SECRET);//must from the id of the user
    return c.json({"Authorization":token});
    

}



// [
//     {
//         "id": "000bdc23-5548-4bc1-851b-ab35fea043c5",
//         "email": "test@gmail.com",
//         "name": "testAcc",
//         "password": "12345678"
//     },
