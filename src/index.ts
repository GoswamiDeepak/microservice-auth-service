import app from './app';
import { Config } from './config';

const startServer = async () => {
    const PORT = Config.port;
    try {
        app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

startServer();
