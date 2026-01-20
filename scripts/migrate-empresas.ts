/**
 * Script de migração de dados mock para Supabase
 * Execute: npm run migrate:empresas
 */

import { supabase, criarEmpresa } from './src/lib/supabase'
import { EMPRESAS } from './src/lib/empresas'

async function migrarEmpresas() {
  console.log('🚀 Iniciando migração de empresas...')
  console.log(`📦 Total de empresas: ${EMPRESAS.length}`)

  let sucesso = 0
  let erros = 0

  for (const empresa of EMPRESAS) {
    try {
      // Buscar ID da categoria pelo nome
      const { data: categoria } = await supabase
        .from('categorias')
        .select('id')
        .eq('nome', empresa.categoria)
        .single()

      const empresaData = {
        nome: empresa.nome,
        slug: empresa.nome.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        descricao: empresa.descricao,
        categoria_id: categoria?.id,
        endereco: empresa.endereco,
        bairro: empresa.bairro,
        cidade: 'Guaíra',
        estado: 'SP',
        latitude: empresa.lat,
        longitude: empresa.lng,
        telefone: empresa.telefone,
        whatsapp: empresa.whatsapp,
        email: empresa.email,
        site: empresa.site,
        imagens: empresa.imagens,
        status: 'aprovado', // Aprovar automaticamente na migração
        verificado: true,
        destaque: false,
      }

      const resultado = await criarEmpresa(empresaData)

      if (resultado) {
        sucesso++
        console.log(`✅ ${empresa.nome}`)
      } else {
        erros++
        console.log(`❌ Erro ao migrar: ${empresa.nome}`)
      }
    } catch (error) {
      erros++
      console.error(`❌ Erro ao migrar ${empresa.nome}:`, error)
    }
  }

  console.log('\n📊 Resumo da migração:')
  console.log(`✅ Sucesso: ${sucesso}`)
  console.log(`❌ Erros: ${erros}`)
  console.log(`📦 Total: ${EMPRESAS.length}`)
}

// Executar
migrarEmpresas()
  .then(() => {
    console.log('\n✨ Migração concluída!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error)
    process.exit(1)
  })
