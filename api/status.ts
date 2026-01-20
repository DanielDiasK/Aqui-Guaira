
import clientPromise from './_lib/mongodb';

export default async function handler(req: any, res: any) {
    try {
        const client = await clientPromise;
        const db = client.db("aqui-guaira");

        // Simple ping to verify connection
        await db.command({ ping: 1 });

        res.status(200).json({
            status: 'ok',
            message: 'MongoDB Connection Successful',
            database: 'aqui-guaira'
        });
    } catch (error: any) {
        console.error('Database connection error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to connect to MongoDB',
            error: error.message
        });
    }
}
