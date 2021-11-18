import express, { Application, ErrorRequestHandler } from "express";
import cors from 'cors';
import router from "./routes";

const app: Application = express();

//CORS
app.use(cors());
// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", router)

app.get('*', function(req, res){
    res.status(404).json({message: "not fount",	 errors: ["route you are looking for is not available on our server"]});
});

app.use(function (err, req, res, next) {
	//let dev know error
	console.error(err.stack)
	res.status(400).json({message: "error", errors: ["invalid request sent, check that you are submiting a properly formatted request"]})
  }  as ErrorRequestHandler)

  export default app
