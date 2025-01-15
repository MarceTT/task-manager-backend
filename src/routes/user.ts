import { Router } from "express";
import { allUsers, getAssiganblesUsers } from "../controllers/user";

const userRouter = Router();


userRouter.get("/all-users", allUsers);
userRouter.get("/assignables-users", getAssiganblesUsers);


export default userRouter;