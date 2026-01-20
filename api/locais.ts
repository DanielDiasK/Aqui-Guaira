import clientPromise from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await clientPromise;
        const db = client.db("empresas");

        if (req.method === 'GET') {
            const { slug, id } = req.query;

            if (id) {
                const local = await db.collection("locais_turisticos").findOne({ _id: new ObjectId(id as string) });
                return res.status(200).json(local);
            }

            if (slug) {
                const local = await db.collection("locais_turisticos").findOne({ slug, status: 'ativo' });
                return res.status(200).json(local);
            }

            const locais = await db.collection("locais_turisticos")
                .find({ status: 'ativo' })
                .sort({ nome: 1 })
                .toArray();

            return res.status(200).json(locais);
        }

        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error: any) {
        console.error('Erro na API de locais:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}
