import clientPromise from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST,DELETE');
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

        // --- BUSCAR POSTS (GET) ---
        if (req.method === 'GET') {
            const { action, postId, limite, admin, empresaId } = req.query;

            if (action === 'comentarios') {
                if (!postId) return res.status(400).json({ message: "postId é obrigatório" });
                const comentarios = await db.collection("comentarios")
                    .find({ post_id: postId, status: 'aprovado' })
                    .sort({ created_at: 1 })
                    .toArray();
                return res.status(200).json(comentarios);
            }

            // Padrão: buscar posts
            let query: any = {};
            if (empresaId) {
                query.empresa_id = empresaId;
            }
            if (req.query.userId) {
                query.user_id = req.query.userId;
            }
            if (admin !== 'true' && !empresaId && !req.query.userId) {
                query.status = 'aprovado';
            }

            const posts = await db.collection("posts")
                .find(query)
                .sort({ created_at: -1 })
                .limit(parseInt(limite as string) || 50)
                .toArray();

            const formattedPosts = posts.map(post => ({
                ...post,
                id: post._id.toString()
            }));

            return res.status(200).json(formattedPosts);
        }

        // --- MÉTODOS DE ATUALIZAÇÃO (PATCH) ---
        if (req.method === 'PATCH') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ message: "ID do post é obrigatório" });

            const updateData = req.body;
            delete updateData.id;
            delete updateData._id;

            const result = await db.collection("posts").updateOne(
                { _id: new ObjectId(id as string) },
                { $set: { ...updateData, updated_at: new Date() } }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Post não encontrado" });
            }

            return res.status(200).json({ message: "Post atualizado com sucesso" });
        }

        // --- CRIAR POST OU COMENTÁRIO (POST) ---
        if (req.method === 'POST') {
            const { action } = req.query;
            const data = req.body;

            if (action === 'comentario') {
                const novoComentario = {
                    ...data,
                    status: 'aprovado',
                    created_at: new Date()
                };
                const result = await db.collection("comentarios").insertOne(novoComentario);
                return res.status(201).json({ ...novoComentario, id: result.insertedId.toString() });
            }

            // Padrão: criar post
            const novoPost = {
                ...data,
                status: 'pendente',
                created_at: new Date(),
                visualizacoes: 0
            };
            const result = await db.collection("posts").insertOne(novoPost);
            return res.status(201).json({ ...novoPost, id: result.insertedId.toString() });
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error: any) {
        console.error('Erro na API de posts:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}
