// src/server.ts
import  Express  from 'express'; // Adjust the path based on your project structure
import userRouter from './src/routes/userRouter'; // Adjust the path based on your project structure
import cookieParser from 'cookie-parser';
import postRouter from './src/routes/postRouter';
import commentRouter from "./src/routes/comemntRouter";
const app =  Express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(Express.json());
app.use(cookieParser());

// Routes
app.use('/user', userRouter);
app.use('/post',postRouter)
app.use('/comment',commentRouter);


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
