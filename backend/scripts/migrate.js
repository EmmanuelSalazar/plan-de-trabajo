const { sequelize } = require('../models');

async function migrate() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('🔄 Sincronizando modelos...');
    
    // Sincronizar modelos (crear tablas)
    await sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados correctamente.');

    console.log('🎉 Migración completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

migrate();