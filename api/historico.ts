import clientPromise from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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

        // --- BUSCAR HISTÓRICO (GET) ---
        if (req.method === 'GET') {
            const { user_id, user_identifier, limite } = req.query;

            let query: any = {};
            if (user_id) {
                query.user_id = user_id;
            } else if (user_identifier) {
                query.user_identifier = user_identifier;
            } else {
                return res.status(400).json({ message: "user_id ou user_identifier é obrigatório" });
            }

            const historico = await db.collection("historico")
                .find(query)
                .sort({ visualizado_em: -1 })
                .limit(parseInt(limite as string) || 20)
                .toArray();

            return res.status(200).json(historico);
        }

        // --- ADICIONAR AO HISTÓRICO (POST) ---
        if (req.method === 'POST') {
            const item = req.body;

            const novoItem = {
                ...item,
                visualizado_em: new Date()
            };

            const result = await db.collection("historico").insertOne(novoItem);
            return res.status(201).json({ ...novoItem, id: result.insertedId.toString() });
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error: any) {
        console.error('Erro na API de histórico:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}
