import clientPromise from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
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

        // --- BUSCAR FAVORITOS (GET) ---
        if (req.method === 'GET') {
            const { user_id, user_identifier, tipo } = req.query;

            let query: any = {};
            if (user_id) {
                query.user_id = user_id;
            } else if (user_identifier) {
                query.user_identifier = user_identifier;
            } else {
                return res.status(400).json({ message: "user_id ou user_identifier é obrigatório" });
            }

            if (tipo) query.tipo = tipo;

            const favoritos = await db.collection("favoritos")
                .find(query)
                .sort({ created_at: -1 })
                .toArray();

            return res.status(200).json(favoritos);
        }

        // --- ADICIONAR FAVORITO (POST) ---
        if (req.method === 'POST') {
            const favorito = req.body;

            // Verificar se já existe (evitar duplicatas)
            const query: any = {
                item_id: favorito.item_id,
                tipo: favorito.tipo
            };

            if (favorito.user_id) {
                query.user_id = favorito.user_id;
            } else {
                query.user_identifier = favorito.user_identifier;
            }

            const existing = await db.collection("favoritos").findOne(query);
            if (existing) {
                return res.status(200).json(existing);
            }

            const novoFavorito = {
                ...favorito,
                created_at: new Date()
            };

            const result = await db.collection("favoritos").insertOne(novoFavorito);
            return res.status(201).json({ ...novoFavorito, id: result.insertedId.toString() });
        }

        // --- REMOVER FAVORITO (DELETE) ---
        if (req.method === 'DELETE') {
            const { user_id, user_identifier, tipo, item_id } = req.query;

            const query: any = { tipo, item_id };
            if (user_id) {
                query.user_id = user_id;
            } else {
                query.user_identifier = user_identifier;
            }

            const result = await db.collection("favoritos").deleteOne(query);
            return res.status(200).json({ success: true, deletedCount: result.deletedCount });
        }

        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error: any) {
        console.error('Erro na API de favoritos:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}
