import 'dotenv/config'
import { env } from "process";
import app from "./app"
import { sequelize } from "./dbConnection";


const port = env.PORT? env.PORT : "3000";

let runApp = async(): Promise<void>  => {
try {
	//connect to db
	await sequelize.authenticate();
	//sync models
	await sequelize.sync({});
	app.listen(port, (): void => {
		console.log(`Connected successfully on port ${port}`);
	});
} catch (error: any) {
	console.error(`Error occured: ${error.message}`);
}
}

runApp()
