import { config } from 'dotenv';
config();

const port = process.env.PORT;

export const Config = {
    port: port,
};
