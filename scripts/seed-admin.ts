import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

// Conexão direta para o script de seed
const uri = "mongodb+srv://danieldias_db_user:xgZF8XY7HU8lQI3D@aqui-guaira.xw7piti.mongodb.net/empresas?retryWrites=true&w=majority&appName=Aqui-Guaira";
const client = new MongoClient(uri);

async function seedAdmin() {
    try {
        console.log("⏳ Conectando ao MongoDB...");
        await client.connect();
        const db = client.db("empresas");
        const usuarios = db.collection("usuarios");

        const adminEmail = "admin@aquiguaira.com";
        const adminPassword = "admin";
        const hashedSenha = await bcrypt.hash(adminPassword, 10);

        const adminUser = {
            email: adminEmail,
            nome: "Administrador Central",
            senha: hashedSenha,
            is_admin: true,
            created_at: new Date(),
            updated_at: new Date()
        };

        // Verificar se já existe
        const existing = await usuarios.findOne({ email: adminEmail });

        if (existing) {
            await usuarios.updateOne(
                { email: adminEmail },
                { $set: { is_admin: true, senha: hashedSenha, updated_at: new Date() } }
            );
            console.log("✅ Usuário admin atualizado com sucesso!");
        } else {
            await usuarios.insertOne(adminUser);
            console.log("✅ Usuário admin criado com sucesso!");
        }

        console.log("\n--- CREDENCIAIS DE ACESSO ---");
        console.log(`Email: ${adminEmail}`);
        console.log(`Senha: ${adminPassword}`);
        console.log("-----------------------------\n");

    } catch (error) {
        console.error("❌ Erro ao criar admin:", error);
    } finally {
        await client.close();
    }
}

seedAdmin();
