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

        // --- BUSCAR ESTATÍSTICAS (GET) ---
        if (req.method === 'GET') {
            const { action } = req.query;

            if (action === 'stats') {
                const totalEmpresas = await db.collection("empresas").countDocuments();
                const empresasAtivas = await db.collection("empresas").countDocuments({ status: 'aprovado', ativa: true });
                const empresasBloqueadas = await db.collection("empresas").countDocuments({ ativa: false });

                const totalPosts = await db.collection("posts").countDocuments();
                const postsAprovados = await db.collection("posts").countDocuments({ status: 'aprovado' });
                const postsPendentes = await db.collection("posts").countDocuments({ status: 'pendente' });

                const totalUsuarios = await db.collection("usuarios").countDocuments();
                const totalAdmins = await db.collection("usuarios").countDocuments({ is_admin: true });

                return res.status(200).json({
                    total_empresas: totalEmpresas,
                    empresas_ativas: empresasAtivas,
                    empresas_bloqueadas: empresasBloqueadas,
                    total_posts: totalPosts,
                    posts_aprovados: postsAprovados,
                    posts_pendentes: postsPendentes,
                    total_usuarios: totalUsuarios,
                    total_admins: totalAdmins
                });
            }

            if (action === 'logs') {
                const logs = await db.collection("admin_logs")
                    .find()
                    .sort({ created_at: -1 })
                    .limit(100)
                    .toArray();
                return res.status(200).json(logs);
            }

            if (action === 'usuarios') {
                const usuarios = await db.collection("usuarios")
                    .find()
                    .project({ senha: 0 }) // Nunca retornar a senha
                    .sort({ created_at: -1 })
                    .toArray();

                const formatados = usuarios.map(u => ({
                    ...u,
                    id: u._id.toString(),
                    _id: undefined
                }));

                return res.status(200).json(formatados);
            }
        }

        // --- MÉTODOS DE ATUALIZAÇÃO (PATCH) ---
        if (req.method === 'PATCH') {
            const { action, id } = req.query;

            if (action === 'toggle_admin') {
                const user = await db.collection("usuarios").findOne({ _id: new ObjectId(id as string) });
                if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

                const novoStatus = !user.is_admin;
                await db.collection("usuarios").updateOne(
                    { _id: new ObjectId(id as string) },
                    { $set: { is_admin: novoStatus, updated_at: new Date() } }
                );

                return res.status(200).json({ message: `Status admin alterado para ${novoStatus}` });
            }
        }

        // --- MÉTODOS DE EXCLUSÃO (DELETE) ---
        if (req.method === 'DELETE') {
            const { action, id } = req.query;

            if (action === 'usuario') {
                const result = await db.collection("usuarios").deleteOne({ _id: new ObjectId(id as string) });
                if (result.deletedCount === 0) return res.status(404).json({ message: "Usuário não encontrado" });
                return res.status(200).json({ message: "Usuário excluído" });
            }
        }

        // --- REGISTRAR LOG (POST) ---
        if (req.method === 'POST') {
            const log = req.body;
            const novoLog = {
                ...log,
                created_at: new Date()
            };
            const result = await db.collection("admin_logs").insertOne(novoLog);
            return res.status(201).json({ ...novoLog, id: result.insertedId.toString() });
        }

        return res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error: any) {
        console.error('Erro na API de admin:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}
