
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://danieldias_db_user:xgZF8XY7HU8lQI3D@aqui-guaira.xw7piti.mongodb.net/empresas?retryWrites=true&w=majority&appName=Aqui-Guaira";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI && !uri) {
    throw new Error('Please add your Mongo URI to .env.local');
}

const finalUri = process.env.MONGODB_URI || uri;

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        console.log('🔄 Criando nova conexão MongoDB (development)...');
        client = new MongoClient(finalUri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    console.log('🔄 Criando nova conexão MongoDB (production)...');
    client = new MongoClient(finalUri, options);
    clientPromise = client.connect()
        .then(client => {
            console.log('✅ MongoDB conectado com sucesso!');
            return client;
        })
        .catch(error => {
            console.error('❌ Erro ao conectar MongoDB:', error);
            throw error;
        });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
